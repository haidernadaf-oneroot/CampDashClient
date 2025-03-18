"use client";
import React, { useState } from "react";
import * as Papa from "papaparse";

const CsvFieldMapper = ({
  csvHeaders,
  backendFields,
  mapping,
  onChange,
  onUpload,
}) => {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg mt-4 pr-32">
      <h2 className="text-xl font-semibold mb-4">Map CSV Fields</h2>
      <div className="grid grid-cols-2 gap-4">
        {backendFields.map((field) => (
          <div key={field} className="flex items-center space-x-2">
            <label className="w-32 font-medium">{field}</label>
            {field === "tag" || field === "identity" ? (
              <input
                type="text"
                className="border p-2 rounded-md w-full"
                placeholder={`Enter ${field}`}
                value={mapping[field] || ""}
                onChange={(e) => onChange(field, e.target.value)}
              />
            ) : (
              <select
                className="border p-2 rounded-md w-full"
                value={mapping[field] || ""}
                onChange={(e) => onChange(field, e.target.value)}
              >
                <option value="">-- Select Field --</option>
                {csvHeaders.map((header) => (
                  <option key={header} value={header}>
                    {header}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onUpload}
        className="mt-4 bg-green-700 text-white px-4 py-2 rounded-md"
      >
        Upload to Backend
      </button>
    </div>
  );
};

const Page = () => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [mapping, setMapping] = useState({});

  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      const uploadedFile = event.target.files[0];
      setFile(uploadedFile);

      Papa.parse(uploadedFile, {
        complete: (result) => {
          if (result.data.length > 0) {
            setCsvHeaders(Object.keys(result.data[0]));
            setCsvData(
              result.data.filter((row) => Object.values(row).some(Boolean))
            );
          }
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  const backendFields = [
    "name",
    "village",
    "taluk",
    "district",
    "number",
    "identity",
    "tag",
  ];

  const handleMappingChange = (field, value) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadCsv = async () => {
    if (!file) {
      setUploadStatus("Please upload a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file); // ✅ Fix: Match backend field name

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-import`,
        {
          method: "POST",
          body: formData, // ✅ No need to set Content-Type
        }
      );

      if (response.ok) {
        setUploadStatus("Upload successful!");
      } else {
        setUploadStatus("Failed to upload.");
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadStatus("Error occurred while uploading.");
    }
  };

  // Handle File Selection
  const handleFileConsent = (event) => {
    if (event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Upload CSV using Fetch API
  const handleUploadConsent = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file); // Ensure 'file' matches backend key

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/consent`,
        {
          method: "PUT",
          body: formData, // Automatically sets Content-Type
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Upload Success:", result);
    } catch (error) {
      console.error("Upload Error:", error);
    }
  };

  return (
    <div className="p-6 mt-24">
      <div className="p-6 bg-gray-50 rounded-lg shadow-lg w-full max-w-md mx-auto">
        {/* Import User Section */}
        <div className="mb-6">
          <label className="flex flex-col items-center w-full px-5 py-3 bg-green-100 border border-green-300 rounded-lg cursor-pointer hover:bg-green-200 transition">
            <span className="text-green-700 font-medium text-sm">
              📂 Import User
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Consent User Upload */}
        <div className="flex flex-col items-center space-y-5">
          <label className="flex flex-col items-center w-full px-5 py-3 bg-green-100 border border-green-300 rounded-lg cursor-pointer hover:bg-green-200 transition">
            <span className="text-green-700 font-medium text-sm">
              ✅ Consent User
            </span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileConsent}
            />
          </label>

          {/* File Name Display */}
          {file && (
            <div className="flex items-center justify-between bg-gray-100 text-gray-700 px-4 py-2 rounded-lg w-full">
              <span className="truncate">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="ml-2 text-red-600 hover:text-red-800 transition"
              >
                ✕
              </button>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUploadConsent}
            className="w-full bg-green-500 text-white font-medium px-5 py-2 rounded-lg shadow-md transition hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!file}
          >
            🚀 Upload CSV
          </button>
        </div>
      </div>

      {csvHeaders.length > 0 && (
        <CsvFieldMapper
          csvHeaders={csvHeaders}
          backendFields={backendFields}
          mapping={mapping}
          onChange={handleMappingChange}
          onUpload={handleUploadCsv}
        />
      )}

      {uploadStatus && (
        <p className="mt-4 text-center font-medium">{uploadStatus}</p>
      )}
    </div>
  );
};

export default Page;
