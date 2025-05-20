"use client";
import TicketForm from "@/components/TicketForm";
import TicketList from "@/components/TicketList";
import React, { useState } from "react";

function App() {
  const [tickets, setTickets] = useState([]);

  const addTicket = (ticket) => {
    const newTicket = {
      ...ticket,
      id: Date.now(),
      status: "Open",
    };
    setTickets([newTicket, ...tickets]);
  };

  const toggleStatus = (id) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id
          ? { ...ticket, status: ticket.status === "Open" ? "Closed" : "Open" }
          : ticket
      )
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🎫 Ticketing System
      </h1>
      <TicketForm addTicket={addTicket} />
      <TicketList tickets={tickets} toggleStatus={toggleStatus} />
    </div>
  );
}

export default App;
