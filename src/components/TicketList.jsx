import React from "react";

function TicketList({ tickets, toggleStatus }) {
  if (tickets.length === 0)
    return <p className="text-gray-500 text-center">No tickets added yet.</p>;

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className={`p-4 rounded shadow flex-1 bg-${
            ticket.status === "Open" ? "gray-100" : "green-100"
          }`}
        >
          <div className="mb-2 flex justify-center items-center gap-3">
            <p className="font-semibold">Ticket No: {ticket.number}</p>
            <p>Description: {ticket.description}</p>
            <p>Assigned To: {ticket.assignedTo}</p>
            <p>
              Status: <span className="font-medium">{ticket.status}</span>
            </p>
          </div>
          <button
            onClick={() => toggleStatus(ticket.id)}
            className={`px-3 py-1 rounded text-white  ${
              ticket.status === "Open" ? "bg-green-500" : "bg-yellow-500"
            }`}
          >
            {ticket.status === "Open" ? "Close Ticket" : "Reopen Ticket"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default TicketList;
