"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import CreateHarvesterForm from "@/components/harvesterForm/HarvesterModalForm";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

const HarvesterTable = () => {
  const [buyers, setBuyers] = useState([]);
  const [filteredBuyers, setFilteredBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [talukFilter, setTalukFilter] = useState("");
  const [marketFilter, setMarketFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const fetchBuyers = async () => {
      try {
        console.log("Fetching harvesters from http://localhost:3003/harvester");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/harvester`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
          );
        }
        const data = await response.json();
        console.log("Fetched harvesters:", data);
        // Sort by createdAt descending (newest first)
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBuyers(sortedData);
        setFilteredBuyers(sortedData);
      } catch (error) {
        console.error("Error fetching buyers:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    let filtered = buyers;

    // Phone number filter
    if (searchTerm) {
      filtered = filtered.filter((buyer) =>
        buyer.phone?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Taluk filter
    if (talukFilter) {
      filtered = filtered.filter((buyer) =>
        buyer.taluk
          ?.toString()
          .toLowerCase()
          .includes(talukFilter.toLowerCase())
      );
    }

    // Main market filter (handle array or string)
    if (marketFilter) {
      filtered = filtered.filter((buyer) => {
        if (Array.isArray(buyer.main_markets)) {
          return buyer.main_markets.some((market) =>
            market?.toLowerCase().includes(marketFilter.toLowerCase())
          );
        }
        return buyer.main_markets
          ?.toString()
          .toLowerCase()
          .includes(marketFilter.toLowerCase());
      });
    }

    // Date filter (matches yyyy-MM-dd)
    if (dateFilter) {
      filtered = filtered.filter((buyer) =>
        format(new Date(buyer.createdAt), "yyyy-MM-dd").includes(dateFilter)
      );
    }

    setFilteredBuyers(filtered);
    setCurrentPage(1);
  }, [searchTerm, talukFilter, marketFilter, dateFilter, buyers, isMounted]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this harvester?"))
      return;

    try {
      console.log(`Deleting harvester with ID: ${id}`);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/harvester/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to delete harvester");
      }

      setBuyers(buyers.filter((buyer) => buyer._id !== id));
      setFilteredBuyers(filteredBuyers.filter((buyer) => buyer._id !== id));
      console.log(`Harvester ${id} deleted successfully`);
    } catch (error) {
      console.error("Error deleting harvester:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleRowClick = (id) => {
    console.log(`Navigating to /harvester/${id}`);
    router.push(`/harvester/${id}`);
  };

  // CSV Download functionality
  const downloadCSV = () => {
    const headers = [
      "Created At",
      "Name",
      "Phone",
      "Village",
      "Taluk",
      "District",
      "Main Markets",
      "Ready to Supply",
    ];
    const rows = filteredBuyers.map((buyer) => [
      format(new Date(buyer.createdAt), "yyyy-MM-dd hh:mm:ss a"),
      buyer.name || "-",
      buyer.phone || "-",
      buyer.village || "-",
      buyer.taluk || "-",
      buyer.district || "-",
      Array.isArray(buyer.main_markets)
        ? buyer.main_markets.join(";") || "-"
        : buyer.main_markets || "-",
      buyer.ready_to_supply || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `harvesters_${new Date().toISOString()}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalItems = filteredBuyers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBuyers.slice(indexOfFirstItem, indexOfLastItem);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4 flex justify-between items-center gap-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
          />
          <input
            type="text"
            placeholder="Filter by taluk..."
            value={talukFilter}
            onChange={(e) => setTalukFilter(e.target.value)}
            className="px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
          />
          <input
            type="text"
            placeholder="Filter by main market..."
            value={marketFilter}
            onChange={(e) => setMarketFilter(e.target.value)}
            className="px-4 text-black py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
          />
          <input
            type="date"
            placeholder="Filter by date..."
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            Add Harvester
          </button>
          <button
            onClick={downloadCSV}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-black-700 transition-colors text-sm"
          >
            Download CSV
          </button>
        </div>
      </div>

      <CreateHarvesterForm
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        buyers={buyers}
        setBuyers={setBuyers}
        filteredBuyers={filteredBuyers}
        setFilteredBuyers={setFilteredBuyers}
      />

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          Error: {error}
          <br />
          <button
            onClick={() => router.push("/harvesters")}
            className="mt-4 flex items-center text-purple-600 hover:text-purple-800 mx-auto"
          >
            Back to Harvesters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden w-full">
          <div className="overflow-auto" style={{ maxHeight: "530px" }}>
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 bg-purple-50">
                <tr className="border-b border-purple-200">
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Phone
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Village
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Taluk
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    District
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Main Markets
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Ready to Supply
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((buyer) => (
                    <tr
                      key={buyer._id}
                      className="border-b border-gray-200 hover:bg-purple-50/50 transition-colors h-12 cursor-pointer"
                      onClick={() => handleRowClick(buyer._id)}
                    >
                      <td className="px-4 py-3 text-gray-700">
                        {buyer.createdAt
                          ? format(
                              new Date(buyer.createdAt),
                              "yyyy-MM-dd hh:mm:ss a"
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {buyer.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {buyer.phone || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {buyer.village || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {buyer.taluk || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {buyer.district || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {Array.isArray(buyer.main_markets)
                          ? buyer.main_markets.join(", ") || "-"
                          : buyer.main_markets || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {buyer.ready_to_supply || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(buyer._id);
                          }}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                          title="Delete Harvester"
                          aria-label="Delete Harvester"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="h-full">
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      No harvesters found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">
              Showing{" "}
              {currentItems.length > 0
                ? (currentPage - 1) * itemsPerPage + 1
                : 0}{" "}
              to {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
              {totalItems} records
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
      )}
    </div>
  );
};

export default HarvesterTable;
