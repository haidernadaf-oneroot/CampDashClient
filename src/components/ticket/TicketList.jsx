"use client";

import { use, useEffect, useRef, useState } from "react";
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

  const getAuthToken = () => localStorage.getItem("token");

  const toggleUserDropdown = (groupKey) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleUserClick = (groupKey, userTickets) => {
    if (propHandleUserClick) {
      propHandleUserClick(userTickets);
    }
    toggleUserDropdown(groupKey);
  };

  // Group tickets by userId if exists, otherwise use number + _id
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const userId = ticket.userId || "nouser";
    const number = ticket.number || "nonumber";
    const key = ticket.userId
      ? `${ticket.userId}`
      : `${number}_${ticket._id || Math.random()}`;

    const userName = ticket.name || ticket.userInfo?.name || "Unknown User";

    if (!acc[key]) {
      acc[key] = {
        userName,
        number,
        tickets: [],
      };
    }
    acc[key].tickets.push(ticket);
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
    if (dayDiff < -1) return 1;
    if (dayDiff === 0) return 2;
    if (dayDiff === 1) return 3;
    return 4;
  };

  const fetchAgents = async () => {
    try {
      const token = getAuthToken();
      if (!token) return router.replace("/auth");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error("Non-JSON response: " + text);
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          localStorage.clear();
          router.replace("/auth");
          throw new Error("Unauthorized");
        }
        throw new Error(errorData.message || "Failed to fetch agents");
      }

      setAgents(await response.json());
    } catch (err) {
      toast.error(err.message);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="space-y-4 p-4">
      {Object.entries(groupedTickets).map(([groupKey, groupData]) => {
        const { userName, number, tickets: userTickets } = groupData;
        const isExpanded = isAgentOrAdmin ? true : expandedUsers[groupKey];
        const todayAndOverdue = userTickets.filter(
          (t) => getDateCategory(t.dueDate) <= 2
        );
        const otherTickets = userTickets.filter(
          (t) => getDateCategory(t.dueDate) > 2
        );

        return (
          <div key={groupKey} className="bg-white rounded-lg shadow border">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => handleUserClick(groupKey, userTickets)}
              >
                <div className="">
                  <div className="flex gap-2 w-80  ">
                    <User className="w-5 h-5 text-purple-600" />

                    <h3 className="text-lg font-semibold text-gray-800">
                      {userName}
                    </h3>
                  </div>
                </div>
                {/* <span className="text-xs text-gray-500 ml-2">({number})</span> */}
                {/* <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                  {userTickets.length} ticket{userTickets.length > 1 ? "s" : ""}
                </span> */}

                <div className="divide-y divide-gray-100 w-full">
                  {[...todayAndOverdue, ...otherTickets]
                    .sort(
                      (a, b) =>
                        getDateCategory(a.dueDate) - getDateCategory(b.dueDate)
                    )
                    .map((ticket, index) => {
                      const isVisible =
                        isAgentOrAdmin || index < 3 || expandedUsers[groupKey];

                      return (
                        <div
                          key={ticket._id || ticket.id}
                          className={`p-3 hover:bg-gray-50 transition-colors ${
                            isVisible ? "" : "hidden"
                          }`}
                        >
                          <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => handleTicketClick(ticket)}
                          >
                            <div
                              className={`px-2.5 ml-10 py-1 rounded-full text-xs font-medium ${getPriorityBgColor(
                                ticket.priority
                              )} ${getPriorityColor(ticket.priority)}`}
                            >
                              {getDateLabel(ticket.dueDate)}
                            </div>
                            <div className="flex-1 min-w-0 ml-10  w-[700px]">
                              <p className="text-sm font-medium text-gray-800  truncate">
                                {ticket.task || "No Task"}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 font-bold whitespace-nowrap">
                              {ticket.label || ""}
                            </div>
                            {/* <CircleCheck
                              className={`w-4 h-4 flex-shrink-0 ${getPriorityColor(
                                ticket.priority
                              )}`}
                            /> */}
                          </div>
                        </div>
                      );
                    })}
                </div>

                <div className="">{userTickets.label}</div>
              </div>
              {!isAgentOrAdmin && userTickets.length > 3 && (
                <button
                  onClick={() => toggleUserDropdown(groupKey)}
                  className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
                >
                  {expandedUsers[groupKey] ? "Hide" : "Show All"}
                  {expandedUsers[groupKey] ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              )}
            </div>
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
      userId: PropTypes.string,
      number: PropTypes.string,
      userInfo: PropTypes.object,
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
