"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  FiChevronUp,
  FiChevronDown,
  FiSearch,
  FiCalendar,
} from "react-icons/fi";
import { Trash2 } from "lucide-react"; // 👈 Importing the trash icon

const UserDataTable = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc",
  });
  const recordsPerPage = 50;

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/aibotData/getUser`
      );
      const result = await response.json();
      const sorted = [...(result.data || [])].sort(
        (a, b) =>
          new Date(b._id.toString().substring(0, 8) * 1000) -
          new Date(a._id.toString().substring(0, 8) * 1000)
      );
      setUsers(sorted);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleDelete = async (number) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${number}?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/aibotData/deleteUser?number=${number}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (res.ok) {
        alert("User deleted successfully");
        fetchUsers(); // Refresh the list
      } else {
        alert(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <FiChevronUp /> : <FiChevronDown />;
  };

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(term) ||
          user.number?.includes(term) ||
          user.crop?.toLowerCase().includes(term) ||
          user.tag?.toLowerCase().includes(term)
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const startIdx = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredUsers.slice(
    startIdx,
    startIdx + recordsPerPage
  );

  return (
    <div className="p-6  min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-purple-800">User Records</h2>
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-purple-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 w-full border border-purple-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-purple-200">
          <table className="min-w-full divide-y divide-purple-200">
            <thead className="bg-purple-100">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("_id")}
                >
                  <div className="flex items-center">#{getSortIcon("_id")}</div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("name")}
                >
                  <div className="flex items-center">
                    Name {getSortIcon("name")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">
                  Number
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("crop")}
                >
                  <div className="flex items-center">
                    Crop {getSortIcon("crop")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("tag")}
                >
                  <div className="flex items-center">
                    Tag {getSortIcon("tag")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("next_harvest_date")}
                >
                  <div className="flex items-center">
                    <FiCalendar className="mr-1" />
                    Next Harvest {getSortIcon("next_harvest_date")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort("no_of_trees")}
                >
                  <div className="flex items-center">
                    Trees {getSortIcon("no_of_trees")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-purple-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-purple-200">
              {currentRecords.map((user, idx) => (
                <tr
                  key={user._id}
                  className="hover:bg-purple-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-purple-500">
                    {startIdx + idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-purple-900">
                      {user.name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-purple-500">
                    {user.number}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {user.crop || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-purple-500">
                    {user.tag || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-purple-500">
                    {formatDate(user.next_harvest_date)}
                  </td>
                  <td className="px-6 py-4 text-sm text-purple-500">
                    {user.no_of_trees || 0}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(user.number)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mt-4 px-2 gap-4">
          <div className="text-sm text-purple-500">
            Showing <span className="font-medium">{startIdx + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(startIdx + recordsPerPage, filteredUsers.length)}
            </span>{" "}
            of <span className="font-medium">{filteredUsers.length}</span>{" "}
            records
          </div>

          <div className="flex items-center space-x-2">
            {/* Go to first page */}
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-sm border border-purple-300 rounded hover:bg-purple-100 disabled:opacity-50"
            >
              &laquo;
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(currentPage - 3, 0),
                Math.min(currentPage + 2, totalPages)
              )
              .map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === pageNum
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-purple-300 hover:bg-purple-100 text-purple-700"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

            {/* Go to last page */}
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-sm border border-purple-300 rounded hover:bg-purple-100 disabled:opacity-50"
            >
              &raquo;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDataTable;
