"use client";

import { useEffect, useState } from "react";
import {
  Filter,
  FilterIcon,
  FilterX,
  PenIcon,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Tag,
  CheckCircle,
  DownloadIcon,
} from "lucide-react";
import Update from "@/components/Update";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
};

const Page = () => {
  const [farmer, setFarmer] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagFilter, setTagFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [consentFilter, setConsentFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [downloadedFilter, setDownloadedFilter] = useState("");
  const [editingFarmerId, setEditingFarmerId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [pincode, setPincode] = useState("");
  const [villages, setVillages] = useState([]);
  const [locationData, setLocationData] = useState(null);
  const [activeTab, setActiveTab] = useState("table");
  const [selectedColumns, setSelectedColumns] = useState([
    "name",
    "number",
    "pincode",
    "identity",
    "tag",
    "consent",
    "consent_date",
    "downloaded",
    "downloaded_date",
    "onboarded_date",
    "farmer_category",
  ]);
  const [showFilter, setShowFilter] = useState(false);
  // New state for download range modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadRange, setDownloadRange] = useState({
    from: 0,
    to: totalUsers,
  });

  const allColumns = [
    { key: "name", label: "Name" },
    { key: "gov_farmer_id", label: "Govt_ID" },
    { key: "age", label: "Age" },
    { key: "pincode", label: "Pincode" },
    { key: "hobli", label: "Hobli" },
    { key: "farmer_category", label: "Farmer Category" },
    { key: "village", label: "Village" },
    { key: "taluk", label: "Taluk" },
    { key: "district", label: "District" },
    { key: "number", label: "Mobile Number" },
    { key: "identity", label: "Identity" },
    { key: "tag", label: "Tags" },
    { key: "consent", label: "Consent" },
    { key: "consent_date", label: "Consent Date" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "downloaded", label: "Download" },
    { key: "downloaded_date", label: "Downloaded Date" },
    { key: "onboarded_date", label: "Onboarded Date" },
    { key: "coordinates", label: "Coordinates" },
  ];

  useEffect(() => {
    const fetchTags = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("API URL is not defined in environment variables");
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags`);
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags(data.length ? data : ["No tags available"]);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags(["Error loading tags"]);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const getdata = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          ...(tagFilter && { tag: tagFilter }),
          ...(consentFilter && { consent: consentFilter }),
          ...(dateFilter && { date: dateFilter }),
          ...(downloadedFilter && { downloaded: downloadedFilter }),
          ...(searchTerm && { search: searchTerm }),
          ...(categoryFilter && { category: categoryFilter }),
        });

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users?${queryParams}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setFarmer(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.totalUsers || 0);
        // Update download range 'to' default when totalUsers changes
        setDownloadRange((prev) => ({ ...prev, to: data.totalUsers || 0 }));
      } catch (error) {
        console.error("Error fetching users:", error);
        setFarmer([]);
        setTotalPages(1);
        setTotalUsers(0);
        setDownloadRange({ from: 0, to: 0 });
      } finally {
        setLoading(false);
      }
    };

    getdata();
  }, [
    currentPage,
    tagFilter,
    consentFilter,
    dateFilter,
    downloadedFilter,
    searchTerm,
    categoryFilter,
  ]);

  const fetchLocationData = async (pincodeValue) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/location/${pincodeValue}`
      );
      if (!response.ok) throw new Error("Failed to fetch location data");

      const result = await response.json();
      const data = result.data;

      setLocationData(data);
      const villageList = data.map((loc) => loc.village);
      setVillages(villageList);

      if (data.length > 0) {
        setEditFormData((prev) => ({
          ...prev,
          taluk: data[0].taluk || "",
          district: data[0].district || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      setVillages([]);
      setLocationData(null);
    }
  };

  const handleEditClick = (farmer) => {
    setEditingFarmerId(farmer._id);
    setEditFormData({ ...farmer });
    setShowEditModal(true);
    setPincode("");
    setVillages([]);
    setLocationData(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "village" && locationData) {
      const selectedLocation = locationData.find(
        (loc) => loc.village === value
      );
      if (selectedLocation) {
        setEditFormData((prev) => ({
          ...prev,
          village: value,
          taluk: selectedLocation.taluk || "",
          district: selectedLocation.district || "",
        }));
      }
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    setPincode(value);
    if (value.length === 6) {
      fetchLocationData(value);
    } else {
      setVillages([]);
      setLocationData(null);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        downloaded:
          editFormData.downloaded === true
            ? true
            : editFormData.downloaded === false
            ? false
            : null,
        _id: editingFarmerId,
        name: editFormData.name || "",
        village: editFormData.village || "",
        taluk: editFormData.taluk || "",
        district: editFormData.district || "",
        number: editFormData.number || "",
        identity: editFormData.identity || "",
        tag: editFormData.tags || "",
        __v: editFormData.__v || 0,
        createdAt: editFormData.createdAt || "",
        updatedAt: editFormData.updatedAt || "",
        onboarded_date: editFormData.onboarded_date || "",
        consent: editFormData.consent || "",
        consent_date: editFormData.consent_date || "",
        downloaded_date: editFormData.downloaded_date || "",
        farmer_category: editFormData.farmer_category || "",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${editingFarmerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedFarmer = await response.json();
      setFarmer((prev) =>
        prev.map((f) => (f._id === editingFarmerId ? updatedFarmer : f))
      );
      setShowEditModal(false);
      setEditingFarmerId(null);
    } catch (error) {
      console.error("Error updating farmer:", error);
      alert("Failed to save changes.");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingFarmerId(null);
    setPincode("");
    setVillages([]);
    setLocationData(null);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not defined in environment variables");
      }

      if (!selectedColumns || selectedColumns.length === 0) {
        alert("Please select at least one column to download.");
        setDownloading(false);
        return;
      }

      const columnsParam = selectedColumns.join(",");
      const queryParams = new URLSearchParams({
        ...(tagFilter && { tag: tagFilter }),
        ...(consentFilter && { consent: consentFilter }),
        ...(dateFilter && { date: dateFilter }),
        ...(downloadedFilter && { downloaded: downloadedFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        columns: columnsParam,
        from: downloadRange.from.toString(),
        to: downloadRange.to.toString(),
      });

      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/download-users?${queryParams}`;

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users_${tagFilter || "all"}_from_${
        downloadRange.from
      }_to_${downloadRange.to}_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading users:", error);
      alert(`Failed to download users: ${error.message}`);
    } finally {
      setDownloading(false);
      setShowDownloadModal(false); // Close the modal after download
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    consentFilter,
    searchTerm,
    tagFilter,
    dateFilter,
    downloadedFilter,
    categoryFilter,
  ]);

  useEffect(() => {
    const tableContainer = document.getElementById("table-container");
    if (tableContainer) {
      tableContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const toggleColumn = (column) => {
    setSelectedColumns((prev) => {
      const newColumns = prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column];
      return newColumns;
    });
  };

  const handleToggle = () => {
    setIsVisible((prev) => !prev);
  };

  const getStatusColor = (status) => {
    if (status === true) return "bg-green-100 text-green-800 border-green-300";
    if (status === false) return "bg-blue-100 text-blue-800 border-blue-300";
    return "bg-yellow-100 text-yellow-800 border-yellow-300";
  };

  const getStatusText = (status) => {
    if (status === true) return "App";
    if (status === false) return "On-board";
    return "Lead";
  };

  const resetFilters = () => {
    setTagFilter("");
    setConsentFilter("");
    setDateFilter("");
    setDownloadedFilter("");
    setSearchTerm("");
    setCategoryFilter("");
  };

  const displayedFarmers = farmer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Farmer Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            {isVisible ? (
              <FilterX className="h-4 w-4" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            {isVisible ? "Hide Filters" : "Show Filters"}
          </button>
          <Update />
        </div>
      </div>

      {isVisible && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium">Filter Options</h2>
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
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    Consent Status
                  </label>
                </div>
                <select
                  value={consentFilter}
                  onChange={(e) => setConsentFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="Margin Farmer">Margin</option>
                  <option value="Small Farmer">Small</option>
                  <option value="Big Farmer">Big</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    Tags
                  </label>
                </div>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  <Calendar className="h-4 w-4 text-green-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                </div>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DownloadIcon className="h-4 w-4 text-green-600" />
                  <label className="block text-sm font-medium text-gray-700">
                    Download Status
                  </label>
                </div>
                <select
                  value={downloadedFilter}
                  onChange={(e) => setDownloadedFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="yes">App</option>
                  <option value="no">On-board</option>
                  <option value="null">Lead</option>
                </select>
              </div>
            </div>

            {(consentFilter ||
              dateFilter ||
              tagFilter ||
              downloadedFilter ||
              categoryFilter) && (
              <div className="mt-6 flex justify-end">
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
                  {downloading ? "Downloading..." : "Download Filtered Data"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                  <span className="text-sm font-medium">Select Columns</span>
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
                    <div
                      key={col.key}
                      className="flex items-center space-x-2 py-1"
                    >
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

      <div className="border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "table"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setActiveTab("cards")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "cards"
                ? "border-b-2 border-green-600 text-green-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Card View
          </button>
        </div>
      </div>

      {activeTab === "table" && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div id="table-container" className="max-h-[400px] overflow-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-green-50">
                <tr className="border-b border-gray-200">
                  {selectedColumns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 font-semibold text-gray-700"
                    >
                      {allColumns.find((c) => c.key === col)?.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">
                    Actions
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
                    </tr>
                  ))
                ) : displayedFarmers.length > 0 ? (
                  displayedFarmers.map((farmer, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-green-50/50 transition-colors"
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
                                    ? "bg-green-100 text-green-800"
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
                                    ? "bg-green-100 text-green-800"
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
                          className="p-1 rounded-full text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <PenIcon className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={selectedColumns.length + 1}
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
              Showing {farmer.length > 0 ? (currentPage - 1) * 50 + 1 : 0} to{" "}
              {Math.min(currentPage * 50, totalUsers)} of {totalUsers} records
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
        </div>
      )}

      {activeTab === "cards" && (
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
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
                          <span className="text-gray-900">
                            {farmer.pincode}
                          </span>
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
              Showing {farmer.length > 0 ? (currentPage - 1) * 50 + 1 : 0} to{" "}
              {Math.min(currentPage * 50, totalUsers)} of {totalUsers} records
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
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-green-700">
                  Edit Farmer Details
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={editFormData.name || ""}
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="number"
                    name="number"
                    value={editFormData.number || ""}
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="pincode"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="pincode"
                    value={pincode}
                    onChange={handlePincodeChange}
                    maxLength={6}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter 6-digit pincode"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="village"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Village <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="village"
                    name="village"
                    value={editFormData.village || ""}
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Village</option>
                    {villages.map((village) => (
                      <option key={village} value={village}>
                        {village}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="taluk"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Taluk <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="taluk"
                    name="taluk"
                    value={editFormData.taluk || ""}
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700"
                  >
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="district"
                    name="district"
                    value={editFormData.district || ""}
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="consent"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Consent <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="consent"
                    name="consent"
                    value={editFormData.consent || ""}
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select Consent</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="consent_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Consent Date
                  </label>
                  <input
                    id="consent_date"
                    type="date"
                    name="consent_date"
                    value={
                      editFormData.consent_date
                        ? new Date(editFormData.consent_date)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="downloaded"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Downloaded <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="downloaded"
                    value={
                      editFormData.downloaded === true
                        ? "app"
                        : editFormData.downloaded === false
                        ? "on-board"
                        : "lead"
                    }
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        downloaded:
                          e.target.value === "app"
                            ? true
                            : e.target.value === "on-board"
                            ? false
                            : null,
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="lead">Lead</option>
                    <option value="app">App</option>
                    <option value="on-board">On-board</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="downloaded_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Downloaded Date
                  </label>
                  <input
                    id="downloaded_date"
                    type="date"
                    name="downloaded_date"
                    value={
                      editFormData.downloaded_date
                        ? new Date(editFormData.downloaded_date)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="onboarded_date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Onboarded Date
                  </label>
                  <input
                    id="onboarded_date"
                    type="date"
                    name="onboarded_date"
                    value={
                      editFormData.onboarded_date
                        ? new Date(editFormData.onboarded_date)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={handleEditChange}
                    className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Range Modal */}
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
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                className={`px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 ${
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
    </div>
  );
};

export default Page;
