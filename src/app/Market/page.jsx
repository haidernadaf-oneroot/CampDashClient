"use client";
import React, { useState } from "react";

const Page = () => {
  const [file, setFile] = useState(null);
  const [fileUser, setFileUser] = useState(null);

  // Handle File Selection for Consent User
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Upload CSV for Consent User
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a CSV file");
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

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Upload Success:", result);
      alert("File uploaded successfully!");
      setFile(null);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Error uploading file");
    }
  };

  // Handle File Selection for User Import
  const handleFileChangeUser = (event) => {
    if (event.target.files.length > 0) {
      setFileUser(event.target.files[0]);
    }
  };

  // Upload CSV for User Import
  const handleUploadUser = async () => {
    if (!fileUser) {
      alert("Please select a CSV file for user import.");
      return;
    }

    const formData = new FormData();
    formData.append("csv", fileUser);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user-import`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("User Import Success:", result);
      alert("User file uploaded successfully!");
      setFileUser(null);
    } catch (error) {
      console.error("User Import Error:", error);
      alert("Error uploading user file");
    }
  };

  return (
    <>
      {/* Upload Section */}
      <div className="mt-20 px-4 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-6 bg-white shadow-md p-6 rounded-lg">
        {/* Consent User Upload */}
        <div className="flex flex-col items-center space-y-4 w-full">
          <label className="flex flex-col items-center w-full max-w-xs px-4 py-3 bg-green-100 border border-green-300 rounded-lg cursor-pointer hover:bg-green-200 transition">
            <span className="text-green-700 font-medium">Consent User</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {file && (
            <div className="text-gray-700 bg-gray-100 px-4 py-2 rounded-lg flex items-center justify-between w-full max-w-xs">
              <span>{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md 
             hover:bg-blue-700 transition 
             disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!file}
          >
            Upload CSV
          </button>
        </div>

        {/* Import User Upload */}
        <div className="flex flex-col items-center space-y-4 w-full">
          <label className="flex flex-col items-center w-full max-w-xs px-4 py-3 bg-green-100 border border-green-300 rounded-lg cursor-pointer hover:bg-green-200 transition">
            <span className="text-green-700 font-medium">Import User</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChangeUser}
            />
          </label>

          {fileUser && (
            <div className="text-gray-700 bg-gray-100 px-4 py-2 rounded-lg flex items-center justify-between w-full max-w-xs">
              <span>{fileUser.name}</span>
              <button
                onClick={() => setFileUser(null)}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}

          <button
            onClick={handleUploadUser}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow-md 
           hover:bg-blue-700 transition 
           disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!fileUser}
          >
            User Upload
          </button>
        </div>
      </div>
    </>
  );
};

export default Page;
