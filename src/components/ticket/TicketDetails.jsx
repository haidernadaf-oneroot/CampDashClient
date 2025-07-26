"use client";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Save,
  X,
  Check,
  Users,
  MessageSquare,
  Tags,
  Tag,
} from "lucide-react";

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
  const [isFocused, setIsFocused] = useState({
    task: false,
    remarks: false,
  });

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
        return "text-emerald-400";
      case "medium":
        return "text-amber-400";
      case "high":
        return "text-orange-500";
      case "asap":
        return "text-red-500";
      default:
        return "text-gray-400";
    }
  };

  const getPriorityBgColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "bg-emerald-50 text-emerald-700";
      case "medium":
        return "bg-amber-50 text-amber-700";
      case "high":
        return "bg-orange-50 text-orange-700";
      case "asap":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getPriorityBorderColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "border-emerald-200";
      case "medium":
        return "border-amber-200";
      case "high":
        return "border-orange-200";
      case "asap":
        return "border-red-200";
      default:
        return "border-gray-200";
    }
  };

  if (!ticket)
    return (
      <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-sm">
        <div className="text-red-500 font-medium">
          Error: Ticket data missing
        </div>
      </div>
    );

  // Normalize priority for display
  const currentPriority = (
    editData?.priority ||
    ticket?.priority ||
    "medium"
  ).toLowerCase();
  const displayPriority =
    currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1);

  return (
    <div className="rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 border border-gray-200 shadow-sm space-y-6 transition-all duration-200 hover:shadow-md ">
      {/* Header Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Status Toggle */}
        <div className="relative inline-flex items-center">
          <label className="relative flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={editData?.status === "Closed"}
              onChange={(e) =>
                handleInputChange("status", e.target.checked ? "Closed" : "")
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {editData?.status === "Closed" ? "Closed" : "Open"}
            </span>
          </label>
        </div>

        {/* Priority Dropdown */}
        <div className="relative" ref={priorityDropdownRef}>
          <button
            onClick={() => setPriorityDropdownOpen((prev) => !prev)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getPriorityBorderColor(
              currentPriority
            )} bg-white shadow-xs hover:shadow-sm transition-all ${getPriorityBgColor(
              currentPriority
            )}`}
          >
            <Tag className={`w-4 h-4 ${getPriorityColor(currentPriority)}`} />
            <span className="text-sm font-medium">{displayPriority}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {priorityDropdownOpen && (
            <div
              className={`absolute z-20 mt-1 left-0 min-w-[160px] bg-white rounded-lg shadow-lg border ${getPriorityBorderColor(
                currentPriority
              )} overflow-hidden animate-fade-in`}
            >
              {priorities?.map((priority) => {
                const normalizedPriority = priority.toLowerCase();
                return (
                  <button
                    key={normalizedPriority}
                    onClick={() => {
                      handleInputChange("priority", normalizedPriority);
                      setPriorityDropdownOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-2 text-left hover:bg-gray-50 transition-colors ${getPriorityColor(
                      normalizedPriority
                    )}`}
                  >
                    <span className="text-sm font-medium">
                      {priority.charAt(0).toUpperCase() +
                        priority.slice(1).toLowerCase()}
                    </span>
                    {currentPriority === normalizedPriority && (
                      <Check className="ml-auto w-4 h-4" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save and Cancel Buttons */}
        <div className="flex gap-2">
          {/* <button
            onClick={handleCancel}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all shadow-xs hover:shadow-sm"
          >
            <X className="w-4 h-4" />
            Cancel
          </button> */}
          <button
            onClick={() => handleSave(ticket._id)}
            disabled={updating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-xs hover:shadow-sm"
          >
            {updating ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-4 flex gap-2">
        {/* Task Input */}
        <div className="space-y-1 mt-4">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Tags className="w-4 h-4 text-gray-500" />
            Task Description
          </label>
          <div
            className={`relative rounded-lg border w-[450px] h-12  ${
              isFocused.task
                ? "border-purple-300 ring-2 ring-purple-100"
                : "border-gray-300"
            } bg-white transition-all`}
          >
            <textarea
              value={editData?.task || ""}
              onChange={(e) => handleInputChange("task", e.target.value)}
              onFocus={() => setIsFocused((prev) => ({ ...prev, task: true }))}
              onBlur={() => setIsFocused((prev) => ({ ...prev, task: false }))}
              placeholder="Describe the task..."
              className="w-full p-3 text-sm rounded-lg focus:outline-none bg-transparent resize-none min-h-[80px]"
            />
          </div>
        </div>

        {/* Remarks Input */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            Remarks
          </label>
          <div
            className={`relative rounded-lg border w-[450px] h-12 ${
              isFocused.remarks
                ? "border-purple-300 ring-2 ring-purple-100"
                : "border-gray-300"
            } bg-white transition-all`}
          >
            <textarea
              value={editData?.remarks || ""}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
              onFocus={() =>
                setIsFocused((prev) => ({ ...prev, remarks: true }))
              }
              onBlur={() =>
                setIsFocused((prev) => ({ ...prev, remarks: false }))
              }
              rows="1"
              placeholder="Add any additional remarks..."
              className="w-full p-3 text-sm rounded-lg focus:outline-none bg-transparent resize-none"
            />
          </div>
        </div>

        {/* Agent Assignment */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            Assign Agents
          </label>
          <div className="relative" ref={agentDropdownRef}>
            <button
              type="button"
              onClick={() => setAgentDropdownOpen((prev) => !prev)}
              className="w-full flex justify-between items-center px-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {selectedTicket?.assigned_to?.length > 0
                    ? `${selectedTicket.assigned_to.length} agent${
                        selectedTicket.assigned_to.length > 1 ? "s" : ""
                      } selected`
                    : "Select agents"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  agentDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {agentDropdownOpen && (
              <div className=" z-20 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
                <div className="max-h-60 overflow-y-auto">
                  {agents?.length > 0 ? (
                    agents.map((agent) => (
                      <label
                        key={agent._id}
                        className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              selectedTicket?.assigned_to?.includes(
                                agent._id
                              ) || false
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
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-md peer-checked:bg-purple-600 peer-checked:border-purple-600 flex items-center justify-center transition-colors">
                            <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <span className="ml-3 text-sm text-gray-700">
                          {agent.name}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">
                      No agents available
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
