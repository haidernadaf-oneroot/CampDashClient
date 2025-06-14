"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  CircleCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const TicketList = ({
  tickets,
  handleUserClick,
  handleTicketClick,
  isAgentOrAdmin,
  getPriorityColor,
  getPriorityBgColor,
  handleAssignedAgentToggle,
}) => {
  const [expandedUsers, setExpandedUsers] = useState({});
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [selectedTicketIds, setSelectedTicketIds] = useState([]);
  const [selectedAgents, setSelectedAgents] = useState([]);
  const [agents, setAgents] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const agentDropdownRef = useRef(null);
  const router = useRouter();

  // Define getAuthToken
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Toggle user dropdown
  const toggleUserDropdown = (userName) =>
    setExpandedUsers((prev) => ({
      ...prev,
      [userName]: !prev[userName],
    }));

  // Group tickets by user
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const userName = ticket.name || "Unknown User";
    acc[userName] = acc[userName] || [];
    acc[userName].push(ticket);
    return acc;
  }, {});

  // Date utility functions
  const getDateLabel = (dueDate) => {
    if (!dueDate) return "No Date";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    if (diff < -1) return "Overdue";
    if (diff === -1) return "Yesterday";
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return due.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  };

  const getFormattedDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }) || "Invalid Date"
      : "N/A";

  const getDateCategory = (dueDate) => {
    if (!dueDate) return 5;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ticketDate = new Date(dueDate);
    ticketDate.setHours(0, 0, 0, 0);
    const diff = ticketDate.getTime() - today.getTime();
    const dayDiff = diff / (1000 * 60 * 60 * 24);
    if (dayDiff < -1) return 1; // Overdue
    if (dayDiff === 0) return 2; // Today
    if (dayDiff === 1) return 3; // Tomorrow
    return 4; // Future
  };

  // Fetch agents from backend
  const fetchAgents = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/auth");
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response from /agent:", text);
        throw new Error("Received non-JSON response from server");
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.clear();
          router.replace("/auth");
          throw new Error("Unauthorized: Please log in again");
        }
        throw new Error(errorData.message || "Failed to fetch agents");
      }

      setAgents((await response.json()) || []);
    } catch (err) {
      console.error("Error fetching agents:", err);
      toast.error(err.message);
    }
  };

  // Assign tickets to agents
  const assignTicketsToAgents = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/auth");
        return;
      }

      console.log("Assigning tickets with payload:", {
        ticketIds: selectedTicketIds,
        agentIds: selectedAgents,
      });

      if (!selectedTicketIds.length || !selectedAgents.length) {
        throw new Error("No tickets or agents selected");
      }

      setAssigning(true);

      const errors = [];
      for (const ticketId of selectedTicketIds) {
        try {
          // Find ticket data to preserve fields
          const ticket = tickets.find((t) => (t._id || t.id) === ticketId);
          if (!ticket) {
            throw new Error(`Ticket ${ticketId} not found in tickets prop`);
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/ticket`, // Use /ticket
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                id: ticketId,
                assigned_to: selectedAgents,
                status: ticket.status || "Opened",
                priority: ticket.priority || "medium",
                task: ticket.task || "",
              }),
            }
          );

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error(`Non-JSON response from /ticket:`, text);
            throw new Error("Received non-JSON response from server");
          }

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) {
              localStorage.clear();
              router.replace("/auth");
              throw new Error("Unauthorized: Please log in again");
            }
            throw new Error(
              errorData.message || `Failed to assign ticket ${ticketId}`
            );
          }

          const data = await response.json();
          if (!data.success) {
            throw new Error(
              `Failed to assign ticket ${ticketId}: No success response`
            );
          }
        } catch (err) {
          errors.push(`Ticket ${ticketId}: ${err.message}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some assignments failed:\n${errors.join("\n")}`);
      }

      toast.success("Tickets assigned successfully!");
      setSelectedTicketIds([]);
      setSelectedAgents([]);
    } catch (err) {
      console.error("Error assigning tickets:", err);
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  // Handle checkbox toggles
  const handleTicketCheckboxToggle = (ticketId) => {
    console.log("Toggling ticket ID:", ticketId);
    setSelectedTicketIds((prev) => {
      const newIds = prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId];
      console.log("Updated selectedTicketIds:", newIds);
      return newIds;
    });
  };

  const handleAgentCheckboxToggle = (agentId) => {
    console.log("Toggling agent ID:", agentId);
    setSelectedAgents((prev) => {
      const newAgents = prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId];
      console.log("Updated selectedAgents:", newAgents);
      if (typeof handleAssignedAgentToggle === "function") {
        handleAssignedAgentToggle(agentId);
      }
      return newAgents;
    });
  };

  // Handle send button click
  const handleSendAssignments = () => {
    console.log(
      "Sending assignments with selectedTicketIds:",
      selectedTicketIds
    );
    if (selectedTicketIds.length === 0) {
      toast.error("Please select at least one ticket.");
      return;
    }
    if (selectedAgents.length === 0) {
      toast.error("Please select at least one agent.");
      return;
    }
    assignTicketsToAgents();
  };

  // Fetch agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        agentDropdownOpen &&
        agentDropdownRef.current &&
        !agentDropdownRef.current.contains(event.target)
      ) {
        setAgentDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [agentDropdownOpen]);

  // Debug tickets prop
  useEffect(() => {
    console.log("Tickets prop:", tickets);
  }, [tickets]);

  return (
    <div className="space-y-4">
      <div className="">
        {/* Agent Dropdown */}
        <div className="min-w-[200px] flex items-center gap-4 ">
          <div className="relative" ref={agentDropdownRef}>
            <button
              type="button"
              onClick={() => setAgentDropdownOpen((prev) => !prev)}
              className="w-full  h-7 flex justify-between items-center border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {selectedAgents.length > 0
                ? `${selectedAgents.length} agent${
                    selectedAgents.length > 1 ? "s" : ""
                  }`
                : "Select Agents"}
              <ChevronDown className="w-4 h-4 " />
            </button>
            {agentDropdownOpen && (
              <div className="w-full mt-1 flex border border-gray-300 rounded shadow max-h-60 overflow-y-auto z-20">
                {agents.length > 0 ? (
                  agents.map((agent) => (
                    <label
                      key={agent._id}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleAgentCheckboxToggle(agent._id);
                        }}
                        className="mr-3 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                      <span className="flex-1 text-sm text-gray-700">
                        {agent.name}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No agents available
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedTicketIds.length > 0 && selectedAgents.length > 0 && (
            <button
              onClick={handleSendAssignments}
              disabled={assigning}
              className="h-7 px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:opacity-60 flex items-center gap-1"
            >
              {assigning ? <Loader2 className="animate-spin w-4 h-4" /> : null}
              Send
            </button>
          )}
        </div>
      </div>

      {/* Ticket List */}
      {Object.entries(groupedTickets).map(([userName, userTickets]) => {
        const todayAndOverdue = userTickets.filter(
          (t) => getDateCategory(t.dueDate) <= 2
        );
        const otherTickets = userTickets.filter(
          (t) => getDateCategory(t.dueDate) > 2
        );
        const hasTodayOrOverdue = todayAndOverdue.length > 0;
        const isExpanded = isAgentOrAdmin ? true : expandedUsers[userName];

        return (
          <div
            key={userName}
            className="flex rounded-lg shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex justify-between items-center w-64">
              <div
                className="flex gap-2 cursor-pointer hover:text-purple-600"
                onClick={() => handleUserClick(userTickets)}
              >
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-lg font-semibold text-gray-900">
                  {userName}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-1 w-[700px]">
              {[
                ...(hasTodayOrOverdue ? todayAndOverdue : []),
                ...(isExpanded ? otherTickets : []),
              ]
                .sort(
                  (a, b) =>
                    getDateCategory(a.dueDate) - getDateCategory(b.dueDate)
                )
                .map((ticket) => (
                  <div
                    key={ticket._id || ticket.id}
                    className="flex items-center justify-between rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex gap-1">
                      <div className="w-7 h-6">
                        <input
                          type="checkbox"
                          className="w-6 h-5"
                          checked={selectedTicketIds.includes(
                            ticket._id || ticket.id
                          )}
                          onChange={() =>
                            handleTicketCheckboxToggle(ticket._id || ticket.id)
                          }
                        />
                      </div>
                      <div
                        className="flex items-center gap-3 flex-1"
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <div
                          className={`flex items-center gap-2 relative group ${getPriorityBgColor(
                            ticket.priority
                          )} ${getPriorityColor(
                            ticket.priority
                          )} px-2 py-1 rounded-lg`}
                        >
                          <div className="w-20 text-center font-medium text-sm">
                            {getDateLabel(ticket.dueDate)}
                          </div>
                          <div className="absolute -top-16 left-0 hidden group-hover:flex flex-col bg-white text-gray-800 text-xs px-3 py-2 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap z-20 transition-all duration-200">
                            <div>
                              <span className="font-semibold">Due:</span>{" "}
                              {getFormattedDate(ticket.dueDate)}
                            </div>
                            <div>
                              <span className="font-semibold">Priority:</span>{" "}
                              {ticket.priority?.toUpperCase() || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CircleCheck
                            className={`w-4 h-4 ${getPriorityColor(
                              ticket.priority
                            )}`}
                          />
                          <span
                            className={`line-clamp-1 text-sm leading-snug ${getPriorityColor(
                              ticket.priority
                            )}`}
                            title={ticket.task || "No Task"}
                          >
                            {ticket.task || "No Task"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {!isAgentOrAdmin && otherTickets.length > 0 && (
              <button
                onClick={() => toggleUserDropdown(userName)}
                className="flex ml-6 items-center gap-1 text-sm text-purple-700 hover:underline"
              >
                {isExpanded ? "Hide Tickets" : "Show All Tickets"}
                {isExpanded ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

TicketList.propTypes = {
  tickets: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      id: PropTypes.string,
      name: PropTypes.string,
      task: PropTypes.string,
      priority: PropTypes.string,
      dueDate: PropTypes.string,
      assigned_to: PropTypes.arrayOf(PropTypes.string),
      status: PropTypes.string,
    })
  ).isRequired,
  handleUserClick: PropTypes.func.isRequired,
  handleTicketClick: PropTypes.func.isRequired,
  isAgentOrAdmin: PropTypes.bool,
  getPriorityColor: PropTypes.func.isRequired,
  getPriorityBgColor: PropTypes.func.isRequired,
  handleAssignedAgentToggle: PropTypes.func,
};

export default TicketList;
