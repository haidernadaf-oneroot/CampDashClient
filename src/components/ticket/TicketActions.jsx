// "use client";
// import { useState } from "react";
// import { Users, Clock, Calendar, ChevronDown } from "lucide-react";

// const TicketActions = ({
//   ticket,
//   isEditing,
//   editingTicketId,
//   editData,
//   handleInputChange,
//   handleAssignedAgentToggle,
//   getAssignedAgentNames,
//   agents,
//   statuses,
//   priorities,
// }) => {
//   const [agentDropdownOpen, setAgentDropdownOpen] = useState(false);

//   return (
//     <>
//       <div className="border-t pt-4 mb-4 bg-red-500">
//         <div className="flex gap-4">
//           <div className="relative">
//             <label className=" text-sm font-medium text-gray-900 mb-2"></label>
//             {isEditing && editingTicketId === ticket._id ? (
//               <div>
//                 <button
//                   type="button"
//                   onClick={() => setAgentDropdownOpen((prev) => !prev)}
//                   className="w-30 bg-red-500 flex justify-between items-center border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700  focus:outline-none focus:ring-2 focus:ring-purple-500"
//                 >
//                   {editData.assignedTo.length > 0
//                     ? agents
//                         .filter((agent) =>
//                           editData.assignedTo.includes(agent._id)
//                         )
//                         .map((a) => a.name)
//                         .join(", ")
//                     : "Select Agents"}
//                   <ChevronDown className="w-4 h-4" />
//                 </button>

//                 {agentDropdownOpen && (
//                   <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                     {agents.map((agent) => (
//                       <label
//                         key={agent._id}
//                         className="flex items-center px-3 py-2 hover:bg-gray-100"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={editData.assignedTo.includes(agent._id)}
//                           onChange={() => handleAssignedAgentToggle(agent._id)}
//                           className="mr-2 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
//                         />
//                         <span className="text-sm text-gray-700">
//                           {agent.name}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-600">
//                 {getAssignedAgentNames(ticket.assigned_to)}
//               </p>
//             )}
//           </div>

//           {/* Status dropdown */}
//           <div>
//             <select
//               value={
//                 isEditing && editingTicketId === ticket._id
//                   ? editData.status
//                   : ticket.status
//               }
//               onChange={(e) =>
//                 isEditing &&
//                 editingTicketId === ticket._id &&
//                 handleInputChange("status", e.target.value)
//               }
//               disabled={!(isEditing && editingTicketId === ticket._id)}
//               className="w-20 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-sm"
//             >
//               {statuses.map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* Priority dropdown */}
//           <div>
//             <select
//               value={
//                 isEditing && editingTicketId === ticket._id
//                   ? editData.priority
//                   : ticket.priority
//               }
//               onChange={(e) =>
//                 isEditing &&
//                 editingTicketId === ticket._id &&
//                 handleInputChange("priority", e.target.value)
//               }
//               disabled={!(isEditing && editingTicketId === ticket._id)}
//               className="w-20 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 text-sm"
//             >
//               {priorities.map((priority) => (
//                 <option key={priority} value={priority}>
//                   {priority.toUpperCase()}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default TicketActions;
