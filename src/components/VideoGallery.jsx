import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

export default function VideoGallery() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [error, setError] = useState(null);

  const API_BASE =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001/api";

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

                      {/* DOWNLOAD */}
                      <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
                      >
                        ⬇ Download
                      </a>
                    </div>

                    <p className="text-sm text-gray-500 truncate">{filename}</p>

                    <p className="text-gray-800 font-semibold text-sm">
                      {video.timestamp}
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
