// import React, { useState, useEffect, useCallback } from "react";
// import toast from "react-hot-toast";
// // Formats any stored timestamp (usually UTC) into India (IST) date & time for display only
// const formatToIST = (timestamp) => {
//   if (!timestamp) return "N/A";
//   console.log(
//     "RAW timestamp from backend:",
//     timestamp,
//     "| typeof:",
//     typeof timestamp,
//   ); // TEMP DEBUG
//   try {
//     return new Date(timestamp).toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: true,
//     });
//   } catch (e) {
//     return timestamp;
//   }
// };
// export default function VideoGallery() {
//   const [videos, setVideos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [error, setError] = useState(null);

//   const API_BASE =
//     import.meta.env.VITE_BACKEND_URL ||
//     "https://shree-mahadei-daily-needs-backend.onrender.com/api";

//   const loadVideos = useCallback(async () => {
//     setLoading(true);
//     const sellerId = localStorage.getItem("sellerId") || "guest";

//     try {
//       const response = await fetch(`${API_BASE}/videos?sellerId=${sellerId}`);
//       if (!response.ok) throw new Error("No videos");

//       const { videos } = await response.json();

//       setVideos(videos || []);
//       toast.success(`✅ ${videos?.length || 0} videos loaded`);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load videos");
//     } finally {
//       setLoading(false);
//     }
//   }, [API_BASE]);

//   useEffect(() => {
//     loadVideos();
//   }, [loadVideos]);

//   const handleRefresh = () => loadVideos();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 py-12">
//       <div className="max-w-6xl mx-auto">
//         {/* HEADER */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-black text-indigo-600 mb-6">
//             📹 My Video Gallery
//           </h1>

//           <button
//             onClick={handleRefresh}
//             disabled={loading}
//             className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl"
//           >
//             {loading ? "Loading..." : "Refresh Gallery"}
//           </button>

//           {error && <p className="text-red-500 mt-4">{error}</p>}
//         </div>

//         {/* LOADING */}
//         {loading && (
//           <div className="text-center py-32 text-xl font-semibold">
//             Loading videos...
//           </div>
//         )}

//         {/* EMPTY */}
//         {!loading && videos.length === 0 && (
//           <div className="text-center py-32 text-2xl font-bold">
//             No videos yet 🎥
//           </div>
//         )}

//         {/* GRID */}
//         {!loading && videos.length > 0 && (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//             {videos.map((video, index) => {
//               const videoUrl = video.url;

//               // force download using query param
//               const downloadUrl = `${video.url}?fl_attachment=true`;

//               const filename =
//                 videoUrl.split("/").pop()?.split(".")[0]?.slice(0, 15) ||
//                 "video";

//               return (
//                 <div
//                   key={index}
//                   onClick={() => setSelectedVideo(videoUrl)}
//                   className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition"
//                 >
//                   {/* VIDEO */}
//                   <div className="h-64 bg-black">
//                     <video
//                       src={videoUrl}
//                       className="w-full h-full object-cover"
//                       controls
//                       playsInline
//                       preload="metadata"
//                     />
//                   </div>

//                   {/* INFO */}
//                   <div className="p-5 space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
//                         {video.size || `${video.duration}s`}
//                       </span>

//                       {/* DOWNLOAD */}
//                       <a
//                         href={downloadUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         onClick={(e) => e.stopPropagation()}
//                         className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
//                       >
//                         ⬇ Download
//                       </a>
//                     </div>

//                     <p className="text-sm text-gray-500 truncate">{filename}</p>

//                     <p className="text-gray-800 font-semibold text-sm">
//                       {formatToIST(video.timestamp)}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* FULLSCREEN MODAL */}
//         {selectedVideo && (
//           <div
//             className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
//             onClick={(e) =>
//               e.target === e.currentTarget && setSelectedVideo(null)
//             }
//           >
//             <div className="relative w-full max-w-5xl">
//               <video
//                 src={selectedVideo}
//                 controls
//                 autoPlay
//                 playsInline
//                 className="w-full max-h-[85vh] rounded-2xl"
//               />

//               <button
//                 onClick={() => setSelectedVideo(null)}
//                 className="absolute -top-14 right-0 text-white text-4xl font-bold"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect, useCallback } from "react";
// import toast from "react-hot-toast";

// // Backend sends a pre-formatted UTC string like "5/7/2026, 12:57:39 pm"
// // (DD/MM/YYYY, no timezone marker). new Date() can't safely parse this
// // ambiguous format, so we manually extract the parts, rebuild them as a
// // proper UTC instant, and THEN convert that instant to IST for display.
// const formatToIST = (timestamp) => {
//   if (!timestamp) return "N/A";
//   try {
//     const match = String(timestamp).match(
//       /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2}):(\d{2})\s*(am|pm)/i,
//     );

//     if (!match) {
//       // Not the expected format — fall back to normal parsing
//       return new Date(timestamp).toLocaleString("en-IN", {
//         timeZone: "Asia/Kolkata",
//         day: "2-digit",
//         month: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//         hour12: true,
//       });
//     }

