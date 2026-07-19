import React, { useState, useRef, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

// Mocking the Cloudinary upload for the preview environment
const uploadToCloudinary = async (file) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve("https://mock-cloudinary-url.com/video.webm"), 2000);
  });
};

export default function CGHMHealthDashboard() {
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
    sugar: "", 
  });

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
  
  // Ref for Warning system
  const warningStartTimeRef = useRef(0);
  const lastBeepTimeRef = useRef(0);
  
  const videoTrackRef = useRef(null);
  const stopReasonRef = useRef("NONE");
  
  // Audio Context Ref for Beeps
  const audioCtxRef = useRef(null);

  // Wake Lock Ref
  const wakeLockRef = useRef(null);

  // Hardcoded for preview compatibility
  const API_BASE = "http://localhost:3001/api";

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
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
        console.log('Screen Wake Lock is active');
      }
    } catch (err) {
      console.error(`Wake Lock error:`, err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current !== null) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
      });
    }
  };

  // --- AUDIO BEEP LOGIC ---
  const playWarningBeep = () => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    
    try {
      const oscillator = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);
      
      oscillator.start();
      oscillator.stop(audioCtxRef.current.currentTime + 0.25); // 250ms beep
    } catch (e) {
      console.error("Audio beep failed:", e);
    }
  };

  // --- LOGIC: CAMERA & FLASH ---
  const initCamera = async () => {
    // Initialize audio context on user interaction (form submit)
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 320, height: 240 },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoTrackRef.current = stream.getVideoTracks()[0];
        
        await requestWakeLock();

        const capabilities = videoTrackRef.current.getCapabilities();
        setHasFlash(!!capabilities.torch);

        setCameraOff(false);
        updateAppState("CAMERA_ACTIVE");
        updateStatus("No finger, please place finger", "bg-[#05205A]");
        warningStartTimeRef.current = 0;
        lastBeepTimeRef.current = 0;

        processVideoFrame();
      }
    } catch (err) {
      console.error("Camera error:", err);
      updateStatus("Camera access deny ho gaya hai.", "bg-[#CC161C]");
      toast.error("Please allow camera permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (isFlashOn) toggleFlash(false);
    releaseWakeLock();

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }

    if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if ((appStateRef.current === "RECORDING" || appStateRef.current === "RECORDING_WARNING") && mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      stopReasonRef.current = "CANCEL";
      mediaRecorderRef.current.stop();
    }

    updateAppState("IDLE");
    setCameraOff(true);
    setHasFlash(false);
    videoTrackRef.current = null;
    setRecordingTime(0);
    updateStatus('Naya record banane ke liye "Camera Start Karein" par click karein', "bg-[#05205A]");
  }, [isFlashOn, updateAppState]);

  const toggleFlash = async (turnOn) => {
    if (videoTrackRef.current && videoTrackRef.current.getCapabilities().torch) {
      try {
        await videoTrackRef.current.applyConstraints({ advanced: [{ torch: turnOn }] });
        setIsFlashOn(turnOn);
      } catch (e) {
        console.error(`Flash Error:`, e);
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
      warningStartTimeRef.current = 0;

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      console.error("MediaRecorder Error:", e);
    }
  };

  // Manual STOP triggered by User
  const stopRecordingSuccess = () => {
      stopReasonRef.current = "SUCCESS";
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      warningStartTimeRef.current = 0;

      updateAppState("COOLDOWN");
      updateStatus("Recording done successfully ✓", "bg-[#12863B]");

      setTimeout(() => {
          updateAppState("MODAL_OPEN");
          setShowReferenceModal(true);
      }, 1500);
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
        diffSum += Math.abs(pixels[i] - prevPixels[i]) + Math.abs(pixels[i + 1] - prevPixels[i + 1]) + Math.abs(pixels[i + 2] - prevPixels[i + 2]);
      }
      isMotionDetected = diffSum / (totalPixels * 3) > 5.0;
    }
    prevFrameDataRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // STATE MACHINE LOGIC
    if (currentState === "COOLDOWN") {
      // Waiting phase, do nothing frame-wise
    } 
    else if (currentState === "CAMERA_ACTIVE") {
        if (isFingerDetected && !isMotionDetected) {
            updateAppState("WAITING_START");
            updateStatus("Finger steady. Press 'Start Recording' button.", "bg-[#12863B]");
        } else {
            updateStatus("No steady finger detected. Please place finger.", "bg-[#05205A]");
        }
    } 
    else if (currentState === "WAITING_START") {
        if (!isFingerDetected || isMotionDetected) {
            updateAppState("CAMERA_ACTIVE");
            updateStatus("Finger removed or moving. Please place steady finger.", "bg-[#05205A]");
        }
    } 
    else if (currentState === "RECORDING") {
        if (!isFingerDetected || isMotionDetected) {
            // Start Warning Timer
            if (warningStartTimeRef.current === 0) {
                warningStartTimeRef.current = Date.now();
            }

            // Play Beep every 1 second
            if (Date.now() - lastBeepTimeRef.current > 1000) {
                playWarningBeep();
                lastBeepTimeRef.current = Date.now();
            }

            updateStatus("Steady your finger! Warning...", "bg-orange-500");

            // Ignore warning for 5s logic -> DISMISS
            if (Date.now() - warningStartTimeRef.current > 5000) {
                stopReasonRef.current = "DISMISSED";
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.stop();
                }
                if (timerRef.current) clearInterval(timerRef.current);
                warningStartTimeRef.current = 0;
                
                updateAppState("COOLDOWN");
                updateStatus("Recording Dismissed due to movement.", "bg-[#CC161C]");
                
                // Completely stop camera and reset after 3 seconds showing error
                setTimeout(() => {
                    stopCamera();
                }, 3000);
            }
        } else {
            // Finger is steady again - clear warnings
            if (warningStartTimeRef.current !== 0) {
                warningStartTimeRef.current = 0;
                updateStatus("Recording in progress...", "bg-[#12863B]");
            }
        }
    }

    if (appStateRef.current !== "IDLE" && appStateRef.current !== "MODAL_OPEN") {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [updateAppState, stopCamera]);

  const fallbackSave = (blob, filename) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      }, 100);
  };

  const saveAndDownloadFiles = async (finalRefData = referenceData) => {
    setShowReferenceModal(false);

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const safeName = subjectData.name.replace(/[^a-zA-Z0-9]/g, "_");
    const fileNameBase = `${timestamp}_${safeName}`;

    // Added Sugar Level to headers and data
    const headers = ["Timestamp", "ID", "Name", "Age", "Gender", "Mobile", "Height(cm)", "Systolic BP", "Diastolic BP", "Pulse Rate", "Sugar Level"];
    const rowData = [
      new Date().toLocaleString().replace(/,/g, ""),
      subjectData.id, subjectData.name, subjectData.age, subjectData.gender,
      subjectData.mobile || "N/A", subjectData.height || "N/A",
      finalRefData.sys || "N/A", finalRefData.dia || "N/A", finalRefData.pulse || "N/A", finalRefData.sugar || "N/A"
    ];

    const csvContent = headers.join(",") + "\n" + rowData.join(",");
    const csvBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let ext = 'webm';
    
    // --- ASK FOR LOCATION (File System Access API) ---
    if (window.showSaveFilePicker && currentVideoBlobRef.current) {
        try {
            ext = currentVideoBlobRef.current.extension || 'webm';
            
            // 1. Save Video
            toast("Select folder to save Video...", { icon: '📁' });
            const videoHandle = await window.showSaveFilePicker({
                suggestedName: `${fileNameBase}.${ext}`,
                types: [{ description: 'Video File', accept: { [`video/${ext}`]: [`.${ext}`] } }]
            });
            const videoWritable = await videoHandle.createWritable();
            await videoWritable.write(currentVideoBlobRef.current);
            await videoWritable.close();

            // 2. Save CSV
            toast("Select folder to save Excel/CSV...", { icon: '📁' });
            const csvHandle = await window.showSaveFilePicker({
                suggestedName: `${fileNameBase}.csv`,
                types: [{ description: 'CSV File', accept: { 'text/csv': ['.csv'] } }]
            });
            const csvWritable = await csvHandle.createWritable();
            await csvWritable.write(csvBlob);
            await csvWritable.close();

            toast.success(`Dono files successfully save ho gayi hain!`);
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("File Picker error:", err);
                toast.error("File Picker fail hua, normal download shuru ho raha hai.");
                fallbackSave(csvBlob, `${fileNameBase}.csv`);
                fallbackSave(currentVideoBlobRef.current, `${fileNameBase}.${ext}`);
            } else {
                toast("Local save user dwara cancel kiya gaya.", { icon: '⚠️' });
            }
        }
    } else {
        // Fallback for browsers without File System Access API
        toast.success("Downloading files...");
        fallbackSave(csvBlob, `${fileNameBase}.csv`);
        if (currentVideoBlobRef.current) {
            ext = currentVideoBlobRef.current.extension || 'webm';
            fallbackSave(currentVideoBlobRef.current, `${fileNameBase}.${ext}`);
        }
    }

    // Completely reset the UI
    stopCamera();

    // --- Cloud Upload ---
    if (currentVideoBlobRef.current) {
      setUploading(true);
      try {
        toast.loading("🎥 Cloudinary par video auto-upload ho raha hai...", { id: "upload" });
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
        toast.error("Cloud upload fail, lekin local files check karein.", { id: "upload", duration: 5000 });
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center font-sans relative pb-10 pt-8">
      <Toaster position="top-center" reverseOrder={false} />

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
              Flash ON
            </button>
            <button onClick={() => toggleFlash(false)} className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow bg-[#CC161C] transition-opacity ${!isFlashOn ? "opacity-50 cursor-default" : "hover:opacity-90"}`}>
              Flash OFF
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-4 w-full">
          {uiAppState === "IDLE" && (
            <button onClick={() => { setSubjectData({ id: "", name: "", age: "", gender: "", mobile: "", height: "" }); setShowSubjectModal(true); }} className="flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#05205A] hover:opacity-90">
              Camera Start Karein
            </button>
          )}

          {uiAppState === "WAITING_START" && (
            <button onClick={startRecordingLogic} className="flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#12863B] animate-bounce hover:opacity-90">
              ▶ Start Recording
            </button>
          )}

          {uiAppState === "RECORDING" && (
            <button onClick={stopRecordingSuccess} className="flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#05205A] hover:bg-[#041642] transition-colors">
              ⏹ Stop Recording (Save)
            </button>
          )}

          {(uiAppState !== "IDLE" && uiAppState !== "MODAL_OPEN") && (
            <button onClick={stopCamera} disabled={uploading} className={`py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#CC161C] transition-opacity ${uploading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}>
              Cancel
            </button>
          )}
        </div>
      </div>

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
              <p className="text-sm text-gray-500 mb-6">Apni parameters niche enter karein. Location aapko next step me puchi jayegi.</p>
              <form onSubmit={(e) => { e.preventDefault(); saveAndDownloadFiles(referenceData); }} className="space-y-4 text-left max-h-[70vh] overflow-y-auto px-1">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Systolic BP</label><input type="text" placeholder="120" value={referenceData.sys} onChange={(e) => setReferenceData({ ...referenceData, sys: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Diastolic BP</label><input type="text" placeholder="80" value={referenceData.dia} onChange={(e) => setReferenceData({ ...referenceData, dia: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Pulse Rate</label><input type="text" placeholder="72" value={referenceData.pulse} onChange={(e) => setReferenceData({ ...referenceData, pulse: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Sugar Level</label><input type="text" placeholder="110" value={referenceData.sugar} onChange={(e) => setReferenceData({ ...referenceData, sugar: e.target.value })} className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none bg-green-50" /></div>
                </div>

                <div className="flex gap-3 pt-6 sticky bottom-0 bg-white z-10">
                  <button type="button" disabled={uploading} onClick={() => saveAndDownloadFiles({ sys: "", dia: "", pulse: "", sugar: "" })} className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50 text-sm">Skip & Select Location</button>
                  <button type="submit" disabled={uploading} className="flex-2 py-3 px-4 bg-[#05205A] text-white rounded-lg font-bold hover:opacity-90 flex items-center justify-center disabled:opacity-50">Save Data</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}