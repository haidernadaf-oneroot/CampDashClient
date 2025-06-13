"use client";
import { useState } from "react";
import { User, CircleCheck, ChevronDown, ChevronUp } from "lucide-react";

const TicketList = ({ tickets, handleUserClick, handleTicketClick }) => {
  const [expandedUsers, setExpandedUsers] = useState({});

  const toggleUserDropdown = (userName) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [userName]: !prev[userName],
    }));
  };

  const groupedTickets = tickets.reduce((acc, ticket) => {
    const userName = ticket.name || "Unknown User";
    if (!acc[userName]) {
      acc[userName] = [];
    }
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

  const getFormattedDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  const getDateCategory = (dateStr) => {
    if (!dateStr) return 5;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ticketDate = new Date(dateStr);
    ticketDate.setHours(0, 0, 0, 0);
    const diff = ticketDate.getTime() - today.getTime();
    const dayDiff = diff / (1000 * 60 * 60 * 24);
    if (dayDiff < -1) return 1;
    if (dayDiff === 0) return 2;
    if (dayDiff === 1) return 3;
    return 4;
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100";
      case "medium":
        return "bg-yellow-100";
      case "low":
        return "bg-green-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedTickets).map(([userName, userTickets]) => {
        const todayAndOverdue = userTickets.filter(
          (t) =>
            getDateCategory(t.dueDate) === 1 || getDateCategory(t.dueDate) === 2
        );
        const otherTickets = userTickets.filter(
          (t) => getDateCategory(t.dueDate) > 2
        );
        const hasTodayOrOverdue = todayAndOverdue.length > 0;
        const isExpanded = expandedUsers[userName];

        return (
          <div
            key={userName}
            className="bg-white rounded-lg flex shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200"
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
                    key={ticket._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTicketClick(ticket);
                    }}
                    className="flex items-center justify-between rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {/* ✅ Hover Box */}
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

                        {/* ✅ Combined Tooltip */}
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

                      {/* Task Info */}
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
                ))}
            </div>

            <div>
              {otherTickets.length > 0 && (
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
          </div>
        );
      })}
    </div>
  );
};

export default TicketList;
