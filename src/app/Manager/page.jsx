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
  const [identityInputType, setIdentityInputType] = useState("select"); // 'select' or 'text'

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl text-black border border-gray-200 h-[900px] w-[500px]">
      <h2 className="text-2xl font-bold mb-6 text-black">Map CSV Fields</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        {backendFields.map((field) => (
          <div key={field} className="flex flex-col space-y-2">
            <label className="font-semibold text-black">{field}</label>
            {field === "tag" || field === "identity" ? (
              <div className="flex flex-col space-y-2">
                {field === "identity" && (
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => setIdentityInputType("select")}
                      className={`px-2 py-1 text-xs rounded ${
                        identityInputType === "select"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Map from CSV
                    </button>
                    <button
                      onClick={() => setIdentityInputType("text")}
                      className={`px-2 py-1 text-xs rounded ${
                        identityInputType === "text"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-200"
                      }`}
                    >
                      Enter value
                    </button>
                  </div>
                )}
                {field === "identity" && identityInputType === "select" ? (
                  <select
                    className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-black"
                    value={mapping[field] || ""}
                    onChange={(e) => onChange(field, e.target.value)}
                  >
                    <option value="" className="text-black">
                      -- Select Field --
                    </option>
                    {csvHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="border border-gray-300 text-black p-3 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent"
                    placeholder={`Enter ${field}`}
                    value={mapping[field] || ""}
                    onChange={(e) => onChange(field, e.target.value)}
                  />
                )}
              </div>
            ) : (
              <select
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-900 focus:border-transparent text-black"
                value={mapping[field] || ""}
                onChange={(e) => onChange(field, e.target.value)}
              >
                <option value="" className="text-black">
                  -- Select Field --
                </option>
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
        className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition duration-300 w-48 mt-11"
      >
        Upload to Backend
      </button>
    </div>
  );
};

const CsvUploadSection = () => {
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvData, setCsvData] = useState([]);
  const [mapping, setMapping] = useState({});
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadStats, setUploadStats] = useState(null);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);

  const backendFields = [
    "name",
    "gov_farmer_id",
    "age",
    "pincode",
    "hobli",
    "farmer_category",
    "village",
    "taluk",
    "district",
    "number",
    "coordinates",
    "tag",
    "identity",
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

    const chunkSize = 10000;
    const total = Math.ceil(csvData.length / chunkSize);
    setTotalChunks(total);
    const summary = {
      totalRows: 0,
      uniqueNumbers: 0,
      updatedRecords: 0,
      insertedRecords: 0,
    };

    setUploadStatus("Uploading data in chunks...");

    for (let i = 0; i < total; i++) {
      const chunk = csvData.slice(i * chunkSize, (i + 1) * chunkSize);

      const formattedData = chunk.map((row) => {
        let newRow = {};
        backendFields.forEach((field) => {
          newRow[field] =
            field === "tag" || (field === "identity" && !mapping[field])
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
      formData.append("csv", blob, `chunk_${i + 1}.csv`);

      try {
        setCurrentChunk(i + 1);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user-import`,
          {
            method: "POST",
            body: formData,
          }
        );

        const result = await response.json();

        if (response.ok) {
          summary.totalRows += result.totalRows || 0;
          summary.uniqueNumbers += result.uniqueNumbers || 0;
          summary.updatedRecords += result.updatedRecords || 0;
          summary.insertedRecords += result.insertedRecords || 0;

          setUploadStatus(`Uploaded chunk ${i + 1} of ${total}...`);
        } else {
          setUploadStatus(
            `Chunk ${i + 1} failed: ${result.message || "Upload failed."}`
          );
          return;
        }
      } catch (error) {
        console.error("Error uploading chunk:", error);
        setUploadStatus(`Error uploading chunk ${i + 1}.`);
        return;
      }
    }

    setUploadStatus("Upload completed successfully!");
    setUploadStats(summary);
  };

  const handleDownloadCsv = () => {
    if (!csvData.length) return;

    const formattedData = csvData.map((row) => {
      let newRow = {};
      backendFields.forEach((field) => {
        newRow[field] =
          field === "tag" || (field === "identity" && !mapping[field])
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
        <label className="block font-semibold text-gray-700 mb-2">
          Upload CSV File
        </label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block border border-black rounded-xl w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-90 file:text-purple-700 hover:file:bg-purple-200"
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
              : "text-purple-600"
          }`}
        >
          {uploadStatus}
        </p>
      )}

      {currentChunk > 0 && currentChunk <= totalChunks && (
        <p className="text-center text-sm mt-1 text-gray-500">
          Uploading chunk {currentChunk} of {totalChunks}
        </p>
      )}

      {csvData.length > 0 && (
        <div className="px-72">
          <button
            onClick={handleDownloadCsv}
            className="mt-4 bg-purple-900 text-white px-6 py-3 rounded-lg hover:bg-purple-950 transition duration-300 w-52 h-12"
          >
            Download CSV
          </button>
        </div>
      )}

      {uploadStats && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-md border border-gray-200 text-gray-800">
          <h3 className="text-xl font-bold mb-4">Upload Summary</h3>
          <ul className="space-y-2">
            <li>
              <strong>Total Rows:</strong> {uploadStats.totalRows}
            </li>
            <li>
              <strong>Unique Numbers:</strong> {uploadStats.uniqueNumbers}
            </li>
            <li>
              <strong>Inserted Records:</strong> {uploadStats.insertedRecords}
            </li>
            <li>
              <strong>Update Records:</strong> {uploadStats.updatedRecords}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Consent Upload Component

const ConsentUploadSection = () => {
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadSummary, setUploadSummary] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadMessage("");
    setUploadSummary(null);
  };

  const handleConsentUpload = async () => {
    if (!file) {
      setUploadMessage("Please select a CSV file first.");
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

      const result = await response.json();

      if (response.ok) {
        setUploadMessage("Consent upload successful!");
        setUploadSummary({
          totalProcessed: result.totalProcessed,
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount,
          skipped: result.skipped,
        });
        setFile(null);
      } else {
        setUploadMessage("Failed to upload consent file.");
        setUploadSummary(null);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadMessage("Error occurred while uploading.");
      setUploadSummary(null);
    }
  };

  return (
    <div className="p-8 bg-gray-50 rounded-xl shadow-md mt-20 h-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Consent User Upload
      </h1>
      <label className="flex flex-col items-center w-full px-4 py-3 bg-purple-100 border-2 border-purple-300 rounded-lg cursor-pointer hover:bg-purple-200 transition duration-300">
        <span className="text-purple-700 font-semibold">
          Select Consent CSV
        </span>
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
            ? "bg-purple-500 hover:bg-purple-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
        disabled={!file}
      >
        Upload Consent CSV
      </button>

      {uploadMessage && (
        <p
          className={`mt-4 text-center font-medium ${
            uploadMessage.includes("Error") || uploadMessage.includes("Failed")
              ? "text-red-600"
              : "text-purple-600"
          }`}
        >
          {uploadMessage}
        </p>
      )}

      {uploadSummary && (
        <div className="mt-6 p-4 bg-white rounded-xl shadow-md border border-gray-200 text-gray-800">
          <h3 className="text-xl font-bold mb-4">Upload Summary</h3>
          <ul className="space-y-2">
            <li>
              <strong>Total Records:</strong> {uploadSummary.totalProcessed}
            </li>
            <li>
              <strong>modified Counts:</strong> {uploadSummary.modifiedCount}
            </li>
            <li>
              <strong>upserted Numbers:</strong> {uploadSummary.upsertedCount}
            </li>
            <li>
              <strong>Skipped:</strong> {uploadSummary.skipped}
            </li>
          </ul>
        </div>
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
