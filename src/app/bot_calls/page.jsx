"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Search,
  Calendar,
  Filter,
  Volume2,
  Download,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const RecordingTable = () => {
  const router = useRouter();
  const [recordings, setRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(50);
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [playingAudio, setPlayingAudio] = useState(null);
  const [downloadLimit, setDownloadLimit] = useState(999999); // Default to all
  const [statusFilter, setStatusFilter] = useState("");

  // Retrieve JWT token from localStorage
  const getToken = () => {
    const token = localStorage.getItem("token");
    return token;
  };

  // Download all "To" numbers as CSV with proper filtering and duplicate analysis
  const downloadAllNumbers = async () => {
    const token = getToken();
    if (!token) {
      toast.error("Please log in to download");
      return;
    }

    setDownloadLoading(true);
    const loadingToast = toast.loading("Fetching all records for download...");

    try {
      // Fetch ALL records without pagination limit
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/aibot?page=1&limit=999999`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch all recordings");
      }

      const { data } = await res.json();
      const allRecordings = Array.isArray(data) ? data : [];

      if (allRecordings.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No recordings found");
        return;
      }

      // Apply the same filters as the UI to the complete dataset
      let filteredAllRecordings = allRecordings;

      // Apply date filter
      if (filterDate) {
        filteredAllRecordings = filteredAllRecordings.filter((rec) => {
          const recDate = new Date(rec.Date).toISOString().split("T")[0];
          return recDate === filterDate;
        });
      }

      // Apply search filter
      if (searchTerm) {
        filteredAllRecordings = filteredAllRecordings.filter((rec) =>
          rec.To?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply status filter
      if (statusFilter) {
        filteredAllRecordings = filteredAllRecordings.filter((rec) => {
          const currentStatus = rec.has_added ? "Done" : "Pending";
          return currentStatus === statusFilter;
        });
      }

      // Extract all "To" numbers and clean them (before removing duplicates)
      const allNumbers = filteredAllRecordings
        .map((rec) => rec.To?.replace(/^(\+91|91)/, ""))
        .filter(Boolean);

      // Extract unique "To" numbers
      const uniqueNumbers = [...new Set(allNumbers)];

      if (uniqueNumbers.length === 0) {
        toast.dismiss(loadingToast);
        toast.error("No phone numbers found with current filters");
        return;
      }

      // Calculate duplicate statistics
      const duplicateCount = allNumbers.length - uniqueNumbers.length;

      // Apply download limit
      const numbersToDownload =
        downloadLimit === 999999
          ? uniqueNumbers
          : uniqueNumbers.slice(0, downloadLimit);

      // Create CSV content
      const csvContent = [
        "Phone Number", // Header
        ...numbersToDownload,
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      // Create filename with filter info
      let filename = `phone_numbers_${new Date().toISOString().split("T")[0]}`;
      if (statusFilter) filename += `_${statusFilter.toLowerCase()}`;
      if (filterDate) filename += `_${filterDate}`;
      filename += ".csv";

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.dismiss(loadingToast);

      // Create detailed success message with duplicate info
      let successMessage = `Downloaded ${numbersToDownload.length} unique phone numbers`;

      if (duplicateCount > 0) {
        successMessage += ` (${allNumbers.length} total numbers, ${duplicateCount} duplicates removed)`;
      }

      if (filteredAllRecordings.length !== allRecordings.length) {
        successMessage += ` from ${filteredAllRecordings.length} filtered records (out of ${allRecordings.length} total)`;
      } else {
        successMessage += ` from ${filteredAllRecordings.length} total records`;
      }

      if (downloadLimit < uniqueNumbers.length) {
        successMessage += ` (limited to ${downloadLimit})`;
      }

      // Add filter info to success message
      const activeFilters = [];
      if (statusFilter) activeFilters.push(`Status: ${statusFilter}`);
      if (filterDate) activeFilters.push(`Date: ${filterDate}`);
      if (searchTerm) activeFilters.push(`Search: ${searchTerm}`);

      if (activeFilters.length > 0) {
        successMessage += ` with filters: ${activeFilters.join(", ")}`;
      }

      toast.success(successMessage, { duration: 6000 });

      // Show duplicate info if significant
      if (duplicateCount > 0) {
        setTimeout(() => {
          toast.info(
            `Note: ${duplicateCount} duplicate phone numbers were automatically removed from your download.`,
            {
              duration: 4000,
            }
          );
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to download all numbers:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to fetch all records. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  // Fetch recordings with server-side pagination
  const fetchRecordings = async (page = 1) => {
    const token = getToken();
    if (!token) {
      setError("Please log in to view recordings.");
      router.replace("/auth");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/aibot?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.clear();
          setError("Session expired. Please log in again.");
          router.replace("/auth");
          return;
        }
        throw new Error("Failed to fetch recordings");
      }

      const { data, meta } = await res.json();
      const formattedData = Array.isArray(data)
        ? data.sort((a, b) => new Date(b.Date) - new Date(a.Date))
        : [];

      setRecordings(formattedData);
      setFilteredRecordings(formattedData);
      setTotalPages(meta.totalPages || 1);
      setTotalRecords(meta.total || formattedData.length);
      setLimit(meta.limit || 50);
      setCurrentPage(meta.page || 1);
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
      setError(error.message);
      setRecordings([]);
      setFilteredRecordings([]);
      setTotalPages(1);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle status change with API update
  const handleStatusChange = async (recordingId, newStatusText) => {
    const token = getToken();
    if (!token) {
      setError("Please log in to update status.");
      router.replace("/auth");
      return;
    }

    try {
      // Update status on server using your existing endpoint
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

      if (!res.ok) {
        throw new Error("Failed to update status on server");
      }

      const result = await res.json();

      // Update local recordings state with the new status
      setRecordings((prevRecordings) =>
        prevRecordings.map((rec) =>
          rec._id === recordingId
            ? { ...rec, has_added: result.call.has_added }
            : rec
        )
      );

      toast.success(`Status updated to ${newStatusText}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  // Fetch recordings on mount and when page changes
  useEffect(() => {
    fetchRecordings(currentPage);
  }, [currentPage]);

  // Apply client-side filtering for date, search, and status
  useEffect(() => {
    let filtered = recordings;

    if (filterDate) {
      filtered = filtered.filter((rec) => {
        const recDate = new Date(rec.Date).toISOString().split("T")[0];
        return recDate === filterDate;
      });
    }

    if (searchTerm) {
      filtered = filtered.filter((rec) =>
        rec.To?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((rec) => {
        const currentStatus = rec.has_added ? "Done" : "Pending";
        return currentStatus === statusFilter;
      });
    }

    setFilteredRecordings(filtered);
  }, [filterDate, recordings, searchTerm, statusFilter]);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const month = [
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
    ][date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
  };

  // Handle copy number to clipboard
  const handleCopy = (number) => {
    const cleanNumber = number?.replace(/^(\+91|91)/, "");
    navigator.clipboard.writeText(cleanNumber);
    toast.success(`Number copied: ${cleanNumber}`);
  };

  // Handle audio play/pause
  const handleAudioToggle = (audioId) => {
    if (playingAudio === audioId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(audioId);
    }
  };

  // Get current filter summary for display
  const getFilterSummary = () => {
    const filters = [];
    if (statusFilter) filters.push(`Status: ${statusFilter}`);
    if (filterDate) filters.push(`Date: ${filterDate}`);
    if (searchTerm) filters.push(`Search: "${searchTerm}"`);
    return filters.length > 0 ? filters.join(" | ") : "No filters applied";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
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

            {/* Download Info Display */}
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-blue-50 px-4 py-2 rounded-lg shadow-sm border border-blue-200">
              <span className="font-medium text-blue-900">
                Download: {getFilterSummary()}
              </span>
            </div>

            {/* Download Limit Selector */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm border">
              <label className="text-sm text-slate-600 font-medium">
                Limit:
              </label>
              <select
                value={downloadLimit}
                onChange={(e) => setDownloadLimit(Number(e.target.value))}
                className="text-sm border-0 focus:ring-1 focus:ring-purple-500 rounded px-2 py-1 bg-slate-50"
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={250}>250</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
                <option value={999999}>All</option>
              </select>
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

        {/* Error Message */}
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
            <span className="text-sm text-slate-500">
              (Applied to both table view and download)
            </span>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate("")}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending Only</option>
                <option value="Done">Done Only</option>
              </select>
              {statusFilter && (
                <button
                  onClick={() => setStatusFilter("")}
                  className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table with Fixed Header and Scrollable Body */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900"></div>
                <span className="text-slate-600">Loading recordings...</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[600px]">
              {/* Fixed Header */}
              <div className="flex-shrink-0 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[140px]">
                        Date & Time
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[100px]">
                        From
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[120px]">
                        To
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[200px]">
                        Audio
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[80px]">
                        Trees
                      </th>
                      <th className="text-left p-4 font-semibold text-slate-700 min-w-[100px]">
                        Status
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-auto">
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
                                {formatDate(rec.Date)
                                  .split(" ")
                                  .slice(0, 3)
                                  .join(" ")}
                              </div>
                              <div className="text-slate-500">
                                {formatDate(rec.Date)
                                  .split(" ")
                                  .slice(3)
                                  .join(" ")}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 min-w-[100px]">
                            <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                              {rec.From}
                            </span>
                          </td>
                          <td className="p-4 min-w-[120px]">
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
                          <td className="p-4 min-w-[200px]">
                            <div className="flex items-center gap-2">
                              <audio
                                controls
                                className="h-8"
                                src={rec.RecordingURL}
                                onPlay={() => handleAudioToggle(rec._id)}
                                onPause={() => handleAudioToggle(null)}
                              />
                              <button
                                onClick={() =>
                                  window.open(rec.RecordingURL, "_blank")
                                }
                                className="p-1 hover:bg-slate-200 rounded transition-colors"
                                title="Download audio"
                              >
                                <Download className="h-3 w-3 text-slate-600" />
                              </button>
                            </div>
                          </td>
                          <td className="p-4 min-w-[80px]">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">
                                {rec.no_of_trees || 0}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 min-w-[100px]">
                            <select
                              value={rec.has_added ? "Done" : "Pending"}
                              onChange={(e) =>
                                handleStatusChange(rec._id, e.target.value)
                              }
                              className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer ${
                                rec.has_added
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Done">Done</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t bg-slate-50">
              <div className="text-sm text-slate-600">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * limit, totalRecords)}
                </span>{" "}
                of <span className="font-medium">{totalRecords}</span> records
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`h-8 w-8 rounded border text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? "border-slate-200 text-slate-400 cursor-not-allowed"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {"<<"}
                </button>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`h-8 w-8 rounded border flex items-center justify-center transition-colors ${
                    currentPage === 1
                      ? "border-slate-200 text-slate-400 cursor-not-allowed"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-purple-600 text-white border border-purple-600"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className={`h-8 w-8 rounded border flex items-center justify-center transition-colors ${
                    currentPage === totalPages
                      ? "border-slate-200 text-slate-400 cursor-not-allowed"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`h-8 w-8 rounded border text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? "border-slate-200 text-slate-400 cursor-not-allowed"
                      : "border-slate-300 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {">>"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingTable;
