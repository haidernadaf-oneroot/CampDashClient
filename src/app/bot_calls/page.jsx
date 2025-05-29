"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Search,
  Calendar,
  Filter,
  Download,
  TreePine,
  Play,
  Pause,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import TableBody from "@/components/aibot/TableBody";
import Pagination from "@/components/aibot/pagination";

// Custom hook for debouncing values
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

// FilterSection Component - Memoized
const FilterSection = React.memo(
  ({
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    filterDate,
    setFilterDate,
    statusFilter,
    setStatusFilter,
    treesFilter,
    setTreesFilter,
    treesOperator,
    setTreesOperator,
    sortByTrees,
    setSortByTrees,
  }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Search Phone Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Search Phone Number
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-black border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              />
            </div>
            {searchTerm !== debouncedSearchTerm && (
              <p className="text-xs text-slate-500 mt-1">Searching...</p>
            )}
          </div>

          {/* Filter by Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Filter by Date
            </label>
            <div className="flex items-center gap-2 text-black">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter by Status */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Filter by Status
            </label>
            <div className="flex items-center gap-2 text-black">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              >
                <option value="">All Status</option>
                <option value="true">Done Only</option>
                <option value="false">Pending Only</option>
              </select>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter by Trees */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Filter by Trees
            </label>
            <div className="flex items-center gap-2">
              <TreePine className="h-4 w-4 text-green-600" />
              <select
                value={treesOperator}
                onChange={(e) => setTreesOperator(e.target.value)}
                className="px-2 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-black"
              >
                <option value="gte">≥</option>
                <option value="lte">≤</option>
                <option value="eq">=</option>
              </select>
              <input
                type="number"
                placeholder="Trees count"
                value={treesFilter}
                onChange={(e) => setTreesFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-colors text-black"
                min="0"
              />
              {treesFilter && (
                <button
                  onClick={() => setTreesFilter("")}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sort by Trees */}
          <div className="flex items-center justify-start mt-6">
            <label className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg cursor-pointer w-full">
              <input
                type="checkbox"
                checked={sortByTrees}
                onChange={(e) => setSortByTrees(e.target.checked)}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <TreePine className="h-4 w-4 text-green-600" />
              <span className="text-green-800 font-medium">Sort by Trees</span>
            </label>
          </div>
        </div>
      </div>
    );
  }
);

// TableHeader Component - Memoized
const TableHeader = React.memo(({ sortByTrees }) => {
  return (
    <div className="flex-shrink-0 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-slate-50">
            <th className="text-left p-4 font-semibold text-slate-700 min-w-[140px]">
              Date
            </th>
            <th className="text-left p-4 font-semibold text-slate-700 min-w-[140px]">
              From
            </th>
            <th className="text-left p-4 font-semibold text-slate-700 min-w-[120px]">
              To
            </th>
            <th className="text-left p-4 font-semibold text-slate-700 min-w-[120px]">
              Crop
            </th>
            <th className="text-left p-4 font-semibold text-slate-700 min-w-[200px]">
              Audio
            </th>
            <th className="text-left p-4 font-semibold text-slate-700 min-w-[80px]">
              <div className="flex items-center gap-1">
                <TreePine className="h-4 w-4 text-green-600" />
                Trees
                {sortByTrees && (
                  <span className="text-xs text-green-600">(Sorted)</span>
                )}
              </div>
            </th>
            <th className="text-left p-4 font-semibold text-slate-700 min-w-[100px]">
              Status
            </th>
          </tr>
        </thead>
      </table>
    </div>
  );
});

// StatusDropdown Component - Memoized
const StatusDropdown = React.memo(({ recording, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = useCallback(
    async (e) => {
      e.preventDefault();
      const newValue = e.target.value === "true";
      setIsUpdating(true);

      try {
        await onStatusChange(recording._id, newValue);
      } catch (error) {
        console.error("Status update failed:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [recording._id, onStatusChange]
  );

  const currentStatus = recording.has_added ? "true" : "false";

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isUpdating}
        className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer transition-all ${
          isUpdating
            ? "bg-gray-100 text-gray-500 cursor-not-allowed opacity-50"
            : recording.has_added
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        }`}
      >
        <option value="false">Pending</option>
        <option value="true">Done</option>
      </select>
      {isUpdating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
        </div>
      )}
    </div>
  );
});

// Enhanced AudioPlayer Component - Fixed
const AudioPlayer = React.memo(({ recording, onClose, formatDate }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cleanup on unmount or when recording changes
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };
  }, [recording]);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Audio playback error:", error);
          toast.error("Failed to play audio. Please try again.");
          setIsLoading(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 w-80 z-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-slate-900">
            Now Playing
          </span>
        </div>
        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
              setIsPlaying(false);
            }
            onClose();
          }}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3">
        <div className="text-sm font-medium text-slate-900 truncate">
          Call: {recording.From} → {recording.To?.replace(/^(\+91|91)/, "")}
        </div>
        <div className="text-xs text-slate-500">
          {formatDate(recording.Date)} • {recording.no_of_trees || 0} trees
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className="flex items-center justify-center w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <div
            className="h-2 bg-slate-200 rounded-full cursor-pointer"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-purple-600 rounded-full transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          onClick={() => window.open(recording.RecordingURL, "_blank")}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          title="Download audio"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>

      <audio
        ref={audioRef}
        src={recording.RecordingURL}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setCurrentTime(0);
          setIsPlaying(false);
        }}
        preload="metadata"
      />
    </div>
  );
});

// Main RecordingTable Component
const RecordingTable = () => {
  const router = useRouter();
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(50);
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [treesFilter, setTreesFilter] = useState("");
  const [treesOperator, setTreesOperator] = useState("gte");
  const [sortByTrees, setSortByTrees] = useState(false);
  const [currentlyPlayingRecording, setCurrentlyPlayingRecording] =
    useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const abortControllerRef = useRef();

  const getToken = useCallback(() => {
    return localStorage.getItem("token");
  }, []);

  // Format date for API (DD-MM-YYYY)
  const formatDateForAPI = useCallback((dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  // Build query parameters for API
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams({
      page: currentPage,
      limit,
    });

    if (debouncedSearchTerm) params.append("search", debouncedSearchTerm);
    if (filterDate) params.append("date", formatDateForAPI(filterDate));
    if (statusFilter) params.append("hasAdded", statusFilter);
    if (treesFilter && !isNaN(Number.parseInt(treesFilter))) {
      if (treesOperator === "gte") params.append("minTrees", treesFilter);
      if (treesOperator === "lte") params.append("maxTrees", treesFilter);
      if (treesOperator === "eq") {
        params.append("minTrees", treesFilter);
        params.append("maxTrees", treesFilter);
      }
    }
    if (sortByTrees) {
      params.append("sortBy", "no_of_trees");
      params.append("order", "desc");
    }

    return params.toString();
  }, [
    currentPage,
    limit,
    debouncedSearchTerm,
    filterDate,
    statusFilter,
    treesFilter,
    treesOperator,
    sortByTrees,
    formatDateForAPI,
  ]);

  // Fetch recordings from backend
  const fetchRecordings = useCallback(
    async (page = 1, resetLoading = true) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const token = getToken();
      if (!token) {
        setError("Please log in to view recordings.");
        router.replace("/auth");
        return;
      }

      abortControllerRef.current = new AbortController();

      if (resetLoading) setLoading(true);

      try {
        const endpoint = `${
          process.env.NEXT_PUBLIC_API_URL
        }/aibot?${buildQueryParams()}`;
        const res = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) {
          if (res.status === 401) {
            localStorage.clear();
            setError("Session expired. Please log in again.");
            router.replace("/auth");
            return;
          }
          throw new Error("Failed to fetch recordings");
        }

        const data = await res.json();
        setRecordings(data.calls || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.totalCalls || 0);
        setCurrentPage(data.currentPage || page);
        setError(null);
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Failed to fetch recordings:", error);
        setError(error.message);
        setRecordings([]);
        setTotalPages(1);
        setTotalRecords(0);
      } finally {
        if (resetLoading) setLoading(false);
      }
    },
    [getToken, router, buildQueryParams]
  );

  // Download all numbers
  const downloadAllNumbers = useCallback(async () => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in to download");
      return;
    }

    setDownloadLoading(true);
    const loadingToast = toast.loading("Preparing download...");

    try {
      const endpoint = `${
        process.env.NEXT_PUBLIC_API_URL
      }/aibot?${buildQueryParams()}&limit=999999`;
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch all recordings");

      const { calls } = await res.json();
      const numbers = Array.isArray(calls)
        ? [
            ...new Set(
              calls
                .map((rec) => rec.To?.replace(/^(\+91|91)/, ""))
                .filter(Boolean)
            ),
          ]
        : [];

      if (numbers.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No phone numbers found");
        return;
      }

      const csvContent = ["Phone Number", ...numbers].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      let filename = `phone_numbers_${new Date().toISOString().split("T")[0]}`;
      if (statusFilter)
        filename += `_${statusFilter === "true" ? "done" : "pending"}`;
      if (filterDate) filename += `_${filterDate}`;
      if (treesFilter) filename += `_trees_${treesOperator}_${treesFilter}`;
      filename += ".csv";

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success(`Downloaded ${numbers.length} unique phone numbers`, {
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to download:", error);
      toast.dismiss(loadingToast);
      toast.error("Download failed. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  }, [
    getToken,
    buildQueryParams,
    statusFilter,
    filterDate,
    treesFilter,
    treesOperator,
  ]);

  // Handle status change
  const handleStatusChange = useCallback(
    async (recordingId, newStatus) => {
      const token = getToken();
      if (!token) {
        setError("Please log in to update status.");
        router.replace("/auth");
        return;
      }

      setRecordings((prev) =>
        prev.map((rec) =>
          rec._id === recordingId ? { ...rec, has_added: newStatus } : rec
        )
      );

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/aibot/toggle-call-status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ callId: recordingId }),
          }
        );

        if (!res.ok) throw new Error("Failed to update status");

        const result = await res.json();
        setRecordings((prev) =>
          prev.map((rec) =>
            rec._id === recordingId
              ? { ...rec, has_added: result.call.has_added }
              : rec
          )
        );

        toast.success(`Status updated to ${newStatus ? "Done" : "Pending"}`, {
          duration: 2000,
        });
      } catch (error) {
        console.error("Failed to update status:", error);
        setRecordings((prev) =>
          prev.map((rec) =>
            rec._id === recordingId ? { ...rec, has_added: !newStatus } : rec
          )
        );
        toast.error("Failed to update status. Please try again.");
      }
    },
    [getToken, router]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage !== currentPage && newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [currentPage, totalPages]
  );

  // Format date for display
  const formatDate = useCallback((dateStr) => {
    if (!dateStr) return dateStr;
    // Assuming backend returns date in DD-MM-YYYY format
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const day = Number.parseInt(parts[0], 10);
    const month = Number.parseInt(parts[1], 10) - 1;
    const year = Number.parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    if (isNaN(date)) return dateStr;
    const dayStr = date.getDate().toString().padStart(2, "0");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthStr = monthNames[date.getMonth()];
    const yearStr = date.getFullYear();
    return `${dayStr} ${monthStr} ${yearStr}`;
  }, []);

  const handleCopy = useCallback((number) => {
    const cleanNumber = number?.replace(/^(\+91|91)/, "");
    navigator.clipboard.writeText(cleanNumber);
    toast.success(`Number copied: ${cleanNumber}`, { duration: 2000 });
  }, []);

  const handleAudioToggle = useCallback(
    (audioId, recording) => {
      // If a different recording is selected, update the currently playing recording
      if (currentlyPlayingRecording?._id !== audioId) {
        setCurrentlyPlayingRecording(recording);
      }
    },
    [currentlyPlayingRecording]
  );

  const handleCloseAudioPlayer = useCallback(() => {
    setCurrentlyPlayingRecording(null);
  }, []);

  const filterSummary = useMemo(() => {
    const filters = [];
    if (statusFilter)
      filters.push(`Status: ${statusFilter === "true" ? "Done" : "Pending"}`);
    if (filterDate) filters.push(`Date: ${filterDate}`);
    if (debouncedSearchTerm) filters.push(`Search: "${debouncedSearchTerm}"`);
    if (treesFilter) {
      const operatorText =
        treesOperator === "gte" ? "≥" : treesOperator === "lte" ? "≤" : "=";
      filters.push(`Trees: ${operatorText} ${treesFilter}`);
    }
    return filters.length > 0 ? filters.join(" | ") : "No filters applied";
  }, [
    statusFilter,
    filterDate,
    debouncedSearchTerm,
    treesFilter,
    treesOperator,
  ]);

  // Fetch data when filters or page change
  useEffect(() => {
    fetchRecordings(currentPage);
  }, [
    currentPage,
    debouncedSearchTerm,
    filterDate,
    statusFilter,
    treesFilter,
    treesOperator,
    sortByTrees,
    fetchRecordings,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [
    debouncedSearchTerm,
    filterDate,
    statusFilter,
    treesFilter,
    treesOperator,
    sortByTrees,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="max-w-8xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Recording Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and review your audio recordings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-lg shadow-sm border">
              <span className="font-medium text-lg text-slate-900">
                {totalRecords}
              </span>
              <span>total recordings</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 px-4 py-2 rounded-lg shadow-sm border border-blue-200">
              <span className="font-medium text-blue-900">
                Download: {filterSummary}
              </span>
            </div>
            <button
              onClick={downloadAllNumbers}
              disabled={downloadLoading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <Download
                className={`h-4 w-4 ${downloadLoading ? "animate-spin" : ""}`}
              />
              {downloadLoading ? "Downloading..." : "Download Numbers"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700 text-center">
              {error}{" "}
              <a
                href="/auth"
                className="text-red-800 underline font-medium hover:text-red-900"
              >
                Log in
              </a>
            </p>
          </div>
        )}

        <FilterSection
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          debouncedSearchTerm={debouncedSearchTerm}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          treesFilter={treesFilter}
          setTreesFilter={setTreesFilter}
          treesOperator={treesOperator}
          setTreesOperator={setTreesOperator}
          sortByTrees={sortByTrees}
          setSortByTrees={setSortByTrees}
        />

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="flex flex-col h-[600px]">
            <TableHeader sortByTrees={sortByTrees} />
            <TableBody
              loading={loading}
              filteredRecordings={recordings}
              formatDate={formatDate}
              handleCopy={handleCopy}
              handleAudioToggle={handleAudioToggle}
              playingAudio={currentlyPlayingRecording?._id}
              StatusDropdown={StatusDropdown}
              handleStatusChange={handleStatusChange}
            />
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalRecords={totalRecords}
              limit={limit}
              handlePageChange={handlePageChange}
              loading={loading}
            />
          )}
        </div>
        {currentlyPlayingRecording && (
          <AudioPlayer
            recording={currentlyPlayingRecording}
            onClose={handleCloseAudioPlayer}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
};

export default RecordingTable;
