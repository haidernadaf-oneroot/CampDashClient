"use client";
import { useState, useEffect } from "react";
import {
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Bookmark,
} from "lucide-react";
import ToastNotifications from "@/components/ticket/ToastNotifications";
import TicketDetails from "@/components/ticket/TicketDetails";
import TicketActions from "@/components/ticket/TicketActions";
import ActivityLog from "@/components/ticket/ActivityLog";
import TicketList from "@/components/ticket/TicketList";
import UserInformation from "@/components/ticket/UserInformation";

const TicketManagement = () => {
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [editData, setEditData] = useState({});
  const [editingTicketId, setEditingTicketId] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [openTicketId, setOpenTicketId] = useState(null);
  const [agentId, setAgentId] = useState(null); // Current user’s agent ID

  const statuses = ["Opened", "Waiting For", "Closed"];
  const priorities = ["ASAP", "High", "Medium", "Low"];

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  };

  useEffect(() => {
    // Initialize agentId from localStorage
    if (typeof window !== "undefined") {
      setAgentId(localStorage.getItem("userId"));
    }
  }, []);

  const getAgentNameById = (agentId) => {
    const agent = agents.find((agent) => agent._id === agentId);
    return agent ? agent.name : "Finding Agent";
  };

  const getAssignedAgentNames = (assignedToArray, agents) => {
    if (
      !assignedToArray ||
      !Array.isArray(assignedToArray) ||
      assignedToArray.length === 0
    ) {
      return "No agents assigned";
    }
    return assignedToArray
      .map((agentId) => {
        const agent = agents.find((agent) => agent._id === agentId);
        return agent ? agent.name : "Unknown";
      })
      .join(", ");
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  const copyToClipboard = async (ticketId, number) => {
    try {
      const textToCopy = number || ticketId.slice(-8);
      await navigator.clipboard.writeText(textToCopy);
      showSuccessMessage("Ticket number copied!");
    } catch (err) {
      showErrorMessage("Failed to copy ticket number.");
      console.error("Error copying to clipboard:", err);
    }
  };

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

  useEffect(() => {
    const loadData = async () => {
      await fetchAgents();
      await fetchTickets();
    };
    loadData();
  }, []);

  const handleTicketClick = (ticket) => {
    setSelectedTickets([ticket]);
    setEditData({
      task: ticket.task || "",
      priority: ticket.priority || "Medium",
      dueDate: ticket.dueDate
        ? new Date(ticket.dueDate).toISOString().split("T")[0]
        : "",
      assignedTo: Array.isArray(ticket.assigned_to) ? ticket.assigned_to : [],
      status: ticket.status || "Opened",
      remarks: "", // Initialize as empty string
    });
    setEditingTicketId(null);
  };

  const handleUserClick = (userTickets) => {
    setSelectedTickets(userTickets);
    setEditingTicketId(null);
  };

  const handleBackToList = () => {
    setSelectedTickets([]);
    setEditingTicketId(null);
  };

  const handleEdit = (ticket) => {
    setEditingTicketId(ticket._id);
    setEditData({
      task: ticket.task || "",
      priority: ticket.priority || "Medium",
      dueDate: ticket.dueDate
        ? new Date(ticket.dueDate).toISOString().split("T")[0]
        : "",
      assignedTo: Array.isArray(ticket.assigned_to) ? ticket.assigned_to : [],
      status: ticket.status || "Opened",
      remarks: "", // Initialize as empty string
    });
  };

  const handleSave = async (ticketId) => {
    const updateData = {
      status: editData.status,
      priority: editData.priority,
      task: editData.task,
      assigned_to: editData.assignedTo,
      remarks: editData.remarks || undefined,
    };
    const success = await updateTicket(ticketId, updateData);
    if (success) {
      setEditingTicketId(null);
      setSelectedTickets((prev) =>
        prev.map((ticket) =>
          ticket._id === ticketId
            ? {
                ...ticket,
                ...editData,
                remarks: editData.remarks
                  ? [
                      ...(Array.isArray(ticket.remarks) ? ticket.remarks : []),
                      {
                        remark: editData.remarks,
                        by: agentId,
                        time: new Date(),
                      },
                    ]
                  : ticket.remarks,
              }
            : ticket
        )
      );
      setEditData((prev) => ({ ...prev, remarks: "" }));
      fetchTickets();
    }
  };

  const handleCancel = () => {
    setEditingTicketId(null);
    const ticket = selectedTickets.find((t) => t._id === editingTicketId);
    if (ticket) {
      setEditData({
        task: ticket.task || "",
        priority: ticket.priority || "Medium",
        dueDate: ticket.dueDate
          ? new Date(ticket.dueDate).toISOString().split("T")[0]
          : "",
        assignedTo: Array.isArray(ticket.assigned_to) ? ticket.assigned_to : [],
        status: ticket.status || "Opened",
        remarks: "",
      });
    }
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
      assignedTo: (Array.isArray(prev.assignedTo)
        ? prev.assignedTo
        : []
      ).includes(agentId)
        ? (Array.isArray(prev.assignedTo) ? prev.assignedTo : []).filter(
            (id) => id !== agentId
          )
        : [...(Array.isArray(prev.assignedTo) ? prev.assignedTo : []), agentId],
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "ASAP":
        return "text-red-800";
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "ASAP":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-red-50 text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date as day/month/year
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      {selectedTickets.length > 0 ? (
        <div className="min-h-screen bg-gray-100 p-3 sm:p-4 lg:p-6">
          <ToastNotifications />
          <div className="max-w-7xl mx-auto">
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-slide-in">
                <CheckCircle className="text-green-600" size={18} />
                <span className="text-green-800 text-sm">{successMessage}</span>
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-slide-in">
                <AlertCircle className="text-red-600" size={18} />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium transition-colors text-sm"
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
            </div>
            <div>
              <UserInformation
                selectedTickets={selectedTickets}
                copyToClipboard={copyToClipboard}
              />
            </div>

            {selectedTickets.map((ticket) => {
              const isOpen = openTicketId === ticket._id;
              return (
                <div
                  key={ticket._id}
                  className="border mt-3 rounded-lg shadow-sm bg-white overflow-hidden"
                >
                  {/* Preview Row */}
                  <div
                    className="cursor-pointer p-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
                    onClick={() =>
                      setOpenTicketId((prev) =>
                        prev === ticket._id ? null : ticket._id
                      )
                    }
                  >
                    <div className="truncate w-3/4 text-sm flex font-medium text-gray-800">
                      <div className="relative group">
                        <Bookmark
                          className={`w-5 h-5 ${getPriorityColor(
                            ticket.priority
                          )}`}
                        />
                        <div
                          className={`absolute left-0 top-6 hidden group-hover:block ${getPriorityBgColor(
                            ticket.priority
                          )} text-xs font-medium px-2 py-1 rounded-md shadow-sm z-10 whitespace-nowrap`}
                        >
                          Priority: {ticket.priority.toUpperCase()}
                        </div>
                      </div>
                      <span className="ml-5">
                        {ticket.task || "No task provided"}
                      </span>
                    </div>

                    <div className="text-xs text-purple-600 underline">
                      {formatDate(ticket.createdAt)}
                    </div>
                    <div className="text-xs text-purple-600 underline">
                      View Details
                    </div>
                  </div>

                  {/* Collapsible Section */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-[1000px] p-4" : "max-h-0"
                    } overflow-hidden`}
                  >
                    <TicketDetails
                      ticket={ticket}
                      editData={editData}
                      handleInputChange={handleInputChange}
                      handleSave={handleSave}
                      updating={updating}
                      handleAssignedAgentToggle={handleAssignedAgentToggle}
                      getAssignedAgentNames={getAssignedAgentNames}
                      agents={agents}
                      priorities={["Low", "Medium", "High", "ASAP"]}
                      agentId={agentId} // Use agentId state
                      onDeleteSuccess={(deletedId) => {
                        setTickets((prev) =>
                          prev.filter((t) => t._id !== deletedId)
                        );
                      }}
                    />

                    <div className="mt-4">
                      <ActivityLog
                        ticket={ticket}
                        getAgentNameById={getAgentNameById}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
          <ToastNotifications />
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
              Ticket Management
            </h1>
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-slide-in">
                <CheckCircle className="text-green-600" size={18} />
                <span className="text-green-800 text-sm">{successMessage}</span>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 animate-slide-in">
                <AlertCircle className="text-red-600" size={18} />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center py-10">
                <div className="flex items-center gap-2 text-purple-600">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-base">Loading tickets...</span>
                </div>
              </div>
            )}
            {!loading && !error && tickets.length === 0 && (
              <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <User className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No tickets found
                </h3>
                <p className="text-gray-500 text-sm">
                  There are currently no tickets to display.
                </p>
              </div>
            )}
            {!loading && tickets.length > 0 && (
              <TicketList
                tickets={tickets}
                handleUserClick={handleUserClick}
                handleTicketClick={handleTicketClick}
                getPriorityColor={getPriorityColor}
                getPriorityBgColor={getPriorityBgColor}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TicketManagement;
