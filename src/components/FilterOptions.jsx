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
import Select from "react-select";

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
  locationLoading,
}) => {
  const tagOptions = tags.map((tag) => ({ value: tag, label: tag }));

  const handleTagChange = (selectedOptions) => {
    const selectedTags = selectedOptions
      ? selectedOptions.map((option) => option.value).join(",")
      : "";
    setTagFilter(selectedTags);
  };

  const getSelectedTags = () => {
    if (!tagFilter) return [];
    return tagFilter
      .split(",")
      .filter((tag) => tag)
      .map((tag) => ({ value: tag, label: tag }));
  };

  return (
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
          {/* Consent Status */}
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
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Category */}
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
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All</option>
              <option value="Margin Farmer">Margin</option>
              <option value="Small Farmer">Small</option>
              <option value="Big Farmer">Big</option>
            </select>
          </div>

          {/* Tags Multi Select */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-purple-600" />
              <label className="block text-sm font-medium text-gray-700">
                Tags
              </label>
            </div>
            {locationLoading.tags ? (
              <div className="text-gray-500">Loading tags...</div>
            ) : (
              <div className="relative" style={{ zIndex: 50 }}>
                <Select
                  isMulti
                  options={tagOptions}
                  value={getSelectedTags()}
                  onChange={handleTagChange}
                  placeholder="Select tags..."
                  className="basic-multi-select"
                  classNamePrefix="select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: "#d1d5db",
                      minHeight: "42px",
                      fontSize: "0.875rem",
                      "&:hover": { borderColor: "#d1d5db" },
                    }),
                    option: (base, state) => ({
                      ...base,
                      fontSize: "0.875rem",
                      backgroundColor: state.isSelected
                        ? "#8b5cf6"
                        : state.isFocused
                        ? "#f3e8ff"
                        : "white",
                      color: state.isSelected ? "white" : "#374151",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: "#ede9fe",
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: "#6b21a8",
                    }),
                  }}
                  menuPortalTarget={document.body}
                  menuPosition="fixed"
                />
              </div>
            )}
          </div>

          {/* Date */}
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
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Download Status */}
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
              className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All</option>
              <option value="yes">App</option>
              <option value="no">On-board</option>
              <option value="null">Lead</option>
            </select>
          </div>

          {/* Location Filters */}
          {[
            {
              label: "District",
              value: districtFilter,
              onChange: setDistrictFilter,
              list: districts,
              loading: locationLoading.districts,
            },
            {
              label: "Taluka",
              value: talukaFilter,
              onChange: setTalukaFilter,
              list: talukas,
              loading: locationLoading.talukas,
            },
            {
              label: "Hobli",
              value: hobliFilter,
              onChange: setHobliFilter,
              list: hoblis,
              loading: locationLoading.hoblis,
            },
            {
              label: "Village",
              value: villageFilter,
              onChange: setVillageFilter,
              list: villages,
              loading: locationLoading.villages,
            },
          ].map(({ label, value, onChange, list, loading }) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                </label>
              </div>
              {loading ? (
                <div className="text-gray-500">
                  Loading {label.toLowerCase()}s...
                </div>
              ) : (
                <select
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All</option>
                  {list.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        {/* Download Button */}
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
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 ${
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
};

export default FilterOptions;
