"use client";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [data, setData] = useState([]); // for campaign_report
  const [noOfPickups, setNoOfPickups] = useState(0); // NEW state for pickups
  const [loading, setLoading] = useState(false);
  const [showToday, setShowToday] = useState(true);
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

      // Set no_of_pickups if exists
      if (resultArray.length > 0 && resultArray[0].no_of_pickups) {
        setNoOfPickups(resultArray[0].no_of_pickups);
      } else {
        setNoOfPickups(0);
      }

      // Flatten and format campaign report data
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

  return (
    <div className="p-6">
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

        <div className="flex gap-6 flex-wrap">
          {/* Called */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-100 to-purple-50 px-4 py-3 rounded-xl shadow-sm">
            <div className="flex items-center justify-center bg-purple-500 text-white w-10 h-10 rounded-full font-bold">
              📞
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Pickups</div>
              <div className="text-xl font-semibold text-purple-700">
                {noOfPickups}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
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

      <div className="border rounded-xl shadow-sm bg-white overflow-hidden mt-5">
        <div id="table-container" className="max-h-[500px] overflow-auto">
          <table className="w-full text-left border-collapse text-sm rounded-xl">
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
              ) : data.length > 0 ? (
                data.map((farmer, index) => (
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
                    No campaign reports available for this date
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
