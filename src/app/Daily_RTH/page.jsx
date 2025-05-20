"use client";
import { PhoneCall, ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [data, setData] = useState([]);
  const [noOfPickups, setNoOfPickups] = useState(0);
  const [Totalcalls, setTotalcalls] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showToday, setShowToday] = useState(true);
  const [readyFilter, setReadyFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });

  const fetchData = async (isToday = true, customDate = null) => {
    setLoading(true);
    const date = customDate || new Date().toISOString().split("T")[0];
    const endpoint = isToday ? "daily" : "pre_RTH";

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/plivo-report/${endpoint}?date=${date}`
      );
      const result = await response.json();
      const resultArray = Array.isArray(result) ? result : [result];

      setNoOfPickups(resultArray[0]?.no_of_pickups || 0);
      setTotalcalls(resultArray[0]?.calls_placed || 0);

      const formatted = resultArray.flatMap((entry) =>
        entry.campaign_report?.length
          ? entry.campaign_report.map((report) => ({
              number: report.number,
              cropname: report.crop_name || report.cropname,
              ready: report.ready,
              next_RTH_in_days:
                report.next_rth_in_days || report.next_RTH_in_days,
              campaign_date: entry.campaign_date,
            }))
          : []
      );

      setData(formatted);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setNoOfPickups(0);
      setTotalcalls(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(showToday, selectedDate);
  }, [selectedDate, showToday]);

  const handleTabChange = (tab) => {
    setShowToday(tab === "TODAY");
  };

  const filteredData =
    readyFilter === "ALL"
      ? data
      : data.filter((item) =>
          readyFilter === "YES" ? item.ready : !item.ready
        );

  const totalUsers = filteredData.length;
  const totalPages = Math.ceil(totalUsers / 50);
  const displayedFarmers = filteredData.slice(
    (currentPage - 1) * 50,
    currentPage * 50
  );

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      {/* Top Section */}
      <div className="mb-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-lg font-semibold text-black">
            Plivo Daily Report
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border px-2 py-1 rounded text-sm text-black"
          />
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-purple-50 px-4 py-3 rounded-xl shadow-sm">
            <div className="flex items-center justify-center bg-purple-100 w-10 h-10 rounded-full font-bold">
              <PhoneCall className="text-black" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Calls</div>
              <div className="text-xl font-semibold text-purple-700">
                {Totalcalls}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-purple-50 px-4 py-3 rounded-xl shadow-sm">
            <div className="flex items-center justify-center bg-purple-100 w-10 h-10 rounded-full font-bold">
              <PhoneCall className="text-green-500" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Pickups</div>
              <div className="text-xl font-semibold text-purple-700">
                {noOfPickups}
              </div>
            </div>
          </div>
        </div>

        <div className="flex border-b border-gray-300">
          <button
            onClick={() => handleTabChange("TODAY")}
            className={`px-4 py-2 font-semibold transition ${
              showToday
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            TODAY
          </button>
          <button
            onClick={() => handleTabChange("NEXT-4")}
            className={`px-4 py-2 font-semibold transition ${
              !showToday
                ? "border-b-2 border-purple-500 text-purple-600"
                : "text-gray-500 hover:text-purple-600"
            }`}
          >
            Pre-RTH
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center my-4 flex-wrap gap-4">
        <div className="text-sm text-gray-700">
          Showing {filteredData.length}{" "}
          {filteredData.length === 1 ? "entry" : "entries"}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">
            Ready Filter:
          </label>
          <select
            value={readyFilter}
            onChange={(e) => setReadyFilter(e.target.value)}
            className="border px-2 py-1 rounded text-sm text-black"
          >
            <option value="ALL">All</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
        </div>
      </div>

      <div className="border rounded-xl shadow-sm bg-white overflow-hidden flex-1 max-h-[calc(100vh-260px)]">
        <div id="table-container" className="overflow-auto h-full">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-purple-50 z-10">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Number
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Crop Name
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">Ready</th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Next RTH (days)
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">
                  Campaign Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr
                    key={index}
                    className="animate-pulse border-b border-gray-200"
                  >
                    {[...Array(5)].map((_, i) => (
                      <td key={i} className="px-4 py-3">
                        <div className="h-4 bg-gray-300 rounded w-full"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : displayedFarmers.length > 0 ? (
                displayedFarmers.map((farmer, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-purple-50"
                  >
                    <td className="px-4 py-3 text-gray-600">{farmer.number}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {farmer.cropname}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {farmer.ready ? "Yes" : "No"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {farmer.next_RTH_in_days}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(farmer.campaign_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No campaign reports available for this filter or date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
};

export default Page;
