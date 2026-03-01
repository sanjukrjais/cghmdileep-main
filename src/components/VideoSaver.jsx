import React, { useState, useRef, useEffect, useCallback } from "react";
import { ref, uploadBytes, getDownloadURL, listAll } from "firebase/storage";
import { storage } from "../../firebase";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../utils/cloudinary";
export default function VideoSaver() {
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const timerRef = useRef(null);
  const API_BASE =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";
  // 🔥 Start Video Recording (Enhanced)
  const startRecording = useCallback(() => {
    if (!videoRef.current || !cameraReady) {
      toast.error("Camera not ready");
      return;
    }

    setIsRecording(true);
    setRecordingTime(0);
    recordedChunksRef.current = [];

    const stream = videoRef.current.srcObject;
    const options = {
      mimeType: "video/webm;codecs=vp9,opus",
    };

    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const videoUrl = URL.createObjectURL(blob);
      setRecordedVideo(videoUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };

    mediaRecorder.start(250); // Higher quality - 250ms chunks
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 0.25);
    }, 250);

    toast.success("🎥 Recording started!");
  }, [cameraReady]);

  // 🔥 Stop Video Recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    toast.success(`✅ Recorded ${recordingTime.toFixed(1)}s video!`);
  }, [recordingTime]);

  // 🔥 Restart Recording
  const restartRecording = useCallback(() => {
    setRecordedVideo(null);
    URL.revokeObjectURL(recordedVideo);
    setIsRecording(false);
    setRecordingTime(0);
  }, [recordedVideo]);

  // 🔥 Open Camera
  const openCamera = useCallback(async () => {
    setShowCamera(true);
    setCameraReady(false);
    setRecordedVideo(null);
    toast.loading("Starting camera...", { id: "camera" });

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = videoRef.current;

      if (video) {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          video.play().then(() => {
            setCameraReady(true);
            toast.success("✅ Camera ready!", { id: "camera" });
          });
        };
      }
    } catch (error) {
      console.error("Camera error:", error);
      toast.error("❌ Camera access denied", { id: "camera" });
      setShowCamera(false);
    }
  }, [facingMode]);

  // 🔥 Close Camera
  const closeCamera = useCallback(() => {
    setShowCamera(false);
    setCameraReady(false);
    setIsRecording(false);
    setRecordedVideo(null);
    setRecordingTime(0);

    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  }, []);

  const saveVideo = useCallback(async () => {
    if (!recordedVideo) {
      toast.error("No video recorded");
      return;
    }

    setUploading(true);
    try {
      toast.loading("🎥 Uploading to Cloudinary...", { id: "upload" });

      // ✅ FIX 1: Create blob from MediaRecorder chunks (not URL)
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });

      // ✅ FIX 2: Upload to Cloudinary
      const videoUrl = await uploadToCloudinary(blob);

      // ✅ FIX 3: Save to CORRECT backend endpoint with FormData
      const sellerId = localStorage.getItem("sellerId") || "guest";
      const formData = new FormData();
      formData.append("video", videoUrl); // Backend expects 'video'
      formData.append("sellerId", sellerId);
      formData.append("duration", recordingTime.toFixed(1));

      const response = await fetch(`${API_BASE}/videos`, {
        // ← /videos not /video-save
        method: "POST",
        body: formData, // ← FormData, not JSON
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Save failed");
      }

      toast.success("✅ Video saved to gallery!", { id: "upload" });
      window.location.href = "/video-gallery"; // Go to gallery
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      toast.dismiss("upload");
    }
  }, [recordedVideo, recordingTime, API_BASE, recordedChunksRef]);

  // 🔥 Switch Camera
  const switchCamera = useCallback(async () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }

    const newFacingMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newFacingMode);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: newFacingMode } },
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (error) {
      toast.error("Camera switch failed");
    }
  }, [facingMode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-200 p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🎥 Pro Video Recorder
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Production grade recording with timer & Firebase storage
          </p>
        </div>

        {/* Recorded Video Preview */}
        {recordedVideo && (
          <div className="space-y-4">
            <video
              src={recordedVideo}
              controls
              className="w-full h-80 rounded-3xl shadow-2xl bg-black/20"
            />
            <div className="flex gap-3 justify-center">
              <button
                onClick={restartRecording}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                🔄 New Recording
              </button>
              <button
                onClick={saveVideo}
                disabled={uploading}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50"
              >
                {uploading ? "⏳ Saving..." : "💾 Save to Firebase"}
              </button>
            </div>
          </div>
        )}

        {/* Camera Controls */}
        {!showCamera ? (
          <button
            onClick={openCamera}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-8 px-12 rounded-3xl text-2xl font-black shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 mx-auto block"
          >
            🎥 Start Recording
          </button>
        ) : (
          <div className="space-y-6">
            {/* Clean Camera View - NO OVERLAY BUTTONS */}
            <div className="relative bg-black/95 rounded-3xl overflow-hidden shadow-3xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[500px] md:h-[600px] object-cover"
              />

              {/* Status Bar Only */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between bg-black/80 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <div className="text-white font-bold">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      cameraReady ? "bg-green-500" : "bg-yellow-500"
                    }`}
                  >
                    {cameraReady ? "✅ READY" : "🔄 LOADING"}
                  </span>
                  <div className="text-sm opacity-75 mt-1">
                    {facingMode === "environment" ? "Back Cam" : "Front Cam"}
                  </div>
                </div>

                {isRecording && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                    <span className="text-2xl font-mono text-red-400">
                      {recordingTime.toFixed(1)}s
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Control Panel */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!cameraReady}
                className={`flex-1 py-6 px-8 rounded-3xl font-black text-xl shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 ${
                  isRecording
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-red-500/25 hover:scale-[1.02] shadow-red-500/25 animate-pulse"
                    : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-purple-500/25 hover:scale-[1.02] shadow-purple-500/25"
                } disabled:opacity-50`}
              >
                {isRecording ? <>⏹️ STOP</> : <>▶️ START RECORD</>}
              </button>

              <button
                onClick={switchCamera}
                disabled={!cameraReady || isRecording}
                className="px-6 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black rounded-3xl shadow-xl hover:shadow-yellow-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
              >
                🔄 Switch
              </button>
            </div>

            <button
              onClick={closeCamera}
              disabled={isRecording}
              className="w-full py-5 bg-gradient-to-r from-slate-500 to-gray-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-gray-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
            >
              ❌ Close Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
