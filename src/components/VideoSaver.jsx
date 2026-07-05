// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
// import { storage } from "../../firebase";
// import toast from "react-hot-toast";
// import { uploadToCloudinary } from "../utils/cloudinary";
// export default function VideoSaver() {
//   const [showCamera, setShowCamera] = useState(false);
//   const [facingMode, setFacingMode] = useState("environment");
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedVideo, setRecordedVideo] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [cameraReady, setCameraReady] = useState(false);
//   const [recordingTime, setRecordingTime] = useState(0);
//   const videoRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const recordedChunksRef = useRef([]);
//   const timerRef = useRef(null);
//   const API_BASE =
//     import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";
//   // 🔥 Start Video Recording (Enhanced)
//   const startRecording = useCallback(() => {
//     if (!videoRef.current || !cameraReady) {
//       toast.error("Camera not ready");
//       return;
//     }

//     setIsRecording(true);
//     setRecordingTime(0);
//     recordedChunksRef.current = [];

//     const stream = videoRef.current.srcObject;
//     const options = {
//       mimeType: "video/webm;codecs=vp9,opus",
//     };

//     const mediaRecorder = new MediaRecorder(stream, options);
//     mediaRecorderRef.current = mediaRecorder;

//     mediaRecorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         recordedChunksRef.current.push(event.data);
//       }
//     };

//     mediaRecorder.onstop = () => {
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
//       const videoUrl = URL.createObjectURL(blob);
//       setRecordedVideo(videoUrl);
//       if (timerRef.current) clearInterval(timerRef.current);
//     };

//     mediaRecorder.start(250); // Higher quality - 250ms chunks
//     timerRef.current = setInterval(() => {
//       setRecordingTime((prev) => prev + 0.25);
//     }, 250);

//     toast.success("🎥 Recording started!");
//   }, [cameraReady]);

//   // 🔥 Stop Video Recording
//   const stopRecording = useCallback(() => {
//     if (mediaRecorderRef.current?.state === "recording") {
//       mediaRecorderRef.current.stop();
//     }
//     setIsRecording(false);
//     if (timerRef.current) clearInterval(timerRef.current);
//     toast.success(`✅ Recorded ${recordingTime.toFixed(1)}s video!`);
//   }, [recordingTime]);

//   // 🔥 Restart Recording
//   const restartRecording = useCallback(() => {
//     setRecordedVideo(null);
//     URL.revokeObjectURL(recordedVideo);
//     setIsRecording(false);
//     setRecordingTime(0);
//   }, [recordedVideo]);

//   // 🔥 Open Camera
//   const openCamera = useCallback(async () => {
//     setShowCamera(true);
//     setCameraReady(false);
//     setRecordedVideo(null);
//     toast.loading("Starting camera...", { id: "camera" });

//     try {
//       const constraints = {
//         video: {
//           facingMode: { ideal: facingMode },
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//         },
//       };

//       const stream = await navigator.mediaDevices.getUserMedia(constraints);
//       const video = videoRef.current;

//       if (video) {
//         video.srcObject = stream;
//         video.onloadedmetadata = () => {
//           video.play().then(() => {
//             setCameraReady(true);
//             toast.success("✅ Camera ready!", { id: "camera" });
//           });
//         };
//       }
//     } catch (error) {
//       console.error("Camera error:", error);
//       toast.error("❌ Camera access denied", { id: "camera" });
//       setShowCamera(false);
//     }
//   }, [facingMode]);

//   // 🔥 Close Camera
//   const closeCamera = useCallback(() => {
//     setShowCamera(false);
//     setCameraReady(false);
//     setIsRecording(false);
//     setRecordedVideo(null);
//     setRecordingTime(0);

//     if (timerRef.current) clearInterval(timerRef.current);
//     if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//     }
//   }, []);

//   const saveVideo = useCallback(async () => {
//     if (!recordedVideo) {
//       toast.error("No video recorded");
//       return;
//     }

//     setUploading(true);
//     try {
//       toast.loading("🎥 Uploading to Cloudinary...", { id: "upload" });

