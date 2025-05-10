import { X } from "lucide-react";

const DownloadModal = ({
  showDownloadModal,
  setShowDownloadModal,
  downloadRange,
  setDownloadRange,
  totalUsers,
  downloading,
  handleDownload,
}) => (
  <>
    {showDownloadModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Select Download Range
            </h2>
            <button
              onClick={() => setShowDownloadModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="from"
                className="block text-sm font-medium text-gray-700"
              >
                From Record
              </label>
              <input
                id="from"
                type="number"
                min="0"
                value={downloadRange.from}
                onChange={(e) =>
                  setDownloadRange((prev) => ({
                    ...prev,
                    from: parseInt(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="to"
                className="block text-sm font-medium text-gray-700"
              >
                To Record (Max: {totalUsers})
              </label>
              <input
                id="to"
                type="number"
                min={downloadRange.from}
                max={totalUsers}
                value={downloadRange.to}
                onChange={(e) =>
                  setDownloadRange((prev) => ({
                    ...prev,
                    to: parseInt(e.target.value),
                  }))
                }
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="px-4 py-2 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={
                downloading ||
                downloadRange.from < 0 ||
                downloadRange.to > totalUsers ||
                downloadRange.from >= downloadRange.to
              }
              className={`px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 ${
                downloading ||
                downloadRange.from < 0 ||
                downloadRange.to > totalUsers ||
                downloadRange.from >= downloadRange.to
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {downloading ? "Downloading..." : "Download"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

export default DownloadModal;
