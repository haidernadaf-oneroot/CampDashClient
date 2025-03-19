"use client";
import React, { useState } from "react";
import * as Papa from "papaparse";

// CSV Field Mapper Component
const CsvFieldMapper = ({
  csvHeaders,
  backendFields,
  mapping,
  onChange,
  onUpload,
}) => {
  return (
    <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200 h-[500px] w-[500px]">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 ">Map CSV Fields</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {backendFields.map((field) => (
          <div key={field} className="flex flex-col space-y-2">
            <label className="font-semibold text-gray-700">{field}</label>
            {field === "tag" || field === "identity" ? (
              <input
                type="text"
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Enter ${field}`}
                value={mapping[field] || ""}
                onChange={(e) => onChange(field, e.target.value)}
              />
            ) : (
              <select
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        className=" bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-300 w-48 mt-11"
      >
        Upload to Backend
      </button>
    </div>
  );
};

// Main CSV Upload Component
const CsvUploadSection = () => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [uploadStatus, setUploadStatus] = useState("");

  const backendFields = [
    "name",
    "village",
    "taluk",
    "district",
    "number",
    "identity",
    "tag",
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
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

  const handleMappingChange = (field, value) => {
    setMapping((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadCsv = async () => {
    if (!csvData.length) {
      setUploadStatus("Please upload a CSV file first.");
      return;
    }

    const formattedData = csvData.map((row) => {
      let newRow = {};
      backendFields.forEach((field) => {
        newRow[field] =
          field === "tag" || field === "identity"
            ? mapping[field] || ""
            : mapping[field]
            ? row[mapping[field]] || ""
            : "";
      });
      return newRow;
    });

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: "text/csv" });
    const formData = new FormData();
    formData.append("csv", blob, "uploaded_data.csv");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-import`,
        {
          method: "POST",
          body: formData,
        }
      );
      setUploadStatus(response.ok ? "Upload successful!" : "Failed to upload.");
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setUploadStatus("Error occurred while uploading.");
    }
  };

  const handleDownloadCsv = () => {
    if (!csvData.length) return;

    const formattedData = csvData.map((row) => {
      let newRow = {};
      backendFields.forEach((field) => {
        newRow[field] =
          field === "tag" || field === "identity"
            ? mapping[field] || ""
            : mapping[field]
            ? row[mapping[field]] || ""
            : "";
      });
      return newRow;
    });

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exported_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 rounded-xl bg-gray-50 shadow-md mt-20">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Import Users</h1>
      <div className="mb-6 text-2xl">
        <label className="block font-semibold text-gray-700 mb-2 ">
          Upload CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block border border-black rounded-xl w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-green-700 hover:file:bg-green-200 "
        />
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
        <p
          className={`mt-4 text-center font-medium ${
            uploadStatus.includes("Error") || uploadStatus.includes("Failed")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {uploadStatus}
        </p>
      )}

      {csvData.length > 0 && (
        <div className="px-72">
          <button
            onClick={handleDownloadCsv}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 w-52 h-12"
          >
            Download CSV
          </button>
        </div>
      )}
    </div>
  );
};

// Consent Upload Component
const ConsentUploadSection = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus("");
  };

  const handleConsentUpload = async () => {
    if (!file) {
      setUploadStatus("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/consent`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        setUploadStatus("Consent upload successful!");
        setFile(null);
      } else {
        setUploadStatus("Failed to upload consent file.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadStatus("Error occurred while uploading.");
    }
  };

  return (
    <div className="p-8 bg-gray-50 rounded-xl shadow-md mt-20 h-56 ">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Consent User Upload
      </h1>
      <label className="flex flex-col items-center w-full px-4 py-3 bg-green-100 border-2 border-green-300 rounded-lg cursor-pointer hover:bg-green-200 transition duration-300">
        <span className="text-green-700 font-semibold">Select Consent CSV</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {file && (
        <div className="mt-4 flex items-center justify-between bg-gray-100 p-3 rounded-lg w-full">
          <span className="text-gray-700 truncate">{file.name}</span>
          <button
            onClick={() => setFile(null)}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <button
        onClick={handleConsentUpload}
        className={`mt-6 w-full px-6 py-3 rounded-lg text-white font-semibold transition duration-300 ${
          file
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!file}
      >
        Upload Consent CSV
      </button>

      {uploadStatus && (
        <p
          className={`mt-4 text-center font-medium ${
            uploadStatus.includes("Error") || uploadStatus.includes("Failed")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {uploadStatus}
        </p>
      )}
    </div>
  );
};

// Main Page Component
const Page = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row gap-8 p-8">
      <div className="w-full lg:w-1/2">
        <CsvUploadSection />
      </div>
      <div className="w-full lg:w-1/2">
        <ConsentUploadSection />
      </div>
    </div>
  );
};

export default Page;
