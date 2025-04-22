import React, { useState } from "react";
import { Loader, RotateCw } from "lucide-react";

const Update = () => {
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const url = "http://localhost:3005/update-database";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      alert(JSON.stringify(data));
    } catch (error) {
      console.error("Error updating:", error);
      alert("Failed to update database.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-end">
      <div
        onClick={!loading ? handleUpdate : undefined}
        className={`w-14 h-10 rounded-full text-black flex items-center justify-center cursor-pointer ${
          loading ? "opacity-70 pointer-events-none" : ""
        }`}
      >
        {loading ? (
          <Loader className="h-10 w-10 animate-spin text-green-600" />
        ) : (
          <Loader className="h-5 w-5" />
        )}
      </div>
    </div>
  );
};

export default Update;
