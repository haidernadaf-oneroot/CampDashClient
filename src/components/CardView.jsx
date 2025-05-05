import { PenIcon, ChevronLeft, ChevronRight } from "lucide-react";

const CardView = ({
  loading,
  displayedFarmers,
  formatDate,
  getStatusText,
  handleEditClick,
  currentPage,
  totalUsers,
  totalPages,
  setCurrentPage,
  getPageNumbers,
}) => (
  <>
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((fossi, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-4 pb-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="p-4 pt-2">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : displayedFarmers.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedFarmers.map((farmer, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-4 pb-2 flex flex-row items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {farmer.name || "Unnamed Farmer"}
                </h3>
                <p className="text-sm text-gray-500">
                  {farmer.number || "No contact"}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  farmer.downloaded === true
                    ? "bg-green-100 text-green-800"
                    : farmer.downloaded === false
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {getStatusText(farmer.downloaded)}
              </span>
            </div>
            <div className="p-4 pt-2">
              <div className="space-y-2">
                {farmer.village && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Location:</span>
                    <span className="text-gray-900">
                      {farmer.village}, {farmer.taluk || "-"}
                    </span>
                  </div>
                )}
                {farmer.pincode && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Pincode:</span>
                    <span className="text-gray-900">{farmer.pincode}</span>
                  </div>
                )}
                {farmer.consent && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Consent:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        farmer.consent === "yes"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {farmer.consent || "No"}
                    </span>
                  </div>
                )}
                {farmer.consent_date && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Consent Date:</span>
                    <span className="text-gray-900">
                      {formatDate(farmer.consent_date)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleEditClick(farmer)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-green-600 bg-green-50 hover:bg-green-100"
                >
                  <PenIcon className="h-3 w-3 mr-1" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
        No data available
      </div>
    )}

    <div className="flex items-center justify-between p-4 mt-4 bg-white rounded-lg border border-gray-200">
      <span className="text-sm text-gray-600">
        Showing {displayedFarmers.length > 0 ? (currentPage - 1) * 50 + 1 : 0}{" "}
        to {Math.min(currentPage * 50, totalUsers)} of {totalUsers} records
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md border ${
            currentPage === 1
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </button>

        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${
              currentPage === page
                ? "bg-green-600 text-white"
                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
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
          className={`inline-flex items-center justify-center w-8 h-8 rounded-md border ${
            currentPage === totalPages
              ? "border-gray-200 text-gray-400 cursor-not-allowed"
              : "border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </button>
      </div>
    </div>
  </>
);

export default CardView;
