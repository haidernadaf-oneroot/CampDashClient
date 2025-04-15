"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [nameInput, setNameInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const router = useRouter();

  // Handle authentication
  const handleAuthenticate = () => {
    const storedName = localStorage.getItem("auth_name");
    const storedNumber = localStorage.getItem("auth_number");

    if (!storedName || !storedNumber) {
      alert("No credentials found. Please contact the administrator.");
      return;
    }

    if (
      nameInput.trim().toLowerCase() === storedName.toLowerCase() &&
      numberInput.trim() === storedNumber
    ) {
      localStorage.setItem("isAuthenticated", "true");
      router.push("/Farmer");
    } else {
      alert("Incorrect name or number. Try again.");
    }

    resetInputs();
  };

  const resetInputs = () => {
    setNameInput("");
    setNumberInput("");
  };

  // Set credentials (for development/testing)
  useEffect(() => {
    if (!localStorage.getItem("auth_name")) {
      localStorage.setItem("auth_name", "dummy");
    }
    if (!localStorage.getItem("auth_number")) {
      localStorage.setItem("auth_number", "8143717521");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 via-green-500 to-green-500 ">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center text-black">
          Authentication
        </h2>

        <input
          type="text"
          placeholder="Enter Name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-green-500"
        />

        <input
          type="password"
          placeholder="Enter Number"
          value={numberInput}
          onChange={(e) => setNumberInput(e.target.value)}
          className="w-full p-2 mb-4 border rounded-md focus:outline-none text-black focus:ring-2 focus:ring-green-500"
        />

        <button
          onClick={handleAuthenticate}
          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
