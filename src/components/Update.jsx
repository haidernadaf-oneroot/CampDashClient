"use client";
import { useState, useEffect } from "react";
import {
  Loader,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowUpCircle,
  X,
} from "lucide-react";

const Update = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [open, setOpen] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const [showStatus, setShowStatus] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem("updateData");
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setUpdateSuccess(false);
    setUpdateError(false);
    const url = `${process.env.NEXT_PUBLIC_API_URL}/update-database`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      localStorage.setItem("updateData", JSON.stringify(result));
      setUpdateSuccess(true);
      setShowStatus(true);
      setTimeout(() => {
        setOpen(false);
        setUpdateSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error updating:", error);
      setUpdateError(true);
      setTimeout(() => {
        setUpdateError(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    if (!data || !data.totalDbUsers || data.totalDbUsers === 0) return "0.0%";
    const percentage = (data.totalApiUsers / data.totalDbUsers) * 100;
    return `${percentage.toFixed(1)}`;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  const getLastUpdated = () => {
    if (!data || !data.timestamp) return "Never";
    const date = new Date(data.timestamp || Date.now());
    return date.toLocaleString();
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <ArrowUpCircle className="h-4 w-4" />
        Update Database
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out"
            style={{
              animation: "scaleIn 0.3s ease-out forwards",
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <RefreshCw
                    className={`h-5 w-5 text-purple-600 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                  Database Synchronization
                </h2>
                <button
                  onClick={() => !loading && setOpen(false)}
                  className={`text-gray-400 hover:text-gray-600 transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  disabled={loading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {data && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-sm text-gray-500 mb-1">
                    Last synchronized: {getLastUpdated()}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {[
                      {
                        label: "API Users",
                        value: data.totalApiUsers,
                        color: "text-purple-600",
                      },
                      {
                        label: "Database Users",
                        value: data.totalDbUsers,
                        color: "text-blue-600",
                      },
                      {
                        label: "Updated",
                        value: data.updatedCount,
                        color: "text-amber-600",
                      },
                      {
                        label: "Inserted",
                        value: data.insertedCount,
                        color: "text-indigo-600",
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="bg-white p-3 rounded-md border border-gray-100 shadow-sm"
                      >
                        <div className="text-xs text-gray-500 uppercase tracking-wider">
                          {item.label}
                        </div>
                        <div className={`text-2xl font-bold ${item.color}`}>
                          {formatNumber(item.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-gray-700">
                      Sync Progress
                    </span>
                    <span className="font-semibold text-purple-600">
                      {getProgress()}%
                    </span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r bg-purple-900 transition-all duration-700 ease-out"
                      style={{ width: `${getProgress()}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {updateSuccess && (
                <div className="mb-4 p-3 bg-purple-50 border border-purple-100 rounded-md flex items-center gap-2 text-purple-700">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <span>Database synchronized successfully!</span>
                </div>
              )}

              {updateError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span>Failed to update database. Please try again.</span>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className={`w-full px-4 py-3 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2
                    ${
                      loading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800"
                    }`}
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Synchronizing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-5 w-5" />
                      Synchronize Now
                    </>
                  )}
                </button>

                <button
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className={`w-full px-4 py-2 text-black bg-gray-100 rounded-md hover:bg-gray-200 transition-colors ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Status */}
      {data && showStatus && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-64 transform transition-all hover:scale-105">
            <div className="bg-gradient-to-r bg-purple-900 px-4 py-3 text-white flex justify-between items-center">
              <h3 className="font-medium text-sm">Database Status</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={() => setOpen(true)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setShowStatus(false)}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Sync Progress</span>
                <span>{getProgress()}%</span>
              </div>
              <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r bg-purple-950 transition-all duration-700 ease-out"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">API Users:</span>
                  <span className="font-semibold text-black">
                    {formatNumber(data.totalApiUsers)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">DB Users:</span>
                  <span className="font-semibold text-black">
                    {formatNumber(data.totalDbUsers)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Updated:</span>
                  <span className="font-semibold text-black">
                    {formatNumber(data.updatedCount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Inserted:</span>
                  <span className="font-semibold text-black">
                    {formatNumber(data.insertedCount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleIn {
          0% {
            opacity: 0;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Update;
