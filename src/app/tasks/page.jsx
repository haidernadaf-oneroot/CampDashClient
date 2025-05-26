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
} from "lucide-react";

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
      remarks: "", // Initialize remarks for editing
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
      remarks: editData.remarks || undefined, // Only include remarks if provided
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
                by: localStorage.getItem("userId"), // Assuming userId is stored
                time: new Date(),
              },
            ]
          : selectedTicket.remarks,
      });
      setEditData((prev) => ({ ...prev, remarks: "" })); // Clear remarks input
      fetchTickets(); // Refresh tickets list
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

  if (selectedTicket) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <span className="text-green-800">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackToList}
              className="text-purple-600 hover:text-purple-800 font-medium"
            >
              ← Back to Tickets
            </button>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Ticket Header */}
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedTicket.name || "Untitled Ticket"}
                </h1>
                <span className="text-gray-500">
                  Ticket #
                  {selectedTicket.number || selectedTicket._id.slice(-8)}
                </span>
              </div>

              <div className="flex gap-2 mb-4">
                {isEditing ? (
                  <select
                    value={editData.priority}
                    onChange={(e) =>
                      handleInputChange("priority", e.target.value)
                    }
                    className="px-3 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority.toUpperCase()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority?.toUpperCase() || "MEDIUM"}
                  </span>
                )}

                {isEditing ? (
                  <select
                    value={editData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="px-3 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-purple-300"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status || "Opened"}
                  </span>
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Task description..."
                  />
                ) : (
                  <p className="text-gray-700">
                    {selectedTicket.task || "No task description"}
                  </p>
                )}
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Add a remark..."
                  />
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <select
                      disabled
                      className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                    >
                      <option>
                        {getAssignedAgentNames(selectedTicket.assigned_to)}
                      </option>
                    </select>
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
                        <p className="font-bold text-black">
                          {" "}
                          {getAgentNameById(remark.by)}
                        </p>{" "}
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Ticket Management
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
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
          <div className="text-center py-12">
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
          <div className="bg-white rounded-lg shadow">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                onClick={() => handleTicketClick(ticket)}
                className="flex items-center p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {/* <input
                  type="checkbox"
                  className="mr-4"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="mr-4">
                  <Star className="text-gray-300" size={18} />
                </div> */}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-900">
                      {ticket.name || "Untitled Ticket"}
                    </span>
                    {/* <span className="text-gray-500">
                      #{ticket.number || ticket._id.slice(-8)}
                    </span> */}
                    <span className="text-gray-500 ">{ticket.dueDate}</span>

                    <span className="text-gray-600 flex-1">
                      {ticket.task || "No description"}
                    </span>
                  </div>
                </div>
                <div className="flex grid-cols-4 gap-4 ">
                  <div
                    className={`px-2 py-1 text-xs w-20 text-center rounded font-medium ${getStatusColor(
                      ticket.status
                    )}`}
                  >
                    {ticket.status || "Opened"}
                  </div>
                  <div
                    className={`px-6 py-1 text-xs  w-20 text-center rounded font-medium ${getPriorityColor(
                      ticket.priority
                    )}`}
                  >
                    {ticket.priority?.toUpperCase() || "MEDIUM"}
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
