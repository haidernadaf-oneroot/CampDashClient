"use client";
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

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [consentFilter, setConsentFilter] = useState("");
  const itemsPerPage = 50;

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

  // Filter buyers based on search term & consent filter
  const filteredFarmer = farmer.filter((farmer) => {
    const matchesSearch =
      farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.number.includes(searchTerm);

    if (consentFilter === "yes")
      return matchesSearch && farmer.consent === "yes";
    if (consentFilter === "No")
      return matchesSearch && (!farmer.consent || farmer.consent === "");
    return matchesSearch;
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
            farmer.createdAt,
            farmer.village,
            farmer.taluk,
            farmer.district,
            farmer.number,
            farmer.identity,
            farmer.consent || "No" || "yes",
            farmer.consent_date,
            farmer.updatedAt,
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

  return (
    <div className="mt-28 ">
      <div className="flex items-center gap-4 mb-4 mt-10">
        <label className="text-gray-700">Filter Consent:</label>
        <select
          value={consentFilter}
          onChange={(e) => setConsentFilter(e.target.value)}
          className="border p-2 rounded text-black"
        >
          <option value="">All</option>
          <option value="yes">Yes</option>
          <option value="No">No</option>
        </select>
        {consentFilter === "yes" && (
          <button
            onClick={handleDownload}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Download Table
          </button>
        )}
        {consentFilter === "No" && (
          <button
            onClick={handleDownload}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Download Table
          </button>
        )}

        <input
          type="text"
          placeholder="Search by name or number......."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-[900px]"
        />
      </div>

      <div className="border rounded-xl shadow-sm bg-white overflow-hidden">
        <div id="table-container" className="max-h-[600px] overflow-auto">
          <table className="w-full text-left border-collapse text-sm rounded-xl">
            <thead className="sticky top-0 bg-green-50 rounded-xl">
              <tr className="border-b border-gray-200">
                {[
                  "Name",
                  "Created At",
                  "Village",
                  "Taluka",
                  "District",
                  "Number",
                  "Identity",
                  "Tags",
                  "Consent",
                  "Consent Date",
                  "Updated At",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 font-semibold text-gray-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Show Skeleton UI while loading
                [...Array(5)].map((_, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 animate-pulse"
                  >
                    {Array(10)
                      .fill("")
                      .map((_, colIndex) => (
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
                    <td className="px-4 py-3 text-gray-600">{farmer.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(farmer.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {farmer.village}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{farmer.taluk}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {farmer.district}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{farmer.number}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {farmer.identity}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{farmer.tag}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {farmer.consent}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(farmer.consent_date)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatDate(farmer.updatedAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-gray-500">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
