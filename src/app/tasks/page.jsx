"use client";
import { useState, useEffect } from "react";
import {
  Star,
  User,
  Calendar,
  Clock,
  Users,
  Edit3,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Phone,
  CircleCheck,
  Flag,
  Copy,
  Palmtree,
  Flame,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const TicketManagement = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updating, setUpdating] = useState(false);

  const statuses = ["Opened", "Waiting For", "Closed"];
  const priorities = ["ASAP", "high", "medium", "low"];

  // Helper function to get auth token
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  // Helper function to get agent name by ID
  const getAgentNameById = (agentId) => {
    const agent = agents.find((agent) => agent._id === agentId);
    return agent ? agent.name : "Finding Agent";
  };

  // Helper function to get assigned agent names
  const getAssignedAgentNames = (assignedToArray) => {
    if (!assignedToArray || assignedToArray.length === 0) {
      return "Not Assigned";
    }
    return assignedToArray
      .map((agentId) => getAgentNameById(agentId))
      .join(", ");
  };

  // Show success message temporarily
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Show error message temporarily
  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  // Copy ticket number to clipboard
  const copyToClipboard = async (ticketId, number) => {
    try {
      const textToCopy = number || ticketId.slice(-8);
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Ticket number copied!", {
        style: {
          background: "#ECFDF5",
          color: "#065F46",
          border: "1px solid #6EE7B7",
        },
        icon: <CheckCircle size={20} />,
      });
    } catch (err) {
      toast.error("Failed to copy ticket number.", {
        style: {
          background: "#FEF2F2",
          color: "#991B1B",
          border: "1px solid #FECACA",
        },
        icon: <AlertCircle size={20} />,
      });
      console.error("Error copying to clipboard:", err);
    }
  };

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch agents");
      }

      const data = await response.json();
      setAgents(data || []);
    } catch (err) {
      showErrorMessage(err.message);
      console.error("Error fetching agents:", err);
    }
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getAuthToken();
      if (!token) {
        showErrorMessage("User not authenticated.");
        setTickets([]);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ticket/get-opened-tickets`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      const data = await response.json();
      setTickets(data.data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
      showErrorMessage("Failed to fetch tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  // Update ticket
  const updateTicket = async (ticketId, updateData) => {
    try {
      setUpdating(true);

      const token = getAuthToken();
      if (!token) {
        showErrorMessage("User not authenticated.");
        return false;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ticket`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: ticketId,
            ...updateData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }

      const data = await response.json();
      if (data.success) {
        showSuccessMessage("Ticket updated successfully!");
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error updating ticket:", err);
      showErrorMessage("Failed to update ticket.");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      await fetchAgents();
      await fetchTickets();
    };
    loadData();
  }, []);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setEditData({
      task: ticket.task || "",
      priority: ticket.priority || "medium",
      dueDate: ticket.dueDate
        ? new Date(ticket.dueDate).toISOString().split("T")[0]
        : "",
      assignedTo: ticket.assigned_to || [],
      status: ticket.status || "Opened",
      remarks: "",
    });
    setIsEditing(false);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    const updateData = {
      status: editData.status,
      priority: editData.priority,
      task: editData.task,
      assigned_to: editData.assignedTo,
      remarks: editData.remarks || undefined,
    };

    const success = await updateTicket(selectedTicket._id, updateData);

    if (success) {
      setIsEditing(false);
      setSelectedTicket({
        ...selectedTicket,
        ...editData,
        remarks: editData.remarks
          ? [
              ...(selectedTicket.remarks || []),
              {
                remark: editData.remarks,
                by: localStorage.getItem("userId"),
                time: new Date(),
              },
            ]
          : selectedTicket.remarks,
      });
      setEditData((prev) => ({ ...prev, remarks: "" }));
      fetchTickets();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      task: selectedTicket.task || "",
      priority: selectedTicket.priority || "medium",
      dueDate: selectedTicket.dueDate
        ? new Date(selectedTicket.dueDate).toISOString().split("T")[0]
        : "",
      assignedTo: selectedTicket.assigned_to || [],
      status: selectedTicket.status || "Opened",
      remarks: "",
    });
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAssignedAgentToggle = (agentId) => {
    setEditData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(agentId)
        ? prev.assignedTo.filter((id) => id !== agentId)
        : [...prev.assignedTo, agentId],
    }));
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "asap":
        return "bg-red-500 text-white";
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "opened":
        return "bg-purple-100 text-purple-800";
      case "waiting for":
        return "bg-orange-100 text-orange-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Render crop name with icon
  const renderCropName = (cropName) => {
    switch (cropName) {
      case "Tender Coconut":
        return (
          <div className="flex items-center gap-1 text-green-700 font-medium">
            <Palmtree className="w-4 h-4" />
            Tender Coconut
          </div>
        );
      case "Dry Coconut":
        return (
          <div className="flex items-center gap-1 text-yellow-700 font-medium">
            <span className="text-lg">🥥</span>
            Dry Coconut
          </div>
        );
      case "Turmeric":
        return (
          <div className="flex items-center gap-1 text-orange-600 font-medium">
            <Flame className="w-4 h-4" />
            Turmeric
          </div>
        );
      default:
        return <p className="text-gray-700">{cropName || "Not specified"}</p>;
    }
  };

  if (selectedTicket) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <Toaster position="top-right" />
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-slide-in">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-green-800">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-slide-in">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 font-medium transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Tickets
            </button>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {updating ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
            {/* Ticket Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {selectedTicket.name || "Untitled Ticket"}
                </h1>
                <div className="flex items-center gap-2 text-gray-500">
                  <span>
                    Ticket #
                    {selectedTicket.number || selectedTicket._id.slice(-8)}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(selectedTicket._id, selectedTicket.number)
                    }
                    className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                    title="Copy Ticket Number"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {isEditing ? (
                  <>
                    <select
                      value={editData.priority}
                      onChange={(e) =>
                        handleInputChange("priority", e.target.value)
                      }
                      className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                      {priorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="px-3 py-1 rounded-full text-xs font-medium border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </>
                ) : (
                  <>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        selectedTicket.priority
                      )}`}
                    >
                      {selectedTicket.priority?.toUpperCase() || "MEDIUM"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        selectedTicket.status
                      )}`}
                    >
                      {selectedTicket.status || "Opened"}
                    </span>
                  </>
                )}
              </div>

              {/* Task Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Task Description
                </label>
                {isEditing ? (
                  <textarea
                    value={editData.task}
                    onChange={(e) => handleInputChange("task", e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="4"
                    placeholder="Task description..."
                  />
                ) : (
                  <p className="text-sm text-gray-700">
                    {selectedTicket.task || "No task description"}
                  </p>
                )}
              </div>

              {/* Crop Name */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Crop Name
                </label>
                {renderCropName(selectedTicket.cropName)}
              </div>

              {/* Remarks Input (Edit Mode Only) */}
              {isEditing && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Add Remark
                  </label>
                  <textarea
                    value={editData.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows="4"
                    placeholder="Add a remark..."
                  />
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <Calendar className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Due Date</p>
                  <p className="text-sm text-gray-600">
                    {selectedTicket.dueDate
                      ? new Date(selectedTicket.dueDate).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Assigned To
                  </p>
                  <p className="text-sm text-gray-600">
                    {getAssignedAgentNames(selectedTicket.assigned_to)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-600">
                    {selectedTicket.createdAt
                      ? new Date(selectedTicket.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Assignment Section */}
            <div className="border-t pt-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Reassign To:
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {agents.map((agent) => (
                        <label
                          key={agent._id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={editData.assignedTo.includes(agent._id)}
                            onChange={() =>
                              handleAssignedAgentToggle(agent._id)
                            }
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">
                            {agent.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {getAssignedAgentNames(selectedTicket.assigned_to)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Change Status:
                  </label>
                  <select
                    value={isEditing ? editData.status : selectedTicket.status}
                    onChange={(e) =>
                      isEditing && handleInputChange("status", e.target.value)
                    }
                    disabled={!isEditing}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Remarks History */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Activity Log
              </h3>
              {selectedTicket.remarks && selectedTicket.remarks.length > 0 ? (
                <div className="space-y-4">
                  {selectedTicket.remarks.map((remark, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-purple-500 pl-4"
                    >
                      <p className="text-sm text-gray-700">{remark.remark}</p>
                      <p className="text-xs text-gray-500 mt-1 flex gap-1">
                        By{" "}
                        <span className="font-bold text-black">
                          {getAgentNameById(remark.by)}
                        </span>{" "}
                        on
                        {new Date(remark.time).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No remarks yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Toaster position="top-right" />
      <div className="max-w-7xl ml-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Ticket Management
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-slide-in">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-slide-in">
            <AlertCircle className="text-red-600" size={20} />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-purple-600">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-lg">Loading tickets...</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && tickets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tickets found
            </h3>
            <p className="text-gray-500">
              There are currently no tickets to display.
            </p>
          </div>
        )}

        {/* Tickets List */}
        {!loading && tickets.length > 0 && (
          <div className="grid grid-cols-1 gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => handleTicketClick(ticket)}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  {/* Left Section */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {ticket.name?.[0]?.toUpperCase() || "👤"}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-2 w-full">
                      <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <User className="w-4 h-4 text-gray-400" />
                        {ticket.name || "Untitled Ticket"}
                      </div>

                      <div className="flex flex-wrap items-center gap-10 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{ticket.number || ticket._id.slice(-8)}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(ticket._id, ticket.number);
                            }}
                            className="p-1 text-gray-500 hover:text-purple-600 transition-colors"
                            title="Copy Ticket Number"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {ticket.dueDate
                            ? new Date(ticket.dueDate).toLocaleDateString()
                            : "No Date"}
                        </div>
                        <div className="flex items-center gap-1 max-w-sm">
                          <CircleCheck className="w-4 h-4 text-gray-400" />
                          <span
                            className="line-clamp-2 text-sm text-gray-700 leading-snug"
                            title={ticket.task || "No Task"}
                          >
                            {ticket.task || "No Task"}
                          </span>
                        </div>
                        {renderCropName(ticket.cropName)}
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Status and Priority */}
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status || "Opened"}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs rounded-full font-semibold ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      <Flag className="w-3 h-3 inline-block mr-1" />
                      {ticket.priority?.toUpperCase() || "MEDIUM"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketManagement;
