"use client";
import React, { useState } from "react";

const CsvUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file.");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/non-onboard`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "non-onboarded-users.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error uploading CSV:", error);
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto space-y-4">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload and Download Processed CSV
      </button>
    </div>
  );
};

export default CsvUploader;