//     let [, day, month, year, hour, minute, second, meridiem] = match;
//     hour = parseInt(hour, 10);
//     if (meridiem.toLowerCase() === "pm" && hour !== 12) hour += 12;
//     if (meridiem.toLowerCase() === "am" && hour === 12) hour = 0;

//     // Rebuild the exact UTC instant the backend originally meant
//     const utcDate = new Date(
//       Date.UTC(
//         parseInt(year, 10),
//         parseInt(month, 10) - 1,
//         parseInt(day, 10),
//         hour,
//         parseInt(minute, 10),
//         parseInt(second, 10),
//       ),
//     );

//     return utcDate.toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//       hour12: true,
//     });
//   } catch (e) {
//     return timestamp; // fallback: show raw value if parsing fails
//   }
// };

// export default function VideoGallery() {
//   const [videos, setVideos] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const [error, setError] = useState(null);

//   const API_BASE =
//     import.meta.env.VITE_BACKEND_URL ||
//     "https://shree-mahadei-daily-needs-backend.onrender.com/api";

//   const loadVideos = useCallback(async () => {
//     setLoading(true);
//     const sellerId = localStorage.getItem("sellerId") || "guest";

//     try {
//       const response = await fetch(`${API_BASE}/videos?sellerId=${sellerId}`);
//       if (!response.ok) throw new Error("No videos");

//       const { videos } = await response.json();

//       setVideos(videos || []);
//       toast.success(`✅ ${videos?.length || 0} videos loaded`);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load videos");
//     } finally {
//       setLoading(false);
//     }
//   }, [API_BASE]);

//   useEffect(() => {
//     loadVideos();
//   }, [loadVideos]);

//   const handleRefresh = () => loadVideos();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 py-12">
//       <div className="max-w-6xl mx-auto">
//         {/* HEADER */}
//         <div className="text-center mb-12">
//           <h1 className="text-5xl font-black text-indigo-600 mb-6">
//             📹 My Video Gallery
//           </h1>

//           <button
//             onClick={handleRefresh}
//             disabled={loading}
//             className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl"
//           >
//             {loading ? "Loading..." : "Refresh Gallery"}
//           </button>

//           {error && <p className="text-red-500 mt-4">{error}</p>}
//         </div>

//         {/* LOADING */}
//         {loading && (
//           <div className="text-center py-32 text-xl font-semibold">
//             Loading videos...
//           </div>
//         )}

//         {/* EMPTY */}
//         {!loading && videos.length === 0 && (
//           <div className="text-center py-32 text-2xl font-bold">
//             No videos yet 🎥
//           </div>
//         )}

//         {/* GRID */}
//         {!loading && videos.length > 0 && (
//           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//             {videos.map((video, index) => {
//               const videoUrl = video.url;

//               // force download using query param
//               const downloadUrl = `${video.url}?fl_attachment=true`;

//               const filename =
//                 videoUrl.split("/").pop()?.split(".")[0]?.slice(0, 15) ||
//                 "video";

//               return (
//                 <div
//                   key={index}
//                   onClick={() => setSelectedVideo(videoUrl)}
//                   className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition"
//                 >
//                   {/* VIDEO */}
//                   <div className="h-64 bg-black">
//                     <video
//                       src={videoUrl}
//                       className="w-full h-full object-cover"
//                       controls
//                       playsInline
//                       preload="metadata"
//                     />
//                   </div>

//                   {/* INFO */}
//                   <div className="p-5 space-y-3">
//                     <div className="flex justify-between items-center">
//                       <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
//                         {video.size || `${video.duration}s`}
//                       </span>

//                       {/* DOWNLOAD */}
//                       <a
//                         href={downloadUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         onClick={(e) => e.stopPropagation()}
//                         className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
//                       >
//                         ⬇ Download
//                       </a>
//                     </div>

//                     <p className="text-sm text-gray-500 truncate">{filename}</p>

//                     <p className="text-gray-800 font-semibold text-sm">
//                       {formatToIST(video.timestamp)}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//         {/* FULLSCREEN MODAL */}
//         {selectedVideo && (
//           <div
//             className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
//             onClick={(e) =>
//               e.target === e.currentTarget && setSelectedVideo(null)
//             }
//           >
//             <div className="relative w-full max-w-5xl">
//               <video
//                 src={selectedVideo}
//                 controls
//                 autoPlay
//                 playsInline
//                 className="w-full max-h-[85vh] rounded-2xl"
//               />

//               <button
//                 onClick={() => setSelectedVideo(null)}
//                 className="absolute -top-14 right-0 text-white text-4xl font-bold"
//               >
//                 ✕
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

