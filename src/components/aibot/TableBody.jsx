import { Copy, Download, Volume2 } from "lucide-react";
import React, { useRef, useState, memo, useCallback, useEffect } from "react";

const TableBody = memo(
  ({
    loading,
    filteredRecordings,
    formatDate,
    handleCopy,
    handleAudioToggle,
    playingAudio,
    StatusDropdown,
    handleStatusChange,
  }) => {
    const audioRef = useRef(null);
    const [durations, setDurations] = useState({});

    const playAudio = useCallback(
      (src, id) => {
        if (audioRef.current) {
          audioRef.current.src = src;
          audioRef.current.play();
          handleAudioToggle(id);
        }
      },
      [handleAudioToggle]
    );

    const pauseAudio = useCallback(() => {
      if (audioRef.current) {
        audioRef.current.pause();
        handleAudioToggle(null);
      }
    }, [handleAudioToggle]);

    // Capture audio duration on metadata load
    const handleLoadedMetadata = () => {
      const id = audioRef.current?.dataset?.id;
      if (audioRef.current && id) {
        const duration = audioRef.current.duration;
        setDurations((prev) => ({
          ...prev,
          [id]: formatDuration(duration),
        }));
      }
    };

    const formatDuration = (seconds) => {
      const mins = Math.floor(seconds / 60)
        .toString()
        .padStart(2, "0");
      const secs = Math.floor(seconds % 60)
        .toString()
        .padStart(2, "0");
      return `${mins}:${secs}`;
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
            <span className="text-slate-600">Loading recordings...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto">
        <audio
          ref={audioRef}
          className="hidden"
          onEnded={pauseAudio}
          onLoadedMetadata={handleLoadedMetadata}
          data-id={playingAudio}
        />
        <table className="w-full">
          <tbody>
            {filteredRecordings.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Volume2 className="h-12 w-12 text-slate-300" />
                    <p className="text-slate-500 font-medium">
                      No recordings found
                    </p>
                    <p className="text-slate-400 text-sm">
                      Try adjusting your filters or check back later
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecordings.map((rec, index) => (
                <tr
                  key={rec._id}
                  className={`border-b hover:bg-slate-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-slate-25"
                  }`}
                >
                  <td className="p-4 min-w-[140px]">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">
                        {formatDate(rec.Date)}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 min-w-[140px]">
                    <span className="font-mono text-sm text-black bg-slate-100 px-2 py-1 rounded">
                      {rec.From}
                    </span>
                  </td>
                  <td className="p-4 min-w-[120px] text-black">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {rec.To?.replace(/^(\+91|91)/, "")}
                      </span>
                      <button
                        onClick={() => handleCopy(rec.To)}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                        title="Copy number"
                      >
                        <Copy className="h-3 w-3 text-slate-600" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 min-w-[240px] text-red-500">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          playingAudio === rec._id
                            ? pauseAudio()
                            : playAudio(rec.RecordingURL, rec._id)
                        }
                        className="p-1 hover:bg-slate-200 rounded transition-colors text-sm font-medium"
                        title={playingAudio === rec._id ? "Pause" : "Play"}
                      >
                        {playingAudio === rec._id ? "⏸" : "▶"}
                      </button>
                      <span className="text-xs text-slate-600">
                        {durations[rec._id] || "00:00"}
                      </span>
                      <button
                        onClick={() => window.open(rec.RecordingURL, "_blank")}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                        title="Download audio"
                      >
                        <Download className="h-3 w-3 text-slate-600" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 min-w-[80px] text-black">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono text-sm px-2 py-1 rounded ${
                          Number.parseInt(rec.no_of_trees || 0) > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {rec.no_of_trees || 0}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 min-w-[100px]">
                    <StatusDropdown
                      recording={rec}
                      onStatusChange={handleStatusChange}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  }
);

export default TableBody;
