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
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Map CSV Fields
          </h2>
          <p className="text-sm text-gray-500">
            Match your CSV columns to the required fields
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {backendFields.map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 capitalize">
              {field.replace(/_/g, " ")}
            </label>

            {field === "tag" || field === "identity" ? (
              <div className="flex gap-1">
                <div className="">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none"></div>
                  <input
                    type="text"
                    className="block w-full pl-2  py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                    placeholder={`Enter ${field}`}
                    value={mapping[field]?.manual || ""}
                    onChange={(e) => onChange(field, "manual", e.target.value)}
                  />
                </div>

                <div className="relative ">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none"></div>
                  <select
                    className="block w-full pl-2 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                    value={mapping[field]?.csv || ""}
                    onChange={(e) => onChange(field, "csv", e.target.value)}
                  >
                    <option value="">Select column</option>
                    {csvHeaders.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            ) : (
              <select
                className="block text-center w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                value={mapping[field]?.csv || ""}
                onChange={(e) => onChange(field, "csv", e.target.value)}
              >
                <option value="">
                  ------------ Select column ------------
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

        <button
          onClick={onUpload}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <UploadIcon />
          Upload Data
        </button>
      </div>
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

            const initialMapping = {};
            backendFields.forEach((field) => {
              initialMapping[field] = { manual: "", csv: "" };
            });
            setMapping(initialMapping);
          }
        },
        header: true,
        skipEmptyLines: true,
      });
    }
  };

  const handleMappingChange = (field, type, value) => {
    setMapping((prev) => {
      const newMapping = { ...prev };

      if (field === "tag" || field === "identity") {
        newMapping[field] = {
          ...newMapping[field],
          [type]: value,
        };

        if (type === "manual" && value) {
          newMapping[field].csv = "";
        } else if (type === "csv" && value) {
          newMapping[field].manual = "";
        }
      } else {
        newMapping[field] = {
          manual: "",
          csv: type === "csv" ? value : "",
        };
      }

      return newMapping;
    });
  };

  const handleUploadCsv = async () => {
    if (!csvData.length) {
      setUploadStatus({
        type: "error",
        message: "Please upload a CSV file first.",
      });
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

    setUploadStatus({ type: "info", message: "Uploading data in chunks..." });

    for (let i = 0; i < total; i++) {
      const chunk = csvData.slice(i * chunkSize, (i + 1) * chunkSize);

      const formattedData = chunk.map((row) => {
        let newRow = {};
        backendFields.forEach((field) => {
          if (field === "tag" || field === "identity") {
            if (mapping[field]?.manual) {
              newRow[field] = mapping[field].manual;
            } else if (mapping[field]?.csv) {
              newRow[field] = row[mapping[field].csv] || "";
            } else {
              newRow[field] = "";
            }
          } else {
            newRow[field] = mapping[field]?.csv
              ? row[mapping[field].csv] || ""
              : "";
          }
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

          setUploadStatus({
            type: "info",
            message: `Uploaded chunk ${i + 1} of ${total}...`,
          });
        } else {
          setUploadStatus({
            type: "error",
            message: `Chunk ${i + 1} failed: ${
              result.message || "Upload failed."
            }`,
          });
          return;
        }
      } catch (error) {
        console.error("Error uploading chunk:", error);
        setUploadStatus({
          type: "error",
          message: `Error uploading chunk ${i + 1}.`,
        });
        return;
      }
    }

    setUploadStatus({
      type: "success",
      message: "Upload completed successfully!",
    });
    setUploadStats(summary);
  };

  const handleDownloadCsv = () => {
    if (!csvData.length) return;

    const formattedData = csvData.map((row) => {
      let newRow = {};
      backendFields.forEach((field) => {
        if (field === "tag" || field === "identity") {
          if (mapping[field]?.manual) {
            newRow[field] = mapping[field].manual;
          } else if (mapping[field]?.csv) {
            newRow[field] = row[mapping[field].csv] || "";
          } else {
            newRow[field] = "";
          }
        } else {
          newRow[field] = mapping[field]?.csv
            ? row[mapping[field].csv] || ""
            : "";
        }
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
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          Import Users
        </h1>
        <p className="text-sm text-gray-500">
          Upload and map your CSV file to import user data
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV File
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center justify-between p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {csvData.length > 0 ? "Change file" : "Select CSV file"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {csvData.length > 0
                    ? `${csvData.length} records loaded`
                    : "Supports .csv files"}
                </p>
              </div>
              <UploadIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {csvData.length > 0 && (
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
            </button>
          )}
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
        <div
          className={`mt-4 p-3 rounded-md ${
            uploadStatus.type === "error"
              ? "bg-red-50 text-red-700"
              : uploadStatus.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {uploadStatus.type === "error" ? (
              <ErrorIcon className="h-5 w-5" />
            ) : uploadStatus.type === "success" ? (
              <SuccessIcon className="h-5 w-5" />
            ) : (
              <InfoIcon className="h-5 w-5" />
            )}
            <p className="text-sm">{uploadStatus.message}</p>
          </div>
          {currentChunk > 0 && currentChunk <= totalChunks && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-purple-600 h-1.5 rounded-full"
                  style={{
                    width: `${(currentChunk / totalChunks) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-right">
                Processing chunk {currentChunk} of {totalChunks}
              </p>
            </div>
          )}
        </div>
      )}

      {uploadStats && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Upload Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Rows" value={uploadStats.totalRows} />
            <StatCard
              label="Unique Numbers"
              value={uploadStats.uniqueNumbers}
            />
            <StatCard
              label="Inserted Records"
              value={uploadStats.insertedRecords}
            />
            <StatCard
              label="Updated Records"
              value={uploadStats.updatedRecords}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ConsentUploadSection = () => {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadSummary, setUploadSummary] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadStatus(null);
    setUploadSummary(null);
  };

  const handleConsentUpload = async () => {
    if (!file) {
      setUploadStatus({
        type: "error",
        message: "Please select a CSV file first.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("csv", file);

    try {
      setUploadStatus({
        type: "info",
        message: "Uploading consent data...",
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/consent`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok) {
        setUploadStatus({
          type: "success",
          message: "Consent upload successful!",
        });
        setUploadSummary({
          totalProcessed: result.totalProcessed,
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount,
          skipped: result.skipped,
        });
        setFile(null);
      } else {
        setUploadStatus({
          type: "error",
          message: result.message || "Failed to upload consent file.",
        });
        setUploadSummary(null);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      setUploadStatus({
        type: "error",
        message: "Error occurred while uploading.",
      });
      setUploadSummary(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">
          Consent Management
        </h1>
        <p className="text-sm text-gray-500">
          Upload a CSV file to update user consent status
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Consent CSV
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 cursor-pointer">
            <div
              className={`flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${
                file
                  ? "border-green-300 bg-green-50"
                  : "border-dashed border-gray-300 hover:border-purple-500"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {file ? file.name : "Select consent CSV"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {file ? "Ready to upload" : "Supports .csv files"}
                </p>
              </div>
              <UploadIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          {file && (
            <button
              onClick={() => setFile(null)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleConsentUpload}
        disabled={!file}
        className={`w-full py-2.5 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
          file
            ? "bg-purple-600 hover:bg-purple-700 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        <UploadIcon className="h-4 w-4" />
        Upload Consent Data
      </button>

      {uploadStatus && (
        <div
          className={`mt-4 p-3 rounded-md ${
            uploadStatus.type === "error"
              ? "bg-red-50 text-red-700"
              : uploadStatus.type === "success"
              ? "bg-green-50 text-green-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {uploadStatus.type === "error" ? (
              <ErrorIcon className="h-5 w-5" />
            ) : uploadStatus.type === "success" ? (
              <SuccessIcon className="h-5 w-5" />
            ) : (
              <InfoIcon className="h-5 w-5" />
            )}
            <p className="text-sm">{uploadStatus.message}</p>
          </div>
        </div>
      )}

      {uploadSummary && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Consent Update Summary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Total Processed"
              value={uploadSummary.totalProcessed}
            />
            <StatCard
              label="Modified Count"
              value={uploadSummary.modifiedCount}
            />
            <StatCard
              label="Upserted Count"
              value={uploadSummary.upsertedCount}
            />
            <StatCard label="Skipped" value={uploadSummary.skipped} />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper components
const StatCard = ({ label, value }) => (
  <div className="bg-white p-3 rounded-md border border-gray-200">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="text-lg font-semibold text-gray-800">{value}</p>
  </div>
);

const UploadIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const DownloadIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const ChevronDownIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const ErrorIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
      clipRule="evenodd"
    />
  </svg>
);

const SuccessIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
      clipRule="evenodd"
    />
  </svg>
);

const InfoIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
      clipRule="evenodd"
    />
  </svg>
);

const XIcon = ({ className = "h-5 w-5" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);

const Page = () => {
  return (
    <div className="min-h-screen bg-gray-50 pr-64">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Data Import Center
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage user data imports and consent updates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <CsvUploadSection />
          </div>
          <div>
            <ConsentUploadSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