// Backend sends a pre-formatted UTC string like "5/7/2026, 12:57:39 pm"
// (DD/MM/YYYY, no timezone marker). new Date() can't safely parse this
// ambiguous format, so we manually extract the parts, rebuild them as a
// proper UTC instant, and THEN convert that instant to IST for display.
const formatToIST = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    const match = String(timestamp).match(
      /(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2}):(\d{2})\s*(am|pm)/i,
    );

    if (!match) {
      // Not the expected format — fall back to normal parsing
      return new Date(timestamp).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    }

    let [, day, month, year, hour, minute, second, meridiem] = match;
    hour = parseInt(hour, 10);
    if (meridiem.toLowerCase() === "pm" && hour !== 12) hour += 12;
    if (meridiem.toLowerCase() === "am" && hour === 12) hour = 0;

    // Rebuild the exact UTC instant the backend originally meant
    const utcDate = new Date(
      Date.UTC(
        parseInt(year, 10),
        parseInt(month, 10) - 1,
        parseInt(day, 10),
        hour,
        parseInt(minute, 10),
        parseInt(second, 10),
      ),
    );

    return utcDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return timestamp; // fallback: show raw value if parsing fails
  }
};

export default function VideoGallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);
  // NEW: tracks which video id is currently being deleted, so only that
  // specific card's delete button shows a loading state (not the whole page).
  const [deletingId, setDeletingId] = useState(null);

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL ||
    "https://shree-mahadei-daily-needs-backend.onrender.com/api";

  const loadVideos = useCallback(async () => {
    setLoading(true);
    const sellerId = localStorage.getItem("sellerId") || "guest";

    try {
      const response = await fetch(`${API_BASE}/videos?sellerId=${sellerId}`);
      if (!response.ok) throw new Error("No videos");

      const { videos } = await response.json();

      setVideos(videos || []);
      toast.success(`✅ ${videos?.length || 0} videos loaded`);
    } catch (err) {
      console.error(err);
      setError("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  const handleRefresh = () => loadVideos();

  // NEW: Delete handler — calls the backend's DELETE /api/videos/:id route
  // (which removes the file from Cloudinary and the record from MongoDB),
  // then removes the video from local state so the UI updates instantly.
  const handleDeleteVideo = async (video, e) => {
    e.stopPropagation(); // don't trigger the card's onClick (which opens the modal)

    const videoId = video._id || video.id;
    if (!videoId) {
      toast.error("Video ID not found — cannot delete.");
      console.error("Missing _id/id on video object:", video);
      return;
    }

    const confirmed = window.confirm(
      "Kya aap sach mein yeh video delete karna chahte hain? Yeh action undo nahi ho sakta.",
    );
    if (!confirmed) return;

    setDeletingId(videoId);
    try {
      const response = await fetch(`${API_BASE}/videos/${videoId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || "Delete failed");
      }

      // Remove from local list immediately so the UI updates without a refetch
      setVideos((prev) => prev.filter((v) => (v._id || v.id) !== videoId));

      // If the deleted video was open in the fullscreen modal, close it
      if (selectedVideo === video.url) {
        setSelectedVideo(null);
      }

      toast.success("🗑️ Video deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(err.message || "Video delete nahi ho payi. Try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6 py-12">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-indigo-600 mb-6">
            📹 My Video Gallery
          </h1>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-8 py-4 bg-emerald-500 text-white font-bold rounded-2xl"
          >
            {loading ? "Loading..." : "Refresh Gallery"}
          </button>

          {error && <p className="text-red-500 mt-4">{error}</p>}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-32 text-xl font-semibold">
            Loading videos...
          </div>
        )}

        {/* EMPTY */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-32 text-2xl font-bold">
            No videos yet 🎥
          </div>
        )}

        {/* GRID */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {videos.map((video, index) => {
              const videoUrl = video.url;

              // force download using query param
              const downloadUrl = `${video.url}?fl_attachment=true`;

              const filename =
                videoUrl.split("/").pop()?.split(".")[0]?.slice(0, 15) ||
                "video";

              const videoId = video._id || video.id;
              const isDeleting = deletingId === videoId;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedVideo(videoUrl)}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition"
                >
                  {/* VIDEO */}
                  <div className="h-64 bg-black">
                    <video
                      src={videoUrl}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  </div>

                  {/* INFO */}
                  <div className="p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                        {video.size || `${video.duration}s`}
                      </span>

                      {/* ACTION BUTTONS: Download + Delete */}
                      <div className="flex gap-2">
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                        >
                          ⬇ Download
                        </a>

                        {/* NEW: Delete button */}
                        <button
                          type="button"
                          onClick={(e) => handleDeleteVideo(video, e)}
                          disabled={isDeleting}
                          className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? "..." : "🗑️ Delete"}
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 truncate">{filename}</p>

                    <p className="text-gray-800 font-semibold text-sm">
                      {formatToIST(video.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* FULLSCREEN MODAL */}
        {selectedVideo && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setSelectedVideo(null)
            }
          >
            <div className="relative w-full max-w-5xl">
              <video
                src={selectedVideo}
                controls
                autoPlay
                playsInline
                className="w-full max-h-[85vh] rounded-2xl"
              />

              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-14 right-0 text-white text-4xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
