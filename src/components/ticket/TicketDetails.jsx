"use client";
import { useEffect, useRef, useState } from "react";
import { Bookmark, ChevronDown, Loader2, Save, X } from "lucide-react";

const TicketDetails = ({
  ticket,
  editData,
  handleInputChange,
  handleSave,
  handleCancel,
  updating,
  handleAssignedAgentToggle,
  getAssignedAgentNames = () => "No agents assigned",
  agents,
  priorities,
}) => {
  const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
  const agentDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);
  const [selectedTicket, setSelectedTicket] = useState(ticket);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        agentDropdownOpen &&
        agentDropdownRef.current &&
        !agentDropdownRef.current.contains(event.target)
      ) {
        setAgentDropdownOpen(false);
      }
      if (
        priorityDropdownOpen &&
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target)
      ) {
        setPriorityDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [agentDropdownOpen, priorityDropdownOpen]);

  useEffect(() => {
    setSelectedTicket(ticket);
  }, [ticket]);

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "high":
        return "text-orange-500";
      case "ASAP":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "ASAP":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!ticket)
    return <div className="text-red-600">Error: Ticket data missing.</div>;

  // Normalize priority for display
  const currentPriority = (
    editData?.priority ||
    ticket?.priority ||
    "medium"
  ).toLowerCase();
  const displayPriority =
    currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1);

  return (
    <div className="rounded-t-lg mt-4 bg-white p-4 shadow-sm space-y-4">
      <div className="flex flex-wrap gap-4 items-start">
        {/* Status Checkbox */}
        <div className="flex items-center space-x-2 mt-1">
          <input
            type="checkbox"
            checked={editData?.status === "Closed"}
            onChange={(e) =>
              handleInputChange("status", e.target.checked ? "Closed" : "")
            }
            className="w-5 h-5 text-purple-600 border-gray-300 rounded"
          />
        </div>

        {/* Priority Dropdown */}
        <div className="relative mt-1" ref={priorityDropdownRef}>
          <button
            onClick={() => setPriorityDropdownOpen((prev) => !prev)}
            className="flex items-center gap-1 focus:outline-none"
          >
            <Bookmark
              className={`w-6 h-6 ${getPriorityColor(currentPriority)}`}
            />
            <span className="text-sm">{displayPriority}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {priorityDropdownOpen && (
            <div className="absolute w-32 mt-1 left-0 top-7 bg-white border border-gray-300 rounded shadow max-h-32 overflow-y-auto z-20">
              {priorities?.map((priority) => {
                const normalizedPriority = priority.toLowerCase();
                return (
                  <div
                    key={normalizedPriority}
                    onClick={() => {
                      handleInputChange("priority", normalizedPriority);
                      setPriorityDropdownOpen(false);
                    }}
                    className={`flex items-center px-4 py-1 hover:bg-gray-100 cursor-pointer ${getPriorityBgColor(
                      normalizedPriority
                    )} text-xs`}
                  >
                    <span>
                      {priority.charAt(0).toUpperCase() +
                        priority.slice(1).toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Task Input */}
        <div className="flex h-7 flex-col w-full sm:w-[350px]">
          <textarea
            value={editData?.task || ""}
            onChange={(e) => handleInputChange("task", e.target.value)}
            placeholder="Task description..."
            className="w-full text-sm p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Remarks Input */}
        <div className="flex h-7 flex-col w-full sm:w-[350px]">
          <textarea
            value={editData?.remarks || ""}
            onChange={(e) => handleInputChange("remarks", e.target.value)}
            rows="1"
            placeholder="Add a remark..."
            className="w-full text-sm p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Agent Dropdown */}
        <div className="min-w-[200px]">
          <div className="relative" ref={agentDropdownRef}>
            <button
              type="button"
              onClick={() => setAgentDropdownOpen((prev) => !prev)}
              className="w-full h-7 flex justify-between items-center border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {selectedTicket?.assigned_to?.length > 0
                ? `${selectedTicket?.assigned_to.length} agent${
                    selectedTicket?.assigned_to.length > 1 ? "s" : ""
                  }`
                : "Select Agents"}
              <ChevronDown className="w-4 h-4" />
            </button>
            {agentDropdownOpen && (
              <div className="w-full mt-1 bg-white border border-gray-300 rounded shadow max-h-60 overflow-y-auto z-20">
                {agents?.length > 0 ? (
                  agents.map((agent) => (
                    <label
                      key={agent._id}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedTicket?.assigned_to?.includes(agent._id) ||
                          false
                        }
                        onChange={(e) => {
                          e.stopPropagation();
                          handleAssignedAgentToggle(agent._id);
                          setSelectedTicket((prev) => ({
                            ...prev,
                            assigned_to: e.target.checked
                              ? [...(prev.assigned_to || []), agent._id]
                              : prev.assigned_to?.filter(
                                  (id) => id !== agent._id
                                ),
                          }));
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
        </div>

        {/* Save and Cancel Buttons */}
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => {
              console.log("Saving ticket with editData:", editData);
              handleSave(ticket._id);
            }}
            disabled={updating}
            className="flex items-center w-16 h-6 gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60 shadow-sm text-sm"
          >
            {updating ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
          {/* <button
            onClick={handleCancel}
            disabled={updating}
            className="flex items-center w-16 h-6 gap-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60 shadow-sm text-sm"
          >
            <X size={14} />
            Cancel
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
