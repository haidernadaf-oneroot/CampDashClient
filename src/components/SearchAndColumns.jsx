// components/SearchAndColumns.jsx
import { FilterIcon, Download, Search, X } from "lucide-react";

const SearchAndColumns = ({
  searchTerm,
  setSearchTerm,
  showFilter,
  setShowFilter,
  selectedColumns,
  toggleColumn,
  allColumns,
  downloading,
  setShowDownloadModal,
}) => (
  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
    <div className="relative w-full md:w-96">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search by name or number..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 rounded-md border text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>

    <div className="flex items-center gap-3">
      <div className="relative">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        >
          <FilterIcon className="h-4 w-4" />
          Columns ({selectedColumns.length})
        </button>

        {showFilter && (
          <div className="absolute right-0 mt-2 z-50 w-64 bg-white rounded-md shadow-lg border border-gray-200">
            <div className="py-2 px-3 border-b border-gray-200 flex justify-between items-center">
              <span className="text-sm font-medium text-black">
                Select Columns
              </span>
              <button
                onClick={() => setShowFilter(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto p-3 text-black">
              {allColumns.map((col) => (
                <div key={col.key} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id={`column-${col.key}`}
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label
                    htmlFor={`column-${col.key}`}
                    className="text-sm cursor-pointer"
                  >
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setShowDownloadModal(true)}
        disabled={downloading || selectedColumns.length === 0}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
          downloading || selectedColumns.length === 0
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        <Download className="h-4 w-4" />
        {downloading ? "Downloading..." : "Export CSV"}
      </button>
    </div>
  </div>
);

export default SearchAndColumns;
