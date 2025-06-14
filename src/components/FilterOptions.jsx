import {
  Filter,
  FilterX,
  Download,
  Calendar,
  Tag,
  CheckCircle,
  DownloadIcon,
  MapPin,
} from "lucide-react";

const FilterOptions = ({
  tags,
  districts,
  talukas,
  hoblis,
  villages,
  consentFilter,
  setConsentFilter,
  categoryFilter,
  setCategoryFilter,
  tagFilter,
  setTagFilter,
  dateFilter,
  setDateFilter,
  downloadedFilter,
  setDownloadedFilter,
  districtFilter,
  setDistrictFilter,
  talukaFilter,
  setTalukaFilter,
  hobliFilter,
  setHobliFilter,
  villageFilter,
  setVillageFilter,
  resetFilters,
  showDownloadModal,
  setShowDownloadModal,
  downloading,
  selectedColumns,
}) => (
  <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-lg font-medium text-black">Filter Options</h2>
      <button
        onClick={resetFilters}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        Reset All
      </button>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Consent Status
            </label>
          </div>
          <select
            value={consentFilter}
            onChange={(e) => setConsentFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Category
            </label>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="Margin Farmer">Margin</option>
            <option value="Small Farmer">Small</option>
            <option value="Big Farmer">Big</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Tags
            </label>
          </div>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DownloadIcon className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Download Status
            </label>
          </div>
          <select
            value={downloadedFilter}
            onChange={(e) => setDownloadedFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All</option>
            <option value="yes">App</option>
            <option value="no">On-board</option>
            <option value="null">Lead</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              District
            </label>
          </div>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Taluka
            </label>
          </div>
          <select
            value={talukaFilter}
            onChange={(e) => setTalukaFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All</option>
            {talukas.map((taluka) => (
              <option key={taluka} value={taluka}>
                {taluka}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Hobli
            </label>
          </div>
          <select
            value={hobliFilter}
            onChange={(e) => setHobliFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All</option>
            {hoblis.map((hobli) => (
              <option key={hobli} value={hobli}>
                {hobli}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Village
            </label>
          </div>
          <select
            value={villageFilter}
            onChange={(e) => setVillageFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All</option>
            {villages.map((village) => (
              <option key={village} value={village}>
                {village}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(consentFilter ||
        dateFilter ||
        tagFilter ||
        downloadedFilter ||
        categoryFilter ||
        districtFilter ||
        talukaFilter ||
        hobliFilter ||
        villageFilter) && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowDownloadModal(true)}
            disabled={downloading || selectedColumns.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              downloading || selectedColumns.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <Download className="h-4 w-4" />
            {downloading ? "Downloading..." : "Download Filtered Data"}
          </button>
        </div>
      )}
    </div>
  </div>
);

export default FilterOptions;
