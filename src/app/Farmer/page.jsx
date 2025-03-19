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
  const [tagFilter, setTagFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [consentFilter, setConsentFilter] = useState("");
  const itemsPerPage = 50;
  const [dateFilter, setDateFilter] = useState("");

  const [selectedColumns, setSelectedColumns] = useState([
    "name",
    "village",
    "taluk",
    "number",
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
    { key: "consent", label: "consent" },
    { key: "consent_date", label: "consent_date" },
    { key: "createdAt", label: "created-At" },
    { key: "updatedAt", label: "updatedAt" },
  ];

  useEffect(() => {
    const getdata = async () => {
      setLoading(true); // Start loading before fetching
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setFarmer(data);
      } catch (error) {
        console.error("Error fetching buyers:", error);
      } finally {
        setLoading(false); // Ensure loading is turned off in all cases
      }
    };

    getdata();
  }, []);

  // Extract unique tags from farmers' data
  const uniqueTags = [
    ...new Set(farmer.map((farmer) => farmer.tag).filter(Boolean)),
  ];

  // Filter buyers based on search term, consent filter, and tag filter
  const filteredFarmer = farmer.filter((farmer) => {
    const matchesSearch =
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.number.includes(searchTerm);

    const matchesConsent =
      consentFilter === "yes"
        ? farmer.consent === "yes"
        : consentFilter === "No"
        ? !farmer.consent || farmer.consent === ""
        : true;

    const matchesTag = tagFilter ? farmer.tag === tagFilter : true;

    const matchesDate = dateFilter
      ? farmer.consent_date && !isNaN(new Date(farmer.consent_date))
        ? new Date(farmer.consent_date).toISOString().split("T")[0] ===
          dateFilter
        : false
      : true;

    return matchesSearch && matchesConsent && matchesTag && matchesDate;
  });

  const totalPages = Math.ceil(filteredFarmer.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedFarmers = filteredFarmer.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [consentFilter, searchTerm]);

  const handleDownload = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Name,Created At,Village,Taluka,District,Number,Identity,Consent,Consent Date,Updated At",
        ...filteredFarmer.map((farmer) =>
          [
            farmer.name,
            formatDate(farmer.createdAt),
            farmer.village,
            farmer.taluk,
            farmer.district,
            farmer.number,
            farmer.identity,
            farmer.consent ? "Yes" : "No",
            formatDate(farmer.consent_date),
            formatDate(farmer.updatedAt),
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_farmer.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Reset `currentPage` to `1` when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [consentFilter]);

  useEffect(() => {
    const tableContainer = document.getElementById("table-container");
    if (tableContainer) {
      tableContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Pagination Logic (Fixed 5 Pages)
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
    setIsVisible((prev) => !prev); // Toggle visibility state
  };

  return (
    <div className="mt-16">
      <div className="p-6 ">
        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-300 mb-4 w-full sm:w-auto"
        >
          {isVisible ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filters Section */}
        {isVisible && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 bg-white p-6 rounded-lg shadow-md mt-4">
            {/* Consent Filter */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-semibold text-sm mb-1">
                Consent Filter
              </label>
              <select
                value={consentFilter}
                onChange={(e) => setConsentFilter(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg text-gray-800 w-full focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Tag Filter */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-semibold text-sm mb-1">
                Tag Filter
              </label>
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg text-gray-800 w-full focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                {uniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-semibold text-sm mb-1">
                Date Filter
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg text-gray-800 w-full focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Download Button */}
            {(consentFilter || dateFilter) && (
              <div className="mt-4">
                <button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg transition duration-300 h-11 mt-1"
                >
                  Download Table
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex px-3 mt-4">
        {/* Search Input */}
        <div className="flex-grow">
          <label className="sr-only">Search</label>
          <input
            type="text"
            placeholder="Search by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 p-2 rounded-md w-full sm:w-[400px] focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filter Button */}
        <div className="relative inline-block">
          <button
            className="bg-white border px-4 py-2 rounded-md flex items-center gap-2 shadow-md"
            onClick={() => setShowFilter(!showFilter)}
          >
            <FilterIcon />
            Columns
          </button>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg border rounded-md p-3 z-50 overflow-y-auto max-h-64">
              {allColumns.map((col) => (
                <label
                  key={col.key}
                  className="flex items-center space-x-2 mb-1"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox text-blue-600"
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
          <div id="table-container" className="max-h-[600px] overflow-auto">
            <table className="w-full text-left border-collapse text-sm rounded-xl">
              {/* Table Header */}
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
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {loading ? (
                  // Skeleton Loader while loading
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
                    </tr>
                  ))
                ) : selectedFarmers.length > 0 ? (
                  selectedFarmers.map((farmer, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-green-50"
                    >
                      {selectedColumns.map((col) => (
                        <td key={col} className="px-4 py-3 text-gray-600">
                          {col.includes("date") ||
                          col.includes("createdAt") ||
                          col.includes("updatedAt")
                            ? formatDate(farmer[col])
                            : farmer[col]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={selectedColumns.length}
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

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 bg-white border-t">
          <span className="text-gray-600">
            Showing {startIndex + 1} to{" "}
            {Math.min(startIndex + itemsPerPage, filteredFarmer.length)} of{" "}
            {filteredFarmer.length} records
          </span>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-green-600 rounded disabled:text-gray-400"
            >
              {"<"}
            </button>

            {/* Dynamic Page Numbers (Fixed 5 Pages) */}
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

            {/* Next Button */}
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
    </div>
  );
};

export default Page;
