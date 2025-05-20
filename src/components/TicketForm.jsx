import React, { useState } from "react";

function TicketForm({ addTicket }) {
  const [number, setNumber] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState(
    "aishwaray",
    "pavitra",
    "users-3"
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!number || !description) return;
    addTicket({ number, description, assignedTo });
    setNumber("");
    setDescription("");
    setAssignedTo("aishwaray", "pavitra", "users-3");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded shadow space-y-4 mb-6 flex justify-between items-center"
    >
      <input
        type="number"
        placeholder="Ticket Number / Phone Number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />
      <select
        value={assignedTo}
        onChange={(e) => setAssignedTo(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="Support">Pavitra</option>
        <option value="User">Aishwaraya</option>
        <option value="User">users-3</option>
        <option value="User">users-4</option>
      </select>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        Add Ticket
      </button>
    </form>
  );
}

export default TicketForm;
