"use client";
import React, { useEffect, useState } from "react";

const TableView = () => {
  const [data, setData] = useState([]);
  const [tagFilter, setTagFilter] = useState("");
  const [pressedFilter, setPressedFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [timeRangeFilter, setTimeRangeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ivr`);
      const result = await res.json();
      const sorted = result
        .slice()
        .sort((a, b) =>
          (b.called_date || b._id).localeCompare(a.called_date || a._id)
        );
      setData(sorted || []);
    } catch (err) {
      console.error("Failed to fetch IVR data:", err);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const uniqueTags = [...new Set(data.map((item) => item.tag))];

  const filteredData = data.filter((item) => {
    const tagMatch = tagFilter ? item.tag === tagFilter : true;
    const pressedMatch = pressedFilter ? item.pressed === pressedFilter : true;
    const dateMatch = dateFilter
      ? item.called_date?.slice(0, 10) === dateFilter
      : true;

    const today = new Date();
    const itemDate = item.called_date ? new Date(item.called_date) : null;
    let timeRangeMatch = true;

    if (timeRangeFilter !== "all" && itemDate) {
      if (timeRangeFilter === "today") {
        timeRangeMatch = itemDate.toDateString() === today.toDateString();
      } else if (timeRangeFilter === "yesterday") {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        timeRangeMatch = itemDate.toDateString() === yesterday.toDateString();
      } else if (timeRangeFilter === "lastweek") {
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        timeRangeMatch = itemDate >= lastWeek && itemDate <= today;
      }
    }

    return tagMatch && pressedMatch && dateMatch && timeRangeMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getPaginationRange = () => {
    const maxPagesToShow = 5;
    let start = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let end = start + maxPagesToShow - 1;

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxPagesToShow + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const downloadCSV = () => {
    const headers = ["Phone Number", "Pressed", "Tag", "Called Date"];
    const rows = filteredData.map((item) => [
      item.number,
      item.pressed || "-",
      item.tag,
      item.called_date || "—",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ivr-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            IVR Call Records
          </h2>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="">All Tags</option>
              {uniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filter by pressed"
              value={pressedFilter}
              onChange={(e) => setPressedFilter(e.target.value)}
              className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-black w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />

            <select
              value={timeRangeFilter}
              onChange={(e) => setTimeRangeFilter(e.target.value)}
              className="w-full p-3 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="lastweek">Last Week</option>
            </select>

            <button
              onClick={downloadCSV}
              className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all"
            >
              Download CSV
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-purple-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Pressed
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Tag
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Called Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item, index) => (
                    <tr
                      key={item._id}
                      className={`border-b hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4 text-gray-600">{item.number}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.pressed || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.tag}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.called_date || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center px-6 py-8 text-gray-500"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-end space-x-2 flex-wrap">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              className="px-3 py-2 rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === 1}
            >
              {"<"}
            </button>

            {getPaginationRange().map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg border ${
                  currentPage === page
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage(Math.min(currentPage + 1, totalPages))
              }
              className="px-3 py-2 rounded-lg border bg-white text-gray-700 border-gray-300 hover:bg-gray-100 disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              {">"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableView;