//       // ✅ FIX 1: Create blob from MediaRecorder chunks (not URL)
//       const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });

//       // ✅ FIX 2: Upload to Cloudinary
//       const videoUrl = await uploadToCloudinary(blob);

//       // ✅ FIX 3: Save to CORRECT backend endpoint with FormData
//       const sellerId = localStorage.getItem("sellerId") || "guest";
//       const formData = new FormData();
//       formData.append("video", videoUrl); // Backend expects 'video'
//       formData.append("sellerId", sellerId);
//       formData.append("duration", recordingTime.toFixed(1));

//       const response = await fetch(`${API_BASE}/videos`, {
//         // ← /videos not /video-save
//         method: "POST",
//         body: formData, // ← FormData, not JSON
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || "Save failed");
//       }

//       toast.success("✅ Video saved to gallery!", { id: "upload" });
//       window.location.href = "/video-gallery"; // Go to gallery
//     } catch (error) {
//       console.error("Upload error:", error);
//       toast.error(error.message || "Upload failed");
//     } finally {
//       setUploading(false);
//       toast.dismiss("upload");
//     }
//   }, [recordedVideo, recordingTime, API_BASE, recordedChunksRef]);

//   // 🔥 Switch Camera
//   const switchCamera = useCallback(async () => {
//     if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//     }

//     const newFacingMode = facingMode === "environment" ? "user" : "environment";
//     setFacingMode(newFacingMode);

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: { ideal: newFacingMode } },
//         audio: true,
//       });

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         setCameraReady(true);
//       }
//     } catch (error) {
//       toast.error("Camera switch failed");
//     }
//   }, [facingMode]);

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
//       <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200 p-8 space-y-8">
//         <div className="text-center">
//           <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
//             🎥 Pro Video Recorder
//           </h1>
//           <p className="text-gray-600 text-lg font-medium">
//             Production grade recording with timer & Firebase storage
//           </p>
//         </div>

//         {/* Recorded Video Preview */}
//         {recordedVideo && (
//           <div className="space-y-4">
//             <video
//               src={recordedVideo}
//               controls
//               className="w-full h-80 rounded-3xl shadow-2xl bg-black/20"
//             />
//             <div className="flex gap-3 justify-center">
//               <button
//                 onClick={restartRecording}
//                 className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
//               >
//                 🔄 New Recording
//               </button>
//               <button
//                 onClick={saveVideo}
//                 disabled={uploading}
//                 className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
//               >
//                 {uploading ? "⏳ Saving..." : "💾 Save to Firebase"}
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Camera Controls */}
//         {!showCamera ? (
//           <button
//             onClick={openCamera}
//             className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-8 px-12 rounded-3xl text-2xl font-black shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 mx-auto block"
//           >
//             🎥 Start Recording
//           </button>
//         ) : (
//           <div className="space-y-6">
//             {/* Clean Camera View - NO OVERLAY BUTTONS */}
//             <div className="relative bg-black/95 rounded-3xl overflow-hidden shadow-3xl">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-[500px] md:h-[600px] object-cover"
//               />

//               {/* Status Bar Only */}
//               <div className="absolute top-6 left-6 right-6 flex items-center justify-between bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/20">
//                 <div className="text-white font-bold">
//                   <span
//                     className={`px-3 py-1 rounded-full text-sm font-bold ${
//                       cameraReady ? "bg-green-500" : "bg-yellow-500"
//                     }`}
//                   >
//                     {cameraReady ? "✅ READY" : "🔄 LOADING"}
//                   </span>
//                   <div className="text-sm opacity-75 mt-1">
//                     {facingMode === "environment" ? "Back Cam" : "Front Cam"}
//                   </div>
//                 </div>

