import { PenIcon, ChevronLeft, ChevronRight, PenSquare } from "lucide-react";

const TableView = ({
  loading,
  displayedFarmers,
  selectedColumns,
  allColumns,
  formatDate,
  getStatusText,
  handleEditClick,
  handleTaskClick,
  currentPage,
  totalUsers,
  totalPages,
  setCurrentPage,
  getPageNumbers,
}) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    <div id="table-container" className="max-h-[400px] overflow-auto">
      <table className="w-full text-left border-collapse text-sm">
        <thead className="sticky top-0 bg-purple-50">
          <tr className="border-b border-purple-200">
            {selectedColumns.map((col) => (
              <th key={col} className="px-4 py-3 font-semibold text-gray-700">
                {allColumns.find((c) => c.key === col)?.label}
              </th>
            ))}
            <th className="px-4 py-3 font-semibold text-gray-700 text-right">
              Actions
            </th>
            <th className="px-4 py-3 font-semibold text-gray-700 text-right">
              Tasks
            </th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            [...Array(5)].map((_, index) => (
              <tr key={index} className="border-b border-gray-200">
                {selectedColumns.map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
              </tr>
            ))
          ) : displayedFarmers.length > 0 ? (
            displayedFarmers.map((farmer, index) => (
              <tr
                key={index}
                className="border-b border-gray-200 hover:bg-purple-50/50 transition-colors"
              >
                {selectedColumns.map((col) => {
                  let value = farmer[col];
                  if (
                    [
                      "createdAt",
                      "updatedAt",
                      "consent_date",
                      "downloaded_date",
                      "onboarded_date",
                    ].includes(col)
                  ) {
                    value = formatDate(value);
                  }
                  if (col === "tag" && Array.isArray(value)) {
                    value = value.join(", ");
                  }

                  return (
                    <td key={col} className="px-4 py-3 text-gray-700">
                      {col === "downloaded" ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            farmer[col] === true
                              ? "bg-purple-100 text-purple-800"
                              : farmer[col] === false
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {getStatusText(farmer[col])}
                        </span>
                      ) : col === "consent" ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            value === "yes"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {value || "No"}
                        </span>
                      ) : (
                        value || "-"
                      )}
                    </td>
                  );
                })}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleEditClick(farmer)}
                    className="p-1 rounded-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <PenIcon className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </button>
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleTaskClick(farmer)}
                    className="p-1 rounded-full text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <PenSquare className="h-4 w-4" />
                    <span className="sr-only">Change</span>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={selectedColumns.length + 2}
                className="text-center py-8 text-gray-500"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="flex items-center justify-between p-4 border-t">
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
                ? "bg-purple-600 text-white"
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
  </div>
);

export default TableView;
