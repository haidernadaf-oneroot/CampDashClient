"use client";
import React, { useState } from "react";
import { FiUploadCloud } from "react-icons/fi";

const CsvUploader = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

    setUploading(true);
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
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <FiUploadCloud className="text-purple-600 text-2xl" />
        Upload Waiting List and Download CSV
      </h2>

      <label className="block">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-purple-700
                     hover:file:bg-blue-100 cursor-pointer"
        />
      </label>

      {file && (
        <div className="text-sm text-gray-600">
          Selected file: <span className="font-medium">{file.name}</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg transition-all
          text-white font-semibold
          ${
            uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
      >
        {uploading ? "Processing..." : "Upload & Download CSV"}
      </button>
    </div>
  );
};

import { FiDownload } from "react-icons/fi";

const CsvDownloader = () => {
  const handleDownload = () => {
    // Directly open the API URL - browser will handle download
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/get-rth-farmers-api`,
      "_blank"
    );
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white rounded-2xl shadow-lg p-8 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <FiDownload className="text-black text-2xl" />[ Status ON ] Download CSV
        from API
      </h2>

      <button
        onClick={handleDownload}
        className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-lg transition-all
          text-white font-semibold bg-black hover:bg-gray-900"
      >
        Download CSV
      </button>
    </div>
  );
};

// Main Page Component
const Page = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row gap-8 p-8">
      <div className="w-full lg:w-1/2">
        <CsvUploader />
      </div>
      <div className="w-full lg:w-1/2">
        <CsvDownloader />
      </div>
    </div>
  );
};

export default Page;