//                 {isRecording && (
//                   <div className="flex items-center gap-3">
//                     <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
//                     <span className="text-2xl font-mono text-red-400">
//                       {recordingTime.toFixed(1)}s
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Enhanced Control Panel */}
//             <div className="flex flex-col sm:flex-row gap-4 pt-6">
//               <button
//                 onClick={isRecording ? stopRecording : startRecording}
//                 disabled={!cameraReady}
//                 className={`flex-1 py-6 px-8 rounded-3xl font-black text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 ${
//                   isRecording
//                     ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-red-500/25 hover:scale-[1.02] shadow-red-500/25 animate-pulse"
//                     : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-purple-500/25 hover:scale-[1.02] shadow-purple-500/25"
//                 } disabled:opacity-50`}
//               >
//                 {isRecording ? <>⏹️ STOP</> : <>▶️ START RECORD</>}
//               </button>

//               <button
//                 onClick={switchCamera}
//                 disabled={!cameraReady || isRecording}
//                 className="px-6 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-3xl shadow-xl hover:shadow-yellow-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
//               >
//                 🔄 Switch
//               </button>
//             </div>

//             <button
//               onClick={closeCamera}
//               disabled={isRecording}
//               className="w-full py-5 bg-gradient-to-r from-slate-500 to-gray-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-gray-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
//             >
//               ❌ Close Camera
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useRef, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import { uploadToCloudinary } from "../utils/cloudinary";

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

  // CSV Editor States
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [loadedFileName, setLoadedFileName] = useState("");

  // --- REFS FOR INTERNAL LOGIC (To avoid stale closures in requestAnimationFrame) ---
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const appStateRef = useRef("IDLE"); // IDLE, CAMERA_ACTIVE, RECORDING, COOLDOWN, MODAL_OPEN
  const [uiAppState, setUiAppState] = useState("IDLE"); // For re-rendering UI buttons
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const currentVideoBlobRef = useRef(null);
  const timerRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const prevFrameDataRef = useRef(null);
  const motionStartTimeRef = useRef(0);
  const videoTrackRef = useRef(null);
  const stopReasonRef = useRef("NONE"); // NONE, SUCCESS, MOTION, CANCEL

  // Safe Environment Variable handling to avoid compilation errors in es2015 targets
  // Vite env variable handling (Vite exposes only VITE_ prefixed vars via import.meta.env)
  const API_BASE =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

  const updateAppState = useCallback((newState) => {
    appStateRef.current = newState;
    setUiAppState(newState);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const updateStatus = (text, bgColorClass) => {
    setStatus({ text, color: bgColorClass });
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
      toast.error("Please allow camera permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (isFlashOn) toggleFlash(false);

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
  }, [isFlashOn]);

  const toggleFlash = async (turnOn) => {
    if (
      videoTrackRef.current &&
      videoTrackRef.current.getCapabilities().torch
    ) {
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

  // --- LOGIC: RECORDING & PIXEL PROCESSING ---
  const startRecordingLogic = () => {
    recordedChunksRef.current = [];
    const stream = videoRef.current.srcObject;
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (
          stopReasonRef.current === "SUCCESS" &&
          recordedChunksRef.current.length > 0
        ) {
          currentVideoBlobRef.current = new Blob(recordedChunksRef.current, {
            type: "video/webm",
          });
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

    let rSum = 0,
      gSum = 0,
      bSum = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      rSum += pixels[i];
      gSum += pixels[i + 1];
      bSum += pixels[i + 2];
    }
    const totalPixels = pixels.length / 4;
    const avgR = rSum / totalPixels;
    const avgG = gSum / totalPixels;
    const avgB = bSum / totalPixels;

    const isFingerDetected =
      (avgR > 70 && avgR > avgG * 1.5 && avgR > avgB * 1.5) ||
      (avgR < 40 && avgG < 40 && avgB < 40);

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
    prevFrameDataRef.current = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    if (currentState === "COOLDOWN") {
      // Wait phase
    } else if (
      currentState === "CAMERA_ACTIVE" ||
      currentState === "RECORDING"
    ) {
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
            updateStatus(
              "Too much motion. Recording suspended",
              "bg-[#CC161C]",
            );
          } else {
            updateStatus(
              "Motion detected. Please keep steady (Stationary) finger",
              "bg-orange-500",
            );
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

    if (
      appStateRef.current !== "IDLE" &&
      appStateRef.current !== "MODAL_OPEN"
    ) {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    }
  }, [updateAppState]);

  // --- LOGIC: SAVING & UPLOADING ---
  const saveAndDownloadFiles = async (finalRefData = referenceData) => {
    setShowReferenceModal(false);

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const safeName = subjectData.name.replace(/[^a-zA-Z0-9]/g, "_");
    const fileNameBase = `${timestamp}_${safeName}`;

    // Download Video (.webm) Locally
    if (currentVideoBlobRef.current) {
      const videoUrl = URL.createObjectURL(currentVideoBlobRef.current);
      const aVideo = document.createElement("a");
      aVideo.style.display = "none";
      aVideo.href = videoUrl;
      aVideo.download = `${fileNameBase}.webm`;
      document.body.appendChild(aVideo);
      aVideo.click();
      setTimeout(() => {
        document.body.removeChild(aVideo);
        URL.revokeObjectURL(videoUrl);
      }, 100);
    }

    // Create and Download CSV Locally
    const headers = [
      "Timestamp",
      "ID",
      "Name",
      "Age",
      "Gender",
      "Mobile",
      "Height(cm)",
      "Systolic BP",
      "Diastolic BP",
      "Pulse Rate",
    ];
    const rowData = [
      new Date().toLocaleString().replace(/,/g, ""),
      subjectData.id,
      subjectData.name,
      subjectData.age,
      subjectData.gender,
      subjectData.mobile || "N/A",
      subjectData.height || "N/A",
      finalRefData.sys || "N/A",
      finalRefData.dia || "N/A",
      finalRefData.pulse || "N/A",
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

    // --- CLOUD UPLOAD LOGIC ---
    if (currentVideoBlobRef.current) {
      setUploading(true);
      try {
        toast.loading("🎥 Cloudinary par video upload ho raha hai...", {
          id: "upload",
        });

        // 1. Upload to Cloudinary
        const uploadedVideoUrl = await uploadToCloudinary(
          currentVideoBlobRef.current,
        );

        // 2. Save to Backend Database
        const sellerId = localStorage.getItem("sellerId") || "guest";
        const formData = new FormData();
        formData.append("video", uploadedVideoUrl);
        formData.append("sellerId", sellerId);
        formData.append("duration", recordingTime.toString());
        formData.append("subjectName", subjectData.name);

        // Making the API call to your backend
        const response = await fetch(`${API_BASE}/videos`, {
          method: "POST",
          body: formData,
        });

        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(errorData.error || "Save failed");
        // }
        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          console.error("Cloudinary detailed error:", errorBody);
          throw new Error(
            `Upload failed: ${errorBody?.error?.message || response.statusText}`,
          );
        }

        toast.success("✅ Video successfully server par save ho gaya!", {
          id: "upload",
        });
      } catch (error) {
        console.error("Upload error:", error);
        // We show a mild error since the backend might not be running locally in preview
        toast.error(
          "Cloud upload fail (backend check karein), lekin local files save ho chuki hain.",
          { id: "upload", duration: 5000 },
        );
      } finally {
        setUploading(false);
      }
    }
  };

  // --- LOGIC: CSV EDITOR ---
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoadedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").filter((row) => row.trim() !== "");

      if (rows.length > 0) {
        setCsvHeaders(rows[0].split(","));
        const dataRows = rows.slice(1).map((row) => row.split(","));
        setCsvData(dataRows);
      }
    };
    reader.readAsText(file);
  };

  const handleCellUpdate = (rowIndex, colIndex, newValue) => {
    const updatedData = [...csvData];
    updatedData[rowIndex][colIndex] = newValue
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/,/g, "");
    setCsvData(updatedData);
  };

  const updateAndDownloadCsv = () => {
    if (csvHeaders.length === 0) return;

    let csvContent = csvHeaders.join(",") + "\n";
    csvData.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = loadedFileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    toast.success(
      "CSV File Update ho gayi hai! Theek ki gayi file aapke Downloads folder mein aa gayi hai.",
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col items-center font-sans relative pb-10">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Top Navigation Tabs */}
      <div
        className={`w-full shadow-md mb-8 flex justify-center border-b-4 border-[#12863B] sticky top-0 z-40 bg-white`}
      >
        <div className="flex max-w-2xl w-full">
          <button
            onClick={() => setActiveTab("record")}
            className={`flex-1 py-4 font-bold text-lg transition-colors ${activeTab === "record" ? "text-white bg-[#05205A]" : "text-gray-500 bg-gray-200 hover:bg-gray-300"}`}
          >
            🎥 Recording Dashboard
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`flex-1 py-4 font-bold text-lg transition-colors ${activeTab === "edit" ? "text-white bg-[#05205A]" : "text-gray-500 bg-gray-200 hover:bg-gray-300"}`}
          >
            📝 Data Editor (CSV)
          </button>
        </div>
      </div>

      {/* Header Logo Area */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-11/12 max-w-2xl text-center border-t-8 border-[#12863B] mb-8">
        <div className="flex justify-center items-center gap-2 mb-2">
          <h1 className="text-5xl font-extrabold tracking-tight text-[#12863B]">
            C
          </h1>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#05205A]">
            G
          </h1>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#CC161C]">
            H
          </h1>
          <h1 className="text-5xl font-extrabold tracking-tight text-[#05205A]">
            M
          </h1>
        </div>
        <p className="text-lg font-bold uppercase tracking-wider text-[#05205A]">
          - Monitor Health Smartly -
        </p>
      </div>

      {/* TAB 1: RECORDING DASHBOARD */}
      {activeTab === "record" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-2xl flex flex-col items-center relative">
          <div
            className={`w-full py-6 px-4 rounded-xl text-center text-xl font-bold text-white shadow-inner mb-6 ${status.color} transition-colors duration-300`}
          >
            {status.text}
          </div>

          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-inner flex justify-center items-center mb-6 border-4 border-gray-100">
            {cameraOff && (
              <span className="text-gray-400 font-medium text-lg">
                Camera off hai
              </span>
            )}

            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${cameraOff ? "hidden" : ""}`}
              playsInline
              muted
              autoPlay
            />

            {uiAppState === "RECORDING" && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full font-mono text-xl flex items-center gap-2 shadow-lg border border-red-500/50 z-10">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                <span>{formatTime(recordingTime)}</span>
              </div>
            )}

            <canvas ref={canvasRef} width="64" height="64" className="hidden" />
          </div>

          {/* Flash Controls */}
          {hasFlash && (
            <div className="flex gap-2 w-full mt-2 mb-4 border-t pt-4 border-gray-100">
              <button
                onClick={() => toggleFlash(true)}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow bg-[#12863B] transition-opacity ${isFlashOn ? "opacity-50 cursor-default" : "hover:opacity-90"}`}
              >
                Flash ON (LED)
              </button>
              <button
                onClick={() => toggleFlash(false)}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-white shadow bg-[#CC161C] transition-opacity ${!isFlashOn ? "opacity-50 cursor-default" : "hover:opacity-90"}`}
              >
                Flash OFF
              </button>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="flex gap-4 w-full">
            {uiAppState === "IDLE" ? (
              <button
                onClick={() => {
                  setSubjectData({
                    id: "",
                    name: "",
                    age: "",
                    gender: "",
                    mobile: "",
                    height: "",
                  });
                  setShowSubjectModal(true);
                }}
                className="flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#05205A] hover:opacity-90"
              >
                Camera Start Karein
              </button>
            ) : (
              <button
                onClick={stopCamera}
                disabled={uploading}
                className={`flex-1 py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#CC161C] transition-opacity ${uploading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
              >
                Cancel / Stop Process
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: DATA EDITOR */}
      {activeTab === "edit" && (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-11/12 max-w-5xl flex flex-col items-center">
          <h2 className="text-2xl font-bold text-[#05205A] mb-2 w-full text-left">
            CSV Data Editor
          </h2>
          <p className="text-gray-600 mb-6 w-full text-left">
            Apne device se CSV file select karein. Green boxes (Name, Age, BP,
            etc.) par click karke aap koi bhi mistake theek kar sakte hain.
          </p>

          <div className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="w-full text-gray-700 font-bold"
            />
          </div>

          {csvHeaders.length > 0 && (
            <div className="w-full overflow-x-auto mb-6 shadow-sm rounded-lg border border-gray-200">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    {csvHeaders.map((header, i) => (
                      <th
                        key={i}
                        className="border border-gray-200 p-3 bg-[#05205A] text-white text-left whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cellValue, colIndex) => {
                        const isEditable = colIndex > 0;
                        return (
                          <td
                            key={colIndex}
                            className={`border border-gray-200 p-3 whitespace-nowrap outline-none transition-all duration-200 ${isEditable ? "bg-[#f0fdf4] border-2 border-dashed border-[#12863B] cursor-text hover:bg-[#dcfce7] focus:bg-[#bbf7d0] focus:border-solid" : ""}`}
                            contentEditable={isEditable}
                            suppressContentEditableWarning={true}
                            onBlur={(e) =>
                              handleCellUpdate(
                                rowIndex,
                                colIndex,
                                e.target.innerText,
                              )
                            }
                            title={isEditable ? "Click to edit this value" : ""}
                          >
                            {cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {csvHeaders.length > 0 && (
            <>
              <button
                onClick={updateAndDownloadCsv}
                className="w-full py-4 px-6 rounded-lg font-bold text-white text-lg shadow-lg bg-[#12863B] hover:opacity-90"
              >
                Update & Download CSV
              </button>
              <p className="mt-2 text-sm text-gray-500 font-mono">
                Current File: {loadedFileName}
              </p>
            </>
          )}
        </div>
      )}

      {/* MODALS */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-[#05205A] p-4 text-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white">Subject Details</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowSubjectModal(false);
                initCamera();
              }}
              className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    ID Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectData.id}
                    onChange={(e) =>
                      setSubjectData({ ...subjectData, id: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectData.name}
                    onChange={(e) =>
                      setSubjectData({ ...subjectData, name: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    value={subjectData.age}
                    onChange={(e) =>
                      setSubjectData({ ...subjectData, age: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    required
                    value={subjectData.gender}
                    onChange={(e) =>
                      setSubjectData({ ...subjectData, gender: e.target.value })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Mobile (Optional)
                </label>
                <input
                  type="tel"
                  value={subjectData.mobile}
                  onChange={(e) =>
                    setSubjectData({ ...subjectData, mobile: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Height cm (Optional)
                </label>
                <input
                  type="number"
                  value={subjectData.height}
                  onChange={(e) =>
                    setSubjectData({ ...subjectData, height: e.target.value })
                  }
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4 mt-2 border-t sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-[#12863B] text-white rounded-lg font-bold hover:opacity-90"
                >
                  Submit & Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReferenceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-8 border-[#12863B] transform transition-all">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Recording Complete!
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Aap reference values abhi enter kar sakte hain ya skip karke
                baad me Data Editor me daal sakte hain.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveAndDownloadFiles(referenceData);
                }}
                className="space-y-4 text-left max-h-[70vh] overflow-y-auto px-1"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Systolic BP
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 120"
                      value={referenceData.sys}
                      onChange={(e) =>
                        setReferenceData({
                          ...referenceData,
                          sys: e.target.value,
                        })
                      }
                      className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Diastolic BP
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 80"
                      value={referenceData.dia}
                      onChange={(e) =>
                        setReferenceData({
                          ...referenceData,
                          dia: e.target.value,
                        })
                      }
                      className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Pulse Rate
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 72"
                    value={referenceData.pulse}
                    onChange={(e) =>
                      setReferenceData({
                        ...referenceData,
                        pulse: e.target.value,
                      })
                    }
                    className="w-full border-2 border-gray-200 rounded-lg p-2 focus:border-[#05205A] outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-6 sticky bottom-0 bg-white z-10">
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() =>
                      saveAndDownloadFiles({ sys: "", dia: "", pulse: "" })
                    }
                    className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50"
                  >
                    Skip & Save
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 py-3 px-4 bg-[#05205A] text-white rounded-lg font-bold hover:opacity-90 flex items-center justify-center disabled:opacity-50"
                  >
                    {uploading ? "Saving..." : "Save Data"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
