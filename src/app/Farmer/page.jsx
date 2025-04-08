"use client";
import { FilterIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

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
      hour12: true, // Enables AM/PM format
    })
    .replace(",", ""); // Removes the comma between date and time
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
  const [dateFilter, setDateFilter] = useState("");
  const [downloadedFilter, setDownloadedFilter] = useState("");
  const [editingFarmerId, setEditingFarmerId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedColumns, setSelectedColumns] = useState([
    "name",
    "number",
    "identity",
    "tag",
    "consent",
    "consent_date",
    "downloaded",
    "downloaded_date",
  ]);

  const [showFilter, setShowFilter] = useState(false);

  const allColumns = [
    { key: "name", label: "Name" },
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
  ];

  // Fetch tags for the Tag Filter dropdown
  useEffect(() => {
    const fetchTags = async () => {
      try {
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

  // Fetch farmer data with filters
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
      } catch (error) {
        console.error("Error fetching users:", error);
        setFarmer([]);
        setTotalPages(1);
        setTotalUsers(0);
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
  ]);

  const handleEditClick = (farmer) => {
    setEditingFarmerId(farmer._id);
    setEditFormData({ ...farmer });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${editingFarmerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(editFormData),
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
  };

  const uniqueDistricts = [
    ...new Set(farmer.map((farmer) => farmer.district).filter(Boolean)),
  ];
  const uniqueTaluks = [
    ...new Set(farmer.map((farmer) => farmer.taluk).filter(Boolean)),
  ];

  const displayedFarmers = farmer;

  useEffect(() => {
    setCurrentPage(1);
  }, [consentFilter, searchTerm, tagFilter, dateFilter, downloadedFilter]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const queryParams = new URLSearchParams({
        ...(tagFilter && { tag: tagFilter }),
        ...(consentFilter && { consent: consentFilter }),
        ...(dateFilter && { date: dateFilter }),
        ...(downloadedFilter && { downloaded: downloadedFilter }),
        ...(searchTerm && { search: searchTerm }),
        all: "true",
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/download-users?${queryParams}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users_${tagFilter || "all"}_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading users:", error);
      alert("Failed to download users.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const tableContainer = document.getElementById("table-container");
    if (tableContainer) {
      tableContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const toggleColumn = (column) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleToggle = () => {
    setIsVisible((prev) => !prev);
  };

  //send to backend like this:
  useEffect(() => {
    if (dateFilter) {
      // No need to split, it's already in YYYY-MM-DD
      const start = new Date(`${dateFilter}T00:00:00.000Z`);
      const end = new Date(`${dateFilter}T23:59:59.999Z`);

      // use this in fetch or query
      const query = {
        consent_date: { $gte: start, $lte: end },
      };

      console.log("Final query:", query);
      // Call your backend function with this query
    }
  }, [dateFilter]);

  return (
    <div className="">
      <div className="">
        <button
          onClick={handleToggle}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-300 w-full sm:w-auto"
        >
          {isVisible ? "Hide Filters" : "Show Filters"}
        </button>

        {isVisible && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 bg-white p-6 rounded-lg shadow-md mt-4">
            <div className="flex flex-col">
              <label className="text-gray-700 font-semibold text-sm mb-1">
                Consent Filter
              </label>
              <select
                value={consentFilter}
                onChange={(e) => setConsentFilter(e.target.value)}
                className="border border-green-500 p-2 rounded-lg text-black w-full focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-black font-semibold text-sm mb-1">
                Tag Filter
              </label>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="border border-green-500 p-2 rounded-lg text-black w-full focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-semibold text-sm mb-1">
                Date Filter
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)} // value is YYYY-MM-DD
                className="border border-gray-300 p-2 rounded-lg text-gray-800 w-full focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-semibold text-sm mb-1">
                Downloaded Filter
              </label>
              <select
                value={downloadedFilter}
                onChange={(e) => setDownloadedFilter(e.target.value)}
                className="border border-green-500 p-2 rounded-lg text-black w-full focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">Dashboard</option>
                <option value="null">Lead</option>
              </select>
            </div>

            {(consentFilter || dateFilter || tagFilter || downloadedFilter) && (
              <div className="mt-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-300 h-11 mt-1 w-60 border border-gray-200 ${
                    downloading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {downloading ? "Downloading..." : "Download All"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex mt-3 gap-4">
        <div className="flex-grow">
          <label className="sr-only" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg w-full h-11 focus:ring-2 focus:ring-green-500 focus:outline-none shadow-sm"
          />
        </div>

        <div className="relative inline-block">
          <button
            className="bg-white border text-black px-4 py-2 rounded-md flex items-center gap-2 shadow-md"
            onClick={() => setShowFilter(!showFilter)}
          >
            <FilterIcon className="text-black" />
            Columns
          </button>

          {showFilter && (
            <div className="absolute right-0 mt-2 w-60 bg-white text-black shadow-lg border rounded-md p-3 z-50 overflow-y-auto max-h-64">
              {allColumns.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center space-x-2 mb-1"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox text-black"
                    checked={selectedColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border rounded-xl shadow-sm bg-white overflow-hidden mt-5">
        <div className="border rounded-xl bg-white overflow-hidden">
          <div id="table-container" className="max-h-[500px] overflow-auto">
            <table className="w-full text-left border-collapse text-sm rounded-xl">
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
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Edit
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 animate-pulse"
                    >
                      {selectedColumns.map((_, colIndex) => (
                        <td key={colIndex} className="px-4 py-3">
                          <div className="h-4 bg-gray-300 rounded w-full"></div>
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : displayedFarmers.length > 0 ? (
                  displayedFarmers.map((farmer, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-green-50"
                    >
                      {selectedColumns.map((col) => {
                        let value = farmer[col];
                        if (
                          col === "consent_date" &&
                          (!value || value.trim() === "") &&
                          farmer.downloaded_date
                        ) {
                          value = farmer.downloaded_date;
                        }
                        if (
                          [
                            "createdAt",
                            "updatedAt",
                            "consent_date",
                            "downloaded_date",
                          ].includes(col)
                        ) {
                          value = formatDate(value);
                        }
                        // Handle tags as array or string
                        if (col === "tags" && Array.isArray(value)) {
                          value = value.join(", ");
                        }

                        return (
                          <td key={col} className="px-4 py-3 text-gray-600">
                            {col === "downloaded" ? (
                              <span
                                className={`font-semibold ${
                                  farmer[col] === true
                                    ? "text-green-600"
                                    : farmer[col] === false
                                    ? "text-red-500"
                                    : "text-yellow-500"
                                }`}
                              >
                                {farmer[col] === true
                                  ? "Yes"
                                  : farmer[col] === false
                                  ? "Dashboard"
                                  : "Lead"}
                              </span>
                            ) : col === "consent" ? (
                              value ? (
                                value
                              ) : (
                                "No"
                              )
                            ) : (
                              value || "-"
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEditClick(farmer)}
                          className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={selectedColumns.length + 1}
                      className="text-center py-4 text-gray-500"
                    >
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-white border-t">
          <span className="text-gray-600">
            Showing {(currentPage - 1) * 50 + 1} to{" "}
            {Math.min(currentPage * 50, totalUsers)} of {totalUsers} records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-green-600 rounded disabled:text-gray-400"
            >
              {"<"}
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded ${
                  currentPage === page
                    ? "bg-green-100 text-green-700 font-semibold"
                    : "text-green-600"
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
              className="px-3 py-2 text-green-600 rounded disabled:text-gray-400"
            >
              {">"}
            </button>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-[800px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-green-700 mb-4">
              Farmer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 space-x-2 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mt-5">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  name="number"
                  value={editFormData.number || ""}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Village *
                </label>
                <input
                  type="text"
                  name="village"
                  value={editFormData.village || ""}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Taluk *
                </label>
                <select
                  name="taluk"
                  value={editFormData.taluk || ""}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select Taluk</option>
                  {uniqueTaluks.map((taluk) => (
                    <option key={taluk} value={taluk}>
                      {taluk}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  District *
                </label>
                <select
                  name="district"
                  value={editFormData.district || ""}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select District</option>
                  {uniqueDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preferred Crops *
                </label>
                <select
                  name="tags"
                  value={editFormData.tags || ""}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select Crop</option>
                  {tags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Consent *
                </label>
                <select
                  name="consent"
                  value={editFormData.consent || ""}
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">Select Consent</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Consent Date
                </label>
                <input
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Downloaded *
                </label>
                <select
                  name="downloaded"
                  value={
                    editFormData.downloaded === true
                      ? "yes"
                      : editFormData.downloaded === false
                      ? "no"
                      : "lead"
                  }
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      downloaded:
                        e.target.value === "yes"
                          ? true
                          : e.target.value === "no"
                          ? false
                          : null,
                    }))
                  }
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                >
                  <option value="lead">Lead</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Downloaded Date
                </label>
                <input
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
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created At
                </label>
                <input
                  type="date"
                  name="createdAt"
                  value={
                    editFormData.createdAt
                      ? new Date(editFormData.createdAt)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Updated At
                </label>
                <input
                  type="date"
                  name="updatedAt"
                  value={
                    editFormData.updatedAt
                      ? new Date(editFormData.updatedAt)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleEditChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleCancelEdit}
                className="bg-red-400 text-gray-700 px-4 py-2 rounded-md hover:bg-red-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
