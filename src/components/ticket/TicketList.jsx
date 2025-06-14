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
  handleUserClick: propHandleUserClick,
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

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const toggleUserDropdown = (userName) =>
    setExpandedUsers((prev) => ({
      ...prev,
      [userName]: !prev[userName],
    }));

  const handleUserClick = (userTickets) => {
    if (propHandleUserClick) {
      propHandleUserClick(userTickets);
    }
    const userName = userTickets[0]?.name || "Unknown User";
    toggleUserDropdown(userName);
  };

  const groupedTickets = tickets.reduce((acc, ticket) => {
    const userName = ticket.name || "Unknown User";
    acc[userName] = acc[userName] || [];
    acc[userName].push(ticket);
    return acc;
  }, {});

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

  const assignTicketsToAgents = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.replace("/auth");
        return;
      }

      if (!selectedTicketIds.length || !selectedAgents.length) {
        throw new Error("No tickets or agents selected");
      }

      setAssigning(true);

      const errors = [];
      for (const ticketId of selectedTicketIds) {
        try {
          const ticket = tickets.find((t) => (t._id || t.id) === ticketId);
          if (!ticket) {
            throw new Error(`Ticket ${ticketId} not found in tickets prop`);
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

  const handleTicketCheckboxToggle = (ticketId) => {
    setSelectedTicketIds((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleAgentCheckboxToggle = (agentId) => {
    setSelectedAgents((prev) => {
      const newAgents = prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId];
      if (typeof handleAssignedAgentToggle === "function") {
        handleAssignedAgentToggle(agentId);
      }
      return newAgents;
    });
  };

  const handleSendAssignments = () => {
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

  useEffect(() => {
    fetchAgents();
  }, []);

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

  return (
    <div className="relative">
      {/* Sticky Assignment Bar */}
      {selectedTicketIds.length > 0 && (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm p-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-1.5 rounded-full">
                <CircleCheck className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-800">
                {selectedTicketIds.length} ticket
                {selectedTicketIds.length !== 1 ? "s" : ""} selected
              </span>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-64" ref={agentDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAgentDropdownOpen((prev) => !prev)}
                  className="w-full h-10 flex justify-between items-center border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  {selectedAgents.length > 0 ? (
                    <span className="truncate">
                      {selectedAgents.length} agent
                      {selectedAgents.length > 1 ? "s" : ""}
                    </span>
                  ) : (
                    "Assign to agents"
                  )}
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      agentDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {agentDropdownOpen && (
                  <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {agents.length > 0 ? (
                      agents.map((agent) => (
                        <label
                          key={agent._id}
                          className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
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
                          <span className="text-sm text-gray-700">
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

              {selectedAgents.length > 0 && (
                <button
                  onClick={handleSendAssignments}
                  disabled={assigning}
                  className="h-10 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 flex items-center gap-2 transition-colors"
                >
                  {assigning ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : null}
                  Assign Now
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedTicketIds([])}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Ticket List */}
      <div className="space-y-4 p-4">
        {Object.entries(groupedTickets).map(([userName, userTickets]) => {
          const isExpanded = isAgentOrAdmin ? true : expandedUsers[userName];
          const todayAndOverdue = userTickets.filter(
            (t) => getDateCategory(t.dueDate) <= 2
          );
          const otherTickets = userTickets.filter(
            (t) => getDateCategory(t.dueDate) > 2
          );
          const hasOtherTickets = otherTickets.length > 0;

          return (
            <div
              key={userName}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* User Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => handleUserClick(userTickets)}
                >
                  <div className="bg-purple-100 p-2 rounded-full">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {userName}
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {userTickets.length} ticket
                    {userTickets.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {!isAgentOrAdmin && hasOtherTickets && (
                  <button
                    onClick={() => toggleUserDropdown(userName)}
                    className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    {isExpanded ? "Hide" : "Show All"}
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </div>

              {/* Tickets */}
              <div className="divide-y divide-gray-100">
                {[...todayAndOverdue, ...(isExpanded ? otherTickets : [])]
                  .sort(
                    (a, b) =>
                      getDateCategory(a.dueDate) - getDateCategory(b.dueDate)
                  )
                  .map((ticket) => {
                    // Get assigned agent names
                    const assignedAgents = ticket.assigned_to
                      ? agents
                          .filter((agent) =>
                            ticket.assigned_to.includes(agent._id)
                          )
                          .map((agent) => agent.name)
                      : [];

                    return (
                      <div
                        key={ticket._id || ticket.id}
                        className={`p-3 hover:bg-gray-50 transition-colors ${
                          selectedTicketIds.includes(ticket._id || ticket.id)
                            ? "bg-purple-50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedTicketIds.includes(
                              ticket._id || ticket.id
                            )}
                            onChange={() =>
                              handleTicketCheckboxToggle(
                                ticket._id || ticket.id
                              )
                            }
                            className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          />

                          <div
                            className="flex-1 flex items-center gap-3 cursor-pointer"
                            onClick={() => handleTicketClick(ticket)}
                          >
                            {/* Priority + Due Date */}
                            <div
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityBgColor(
                                ticket.priority
                              )} ${getPriorityColor(ticket.priority)}`}
                            >
                              {getDateLabel(ticket.dueDate)}
                            </div>

                            {/* Task */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {ticket.task || "No Task"}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">
                                  Due: {getFormattedDate(ticket.dueDate)}
                                </p>
                                {assignedAgents.length > 0 && (
                                  <span className="text-xs bg-blue-100 ml-[800px] text-blue-800 px-2 py-0.5 rounded-full">
                                    {assignedAgents.length > 1
                                      ? `${assignedAgents.length} agents`
                                      : assignedAgents[0]}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status Indicator */}
                            <CircleCheck
                              className={`w-4 h-4 flex-shrink-0 ${getPriorityColor(
                                ticket.priority
                              )}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
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
  handleUserClick: PropTypes.func,
  handleTicketClick: PropTypes.func.isRequired,
  isAgentOrAdmin: PropTypes.bool,
  getPriorityColor: PropTypes.func.isRequired,
  getPriorityBgColor: PropTypes.func.isRequired,
  handleAssignedAgentToggle: PropTypes.func,
};

export default TicketList;
