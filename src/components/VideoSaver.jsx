import React, { useState, useRef, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

// Mocking the Cloudinary upload for the preview environment
const uploadToCloudinary = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve("https://mock-cloudinary-url.com/video.webm"), 2000);
  });
};

export default function CGHMHealthDashboard() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("record"); // 'record' or 'edit'

  // UI States
  const [status, setStatus] = useState({
    text: 'Naya record banane ke liye "Camera Start Karein" par click karein',
    color: "bg-[#05205A]",
  });
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraOff, setCameraOff] = useState(true);
  const [hasFlash, setHasFlash] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modals visibility
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showReferenceModal, setShowReferenceModal] = useState(false);

  // Form Data States
  const [subjectData, setSubjectData] = useState({
    id: "",
    name: "",
    age: "",
    gender: "",
    mobile: "",
    height: "",
  });
  const [referenceData, setReferenceData] = useState({
    sys: "",
    dia: "",
    pulse: "",
  });

  // --- NEW SMART EDITOR STATES (PDF + EXCEL) ---
  const [pdfFileUrl, setPdfFileUrl] = useState(null);
  const [excelData, setExcelData] = useState([]); // 2D array for rows and columns
  const [loadedFileName, setLoadedFileName] = useState("");
  const [activeCell, setActiveCell] = useState({ rowIndex: null, colIndex: null });
  const [dragHoverCell, setDragHoverCell] = useState({ rowIndex: null, colIndex: null });

  // --- REFS FOR INTERNAL LOGIC ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const appStateRef = useRef("IDLE");
  const [uiAppState, setUiAppState] = useState("IDLE");
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const currentVideoBlobRef = useRef(null);
  const timerRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const motionStartTimeRef = useRef(0);
  const videoTrackRef = useRef(null);
  const stopReasonRef = useRef("NONE");
  
  // Wake Lock Ref
  const wakeLockRef = useRef(null);

  // Hardcoded for preview compatibility
  const API_BASE = "http://localhost:3001/api";

  // Dynamically load SheetJS to avoid module resolution errors in preview
  useEffect(() => {
    if (!window.XLSX) {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const updateAppState = useCallback((newState) => {
    appStateRef.current = newState;
    setUiAppState(newState);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const updateStatus = (text, bgColorClass) => {
    setStatus({ text, color: bgColorClass });
  };

  // --- WAKE LOCK LOGIC ---
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock is active - Screen will not sleep');
      }
    } catch (err) {
      console.error(`Wake Lock error: ${err.name}, ${err.message}`);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current !== null) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }
  };

  // --- LOGIC: CAMERA & FLASH ---
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 320, height: 240 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoTrackRef.current = stream.getVideoTracks()[0];
        
        await requestWakeLock(); // Prevent screen sleep on mobile

        const capabilities = videoTrackRef.current.getCapabilities();
        if (capabilities.torch) {
          setHasFlash(true);
        } else {
          setHasFlash(false);
        }

        setCameraOff(false);
        updateAppState("CAMERA_ACTIVE");
        updateStatus("No finger, please place finger", "bg-[#05205A]");
        motionStartTimeRef.current = 0;

        processVideoFrame();
      }
    } catch (err) {
      console.error("Camera error:", err);
      updateStatus("Camera access deny ho gaya hai.", "bg-[#CC161C]");
      toast.error("Please allow camera permissions. Agar iOS hai toh Safari settings check karein.");
    }
  };

  const stopCamera = useCallback(() => {
    if (isFlashOn) toggleFlash(false);
    
    releaseWakeLock(); // Release screen lock when camera stops

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }

    if (animationFrameIdRef.current)
      cancelAnimationFrame(animationFrameIdRef.current);

    if (appStateRef.current === "RECORDING" && mediaRecorderRef.current) {
      stopReasonRef.current = "CANCEL";
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }

    updateAppState("IDLE");
    setCameraOff(true);
    setHasFlash(false);
    videoTrackRef.current = null;
    setRecordingTime(0);
    updateStatus(
      "Naya record banane ke liye 'Camera Start Karein' par click karein",
      "bg-[#05205A]",
    );
  }, [isFlashOn, updateAppState]);

  const toggleFlash = async (turnOn) => {
    if (videoTrackRef.current && videoTrackRef.current.getCapabilities().torch) {
      try {
        await videoTrackRef.current.applyConstraints({
          advanced: [{ torch: turnOn }],
        });
        setIsFlashOn(turnOn);
      } catch (e) {
        console.error(`Failed to turn flash ${turnOn ? "ON" : "OFF"}:`, e);
      }
    }
  };

  const startRecordingLogic = () => {
    recordedChunksRef.current = [];
    const stream = videoRef.current.srcObject;
    try {
      let mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported('video/webm')) {
          mimeType = 'video/mp4';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (stopReasonRef.current === "SUCCESS" && recordedChunksRef.current.length > 0) {
          currentVideoBlobRef.current = new Blob(recordedChunksRef.current, { type: mimeType });
          currentVideoBlobRef.current.extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        } else {
          currentVideoBlobRef.current = null;
        }
      };

      mediaRecorder.start();
      updateAppState("RECORDING");
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error("MediaRecorder Error:", e);
    }
  };

  const processVideoFrame = useCallback(() => {
    const currentState = appStateRef.current;

    if (currentState === "IDLE" || currentState === "MODAL_OPEN") return;

    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let rSum = 0, gSum = 0, bSum = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      rSum += pixels[i];
      gSum += pixels[i + 1];
      bSum += pixels[i + 2];
    }
    const totalPixels = pixels.length / 4;
    const avgR = rSum / totalPixels;
    const avgG = gSum / totalPixels;
    const avgB = bSum / totalPixels;

    const isFingerDetected = (avgR > 70 && avgR > avgG * 1.5 && avgR > avgB * 1.5);

    let isMotionDetected = false;
    if (prevFrameDataRef.current) {
      let diffSum = 0;
      const prevPixels = prevFrameDataRef.current.data;
      for (let i = 0; i < pixels.length; i += 4) {
        diffSum +=
          Math.abs(pixels[i] - prevPixels[i]) +
          Math.abs(pixels[i + 1] - prevPixels[i + 1]) +
          Math.abs(pixels[i + 2] - prevPixels[i + 2]);
      }
      isMotionDetected = diffSum / (totalPixels * 3) > 5.0;
    }
    prevFrameDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (currentState === "COOLDOWN") {
      // Wait phase
    } else if (currentState === "CAMERA_ACTIVE" || currentState === "RECORDING") {
      if (!isFingerDetected) {
        if (currentState === "RECORDING") {
          stopReasonRef.current = "SUCCESS";
          mediaRecorderRef.current.stop();
          clearInterval(timerRef.current);

          updateAppState("COOLDOWN");
          updateStatus("Recording done successfully ✓", "bg-[#12863B]");

          setTimeout(() => {
            updateAppState("MODAL_OPEN");
            setShowReferenceModal(true);
          }, 5000);
        } else {
          updateStatus("No finger, please place finger", "bg-[#05205A]");
          motionStartTimeRef.current = 0;
        }
      } else {
        if (isMotionDetected) {
          if (motionStartTimeRef.current === 0)
            motionStartTimeRef.current = Date.now();

          if (Date.now() - motionStartTimeRef.current > 5000) {
            if (currentState === "RECORDING") {
              stopReasonRef.current = "MOTION";
              mediaRecorderRef.current.stop();
              clearInterval(timerRef.current);
            }
            updateAppState("CAMERA_ACTIVE");
            updateStatus("Too much motion. Recording suspended", "bg-[#CC161C]");
          } else {
            updateStatus("Motion detected. Please keep steady (Stationary) finger", "bg-orange-500");
          }
        } else {
          motionStartTimeRef.current = 0;
          if (currentState === "CAMERA_ACTIVE") {
            startRecordingLogic();
          }
          updateStatus("Finger detected. Recording in process", "bg-[#12863B]");
        }
      }
    }

    if (appStateRef.current !== "IDLE" && appStateRef.current !== "MODAL_OPEN") {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [updateAppState]);

  const saveAndDownloadFiles = async (finalRefData = referenceData) => {
    setShowReferenceModal(false);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const safeName = subjectData.name.replace(/[^a-zA-Z0-9]/g, "_");
    const fileNameBase = `${timestamp}_${safeName}`;

    // Download Video Locally
    if (currentVideoBlobRef.current) {
      const videoUrl = URL.createObjectURL(currentVideoBlobRef.current);
      const aVideo = document.createElement("a");
      aVideo.style.display = "none";
      aVideo.href = videoUrl;
      const ext = currentVideoBlobRef.current.extension || 'webm';
      aVideo.download = `${fileNameBase}.${ext}`;
      document.body.appendChild(aVideo);
      aVideo.click();
      setTimeout(() => {
        document.body.removeChild(aVideo);
        URL.revokeObjectURL(videoUrl);
      }, 100);
    }

    // Create and Download CSV Locally
    const headers = ["Timestamp", "ID", "Name", "Age", "Gender", "Mobile", "Height(cm)", "Systolic BP", "Diastolic BP", "Pulse Rate"];
    const rowData = [
      new Date().toLocaleString().replace(/,/g, ""),
      subjectData.id, subjectData.name, subjectData.age, subjectData.gender,
      subjectData.mobile || "N/A", subjectData.height || "N/A",
      finalRefData.sys || "N/A", finalRefData.dia || "N/A", finalRefData.pulse || "N/A",
    ];

    const csvContent = headers.join(",") + "\n" + rowData.join(",");
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const csvUrl = URL.createObjectURL(csvBlob);

    const aCsv = document.createElement("a");
    aCsv.style.display = "none";
    aCsv.href = csvUrl;
    aCsv.download = `${fileNameBase}.csv`;
    document.body.appendChild(aCsv);
    aCsv.click();
    setTimeout(() => {
      document.body.removeChild(aCsv);
      URL.revokeObjectURL(csvUrl);
    }, 100);

    stopCamera();
    toast.success(`Subject ${subjectData.name} ka local data save ho gaya!`);

    // Cloud Upload
    if (currentVideoBlobRef.current) {
      setUploading(true);
      try {
        toast.loading("🎥 Cloudinary par video upload ho raha hai...", { id: "upload" });
        const uploadedVideoUrl = await uploadToCloudinary(currentVideoBlobRef.current);
        const sellerId = localStorage.getItem("sellerId") || "guest";
        const formData = new FormData();
        formData.append("video", uploadedVideoUrl);
        formData.append("sellerId", sellerId);
        formData.append("duration", recordingTime.toString());
        formData.append("subjectName", subjectData.name);

        const response = await fetch(`${API_BASE}/videos`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(`Upload failed: ${errorBody?.error?.message || response.statusText}`);
        }
        toast.success("✅ Video successfully server par save ho gaya!", { id: "upload" });
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Cloud upload fail, lekin local files save ho chuki hain.", { id: "upload", duration: 5000 });
      } finally {
        setUploading(false);
      }
    }
  };

  // ==========================================
  // --- NEW LOGIC: SMART EDITOR (TAB 2) ---
  // ==========================================
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPdfFileUrl(fileURL);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoadedFileName("CGHM_" + file.name);

    if (!window.XLSX) {
      toast.error("Excel library load ho rahi hai, kripya 2 second ruk kar wapas upload karein.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = window.XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
        setExcelData(data);
      } catch (error) {
        console.error("Error loading Excel:", error);
        toast.error("File load karne mein error. Kripya valid Excel/CSV select karein.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const updateCellData = (rowIndex, colIndex, value) => {
    setExcelData((prev) => {
      const newData = [...prev];
      const actualRowIndex = rowIndex + 1; // +1 because index 0 is Header
      if (!newData[actualRowIndex]) newData[actualRowIndex] = [];
      newData[actualRowIndex][colIndex] = value;
      return newData;
    });
  };

  const autoAdvance = (currentRowIndex, colIndex) => {
    const nextRowIndex = currentRowIndex + 1;
    if (nextRowIndex < excelData.length - 1) {
      setActiveCell({ rowIndex: nextRowIndex, colIndex });
      setTimeout(() => {
        const nextCell = document.getElementById(`cell-${nextRowIndex}-${colIndex}`);
        if (nextCell) {
          nextCell.focus();
          nextCell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 10);
    }
  };

  const handleManualEdit = (rowIndex, colIndex, text) => {
    updateCellData(rowIndex, colIndex, text.trim());
  };

  const handlePaste = (e, rowIndex, colIndex) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    if (pastedText) {
      const cleanText = pastedText.trim();
      updateCellData(rowIndex, colIndex, cleanText);
      
      // Update DOM temporarily for immediate feedback
      e.target.innerText = cleanText;
      
      // Auto-advance
      autoAdvance(rowIndex, colIndex);
    }
  };

  const handleDrop = (e, rowIndex, colIndex) => {
    e.preventDefault();
    setDragHoverCell({ rowIndex: null, colIndex: null });
    const droppedText = e.dataTransfer.getData('text');
    if (droppedText) {
      const cleanText = droppedText.trim();
      updateCellData(rowIndex, colIndex, cleanText);
      setActiveCell({ rowIndex, colIndex });
      
      // Update DOM temporarily
      e.target.innerText = cleanText;
      
      autoAdvance(rowIndex, colIndex);
    }
  };

  const downloadExcel = () => {
    try {
      if (!window.XLSX) return;
      const worksheet = window.XLSX.utils.aoa_to_sheet(excelData);
      const workbook = window.XLSX.utils.book_new();
      window.XLSX.book_append_sheet(workbook, worksheet, "CGHM_Data");
      window.XLSX.writeFile(workbook, loadedFileName || "updated_data.xlsx");
      toast.success("Excel File successfully update aur download ho gayi hai!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("File download me problem aayi.");
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center font-sans relative pb-10">
      <Toaster position="top-center" reverseOrder={false} />

      <div className={`w-full shadow-md mb-8 flex justify-center border-b-4 border-[#12863B] sticky top-0 z-40 bg-white`}>
        <div className="flex max-w-2xl w-full">
          <button onClick={() => setActiveTab("record")} className={`flex-1 py-4 font-bold text-lg transition-colors ${activeTab === "record" ? "text-white bg-[#05205A]" : "text-gray-500 bg-gray-200 hover:bg-gray-300"}`}>
            🎥 Recording Dashboard
          </button>
          <button onClick={() => setActiveTab("edit")} className={`flex-1 py-4 font-bold text-lg transition-colors ${activeTab === "edit" ? "text-white bg-[#05205A]" : "text-gray-500 bg-gray-200 hover:bg-gray-300"}`}>
            📝 Data Editor (Smart Split)
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md w-11/12 max-w-2xl text-center border-t-8 border-[#12863B] mb-8">
        <div className="flex justify-center items-center gap-2 mb-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-[#12863B]">C</h1>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#05205A]">G</h1>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#CC161C]">H</h1>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#05205A]">M</h1>
        </div>
        <p className="text-lg font-bold uppercase tracking-wider text-[#05205A]">
          - Monitor Health Smartly -
        </p>
      </div>

      {/* TAB 1: RECORDING DASHBOARD */}
      {activeTab === "record" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-2xl flex flex-col items-center relative">
          <div className={`w-full py-6 px-4 rounded-xl text-center text-xl font-bold text-white shadow-inner mb-6 ${status.color} transition-colors duration-300`}>
            {status.text}
          </div>

          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner flex justify-center items-center mb-6 border-4 border-gray-100">
            {cameraOff && <span className="text-gray-400 font-medium text-lg">Camera off hai</span>}
            <video ref={videoRef} className={`w-full h-full object-cover ${cameraOff ? "hidden" : ""}`} playsInline muted autoPlay />
            
            {uiAppState === "RECORDING" && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full font-mono text-xl flex items-center gap-2 shadow-lg border border-red-500/50 z-10">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}
            <canvas ref={canvasRef} width="64" height="64" className="hidden" />
          </div>

          {hasFlash && (
            <div className="flex gap-2 w-full mt-2 mb-4 border-t pt-4 border-gray-100">
              <button onClick={() => toggleFlash(true)} className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow bg-[#12863B] transition-opacity ${isFlashOn ? "opacity-50 cursor-default" : "hover:opacity-90"}`}>
                Flash ON (LED)
              </button>
              <button onClick={() => toggleFlash(false)} className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow bg-[#CC161C] transition-opacity ${!isFlashOn ? "opacity-50 cursor-default" : "hover:opacity-90"}`}>
                Flash OFF
              </button>
            </div>
          )}

          <div className="flex gap-4 w-full">
            {uiAppState === "IDLE" ? (
              <button onClick={() => { setSubjectData({ id: "", name: "", age: "", gender: "", mobile: "", height: "" }); setShowSubjectModal(true); }} className="flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#05205A] hover:opacity-90">
                Camera Start Karein
              </button>
            ) : (
              <button onClick={stopCamera} disabled={uploading} className={`flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#CC161C] transition-opacity ${uploading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}>
                Cancel / Stop Process
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SMART DATA EDITOR (PDF + EXCEL) */}
      {activeTab === "edit" && (
        <div className="bg-white p-6 rounded-2xl shadow-xl w-11/12 max-w-[98%] xl:max-w-[90vw] flex flex-col lg:flex-row gap-6 mb-10 h-[80vh] min-h-[600px]">
          
          {/* LEFT PANEL: PDF VIEWER */}
          <div className="flex-1 flex flex-col border-2 border-gray-200 rounded-xl overflow-hidden relative bg-gray-50 h-full">
            <div className="bg-[#eef2f6] p-4 border-l-4 border-[#05205A] flex items-center justify-between z-10 shadow-sm">
              <h3 className="text-[#05205A] font-bold flex items-center gap-2 text-lg">📄 1. PDF Viewer</h3>
              <input type="file" accept=".pdf" onChange={handlePdfUpload} className="text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#05205A] file:text-white hover:file:bg-[#0a2f7c]" />
            </div>
            <div className="flex-1 relative w-full h-full bg-white">
               {!pdfFileUrl && <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">PDF file select karein...</div>}
               {pdfFileUrl && <iframe src={pdfFileUrl} className="w-full h-full border-none" title="PDF Viewer" />}
            </div>
          </div>

          {/* RIGHT PANEL: EXCEL EDITOR */}
          <div className="flex-1 flex flex-col border-2 border-gray-200 rounded-xl overflow-hidden relative bg-gray-50 h-full">
            <div className="bg-[#eef2f6] p-4 border-l-4 border-[#12863B] flex flex-col sm:flex-row sm:items-center justify-between z-10 gap-3 shadow-sm">
              <div>
                <h3 className="text-[#05205A] font-bold flex items-center gap-2 text-lg">📊 2. Excel Editor</h3>
                <span className="text-xs text-[#CC161C] font-semibold mt-1 block">⚡ Trick: Select in PDF &gt; Ctrl+C &gt; Click Cell &gt; Ctrl+V (ya Drag-Drop)</span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                  <input type="file" accept=".xlsx, .xls, .csv" onChange={handleExcelUpload} className="text-sm cursor-pointer w-full sm:w-48 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#12863B] file:text-white hover:file:bg-[#0f7332]" />
                  {excelData.length > 0 && (
                      <button onClick={downloadExcel} className="bg-[#12863B] text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-[#0f7332] transition shadow whitespace-nowrap">
                          💾 Save Data
                      </button>
                  )}
              </div>
            </div>
            
            <div className="flex-1 overflow-auto bg-white relative p-0 m-0">
               {excelData.length === 0 && <div className="absolute inset-0 flex items-center justify-center text-gray-400 italic">Excel ya CSV file select karein...</div>}
               
               {excelData.length > 0 && (
                   <table className="w-full border-collapse text-left">
                      <thead>
                          <tr>
                              {excelData[0].map((header, i) => (
                                  <th key={i} className="border border-gray-300 p-3 bg-[#05205A] text-white whitespace-nowrap sticky top-0 z-10 font-semibold text-sm tracking-wide">
                                      {header}
                                  </th>
                              ))}
                          </tr>
                      </thead>
                      <tbody>
                          {excelData.slice(1).map((row, rowIndex) => (
                              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                                  {excelData[0].map((_, colIndex) => {
                                      const cellValue = row[colIndex] || "";
                                      
                                      const isActive = activeCell.rowIndex === rowIndex && activeCell.colIndex === colIndex;
                                      const isDragHover = dragHoverCell.rowIndex === rowIndex && dragHoverCell.colIndex === colIndex;
                                      
                                      // CGHM Theme Conditional Classes for Cells
                                      let cellClasses = "border border-gray-300 p-3 whitespace-nowrap outline-none transition-all duration-200 text-sm ";
                                      if (isActive) {
                                          cellClasses += "bg-[#e8f5e9] outline-[3px] outline-[#12863B] outline text-black font-semibold z-10 relative ";
                                      } else if (isDragHover) {
                                          cellClasses += "bg-[#bbf7d0] border-2 border-dashed border-[#12863B] shadow-inner ";
                                      } else {
                                          cellClasses += "focus:bg-[#f0f4fa] focus:outline focus:outline-2 focus:outline-[#05205A] ";
                                      }

                                      return (
                                          <td 
                                              key={colIndex}
                                              id={`cell-${rowIndex}-${colIndex}`}
                                              className={cellClasses}
                                              contentEditable={true}
                                              suppressContentEditableWarning={true}
                                              onClick={() => setActiveCell({ rowIndex, colIndex })}
                                              onBlur={(e) => handleManualEdit(rowIndex, colIndex, e.target.innerText)}
                                              onPaste={(e) => handlePaste(e, rowIndex, colIndex)}
                                              onDragOver={(e) => { e.preventDefault(); setDragHoverCell({ rowIndex, colIndex }); }}
                                              onDragLeave={() => setDragHoverCell({ rowIndex: null, colIndex: null })}
                                              onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                                          >
                                              {cellValue}
                                          </td>
                                      )
                                  })}
                              </tr>
                          ))}
                      </tbody>
                   </table>
               )}
            </div>
          </div>

        </div>
      )}

      {/* MODALS */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-[#05205A] p-4 text-center sticky top-0 z-10"><h2 className="text-xl font-bold text-white">Subject Details</h2></div>
            <form onSubmit={(e) => { e.preventDefault(); setShowSubjectModal(false); initCamera(); }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">ID Number *</label><input type="text" required value={subjectData.id} onChange={(e) => setSubjectData({ ...subjectData, id: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Name *</label><input type="text" required value={subjectData.name} onChange={(e) => setSubjectData({ ...subjectData, name: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Age *</label><input type="number" required value={subjectData.age} onChange={(e) => setSubjectData({ ...subjectData, age: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Gender *</label>
                  <select required value={subjectData.gender} onChange={(e) => setSubjectData({ ...subjectData, gender: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none">
                    <option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Mobile (Optional)</label><input type="tel" value={subjectData.mobile} onChange={(e) => setSubjectData({ ...subjectData, mobile: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
              <div><label className="block text-sm font-bold text-gray-700 mb-1">Height cm (Optional)</label><input type="number" value={subjectData.height} onChange={(e) => setSubjectData({ ...subjectData, height: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
              <div className="flex gap-3 pt-4 mt-2 border-t sticky bottom-0 bg-white z-10">
                <button type="button" onClick={() => setShowSubjectModal(false)} className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 px-4 bg-[#12863B] text-white rounded-lg font-bold hover:opacity-90">Submit & Start</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReferenceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-8 border-[#12863B] transform transition-all">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Recording Complete!</h2>
              <p className="text-sm text-gray-500 mb-6">Aap reference values abhi enter kar sakte hain ya skip karke baad me Data Editor me daal sakte hain.</p>
              <form onSubmit={(e) => { e.preventDefault(); saveAndDownloadFiles(referenceData); }} className="space-y-4 text-left max-h-[70vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Systolic BP</label><input type="text" placeholder="e.g. 120" value={referenceData.sys} onChange={(e) => setReferenceData({ ...referenceData, sys: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Diastolic BP</label><input type="text" placeholder="e.g. 80" value={referenceData.dia} onChange={(e) => setReferenceData({ ...referenceData, dia: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
                </div>
                <div><label className="block text-sm font-bold text-gray-700 mb-1">Pulse Rate</label><input type="text" placeholder="e.g. 72" value={referenceData.pulse} onChange={(e) => setReferenceData({ ...referenceData, pulse: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
                <div className="flex gap-3 pt-6 sticky bottom-0 bg-white z-10">
                  <button type="button" disabled={uploading} onClick={() => saveAndDownloadFiles({ sys: "", dia: "", pulse: "" })} className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50">Skip & Save</button>
                  <button type="submit" disabled={uploading} className="flex-1 py-3 px-4 bg-[#05205A] text-white rounded-lg font-bold hover:opacity-90 flex items-center justify-center disabled:opacity-50">{uploading ? "Saving..." : "Save Data"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}