"use client";

import { Copy, Volume2, Play, BookUser } from "lucide-react";
import { memo } from "react";

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
    handleFormToggle,
    formOpen,
  }) => {
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

    function formatDuration(sec) {
      if (!sec || isNaN(sec)) return "00:00";
      const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, "0");
      const s = Math.floor(sec % 60)
        .toString()
        .padStart(2, "0");
      return `${m}:${s}`;
    }

    return (
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <tbody>
            {filteredRecordings.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12">
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
                      {rec.From || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 min-w-[120px] text-black">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {rec.To?.replace(/^(\+91|91)/, "") || "N/A"}
                      </span>
                      <button
                        onClick={() => handleCopy(rec.To)}
                        className="p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-50"
                        title="Copy number"
                        disabled={!rec.To}
                      >
                        <Copy className="h-3 w-3 text-slate-600" />
                      </button>
                    </div>
                  </td>
                  <td className="p-4 min-w-[140px]">
                    <span className="font-mono text-sm text-black bg-slate-100 px-2 py-1 rounded">
                      {rec.crop || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 min-w-[140px]">
                    <span className="font-mono text-sm text-black bg-slate-100 px-2 py-1 rounded">
                      {rec.harvest || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 min-w-[240px]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAudioToggle(rec._id, rec)}
                        className={`relative p-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                          playingAudio === rec._id
                            ? "bg-purple-100 text-purple-700 shadow-md"
                            : "hover:bg-slate-200 text-gray-600"
                        }`}
                        title={playingAudio === rec._id ? "Pause" : "Play"}
                      >
                        <div className="flex items-center gap-2">
                          {playingAudio === rec._id ? (
                            <>
                              <div className="flex items-center gap-1">
                                <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse"></div>
                                <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse delay-75"></div>
                                <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse delay-150"></div>
                              </div>
                              <span className="text-xs font-medium text-purple-600">
                                Pause
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDuration(rec.duration)}
                              </span>
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 text-purple-600" />
                              <span className="text-xs font-medium text-gray-800">
                                Play
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDuration(rec.duration)}
                              </span>
                            </>
                          )}
                        </div>
                        {playingAudio === rec._id && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
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
                  <td className="p-4 min-w-[100px]">
                    <BookUser
                      className={`h-6 ml-2 w-9 cursor-pointer transition-colors ${
                        formOpen === rec._id
                          ? "text-purple-700"
                          : "text-purple-600 hover:text-purple-800"
                      }`}
                      onClick={() => handleFormToggle(rec._id)}
                      title={formOpen === rec._id ? "Close form" : "Open form"}
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
