"use client";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [Buyer, setBuyers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [file, setFile] = useState(null);
  const [fileUser, setFileUser] = useState(null);

  const [consentFilter, setConsentFilter] = useState("");
  const itemsPerPage = 50;

  const [form, setForm] = useState({
    name: "",
    village: "",
    taluk: "",
    district: "",
    number: "",
    identity: "",
  });

  useEffect(() => {
    const getdata = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users`,
          {
            method: "GET",
            Accept: "application/json",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setBuyers(data);
      } catch (error) {
        console.log(error, "error");
      }
    };
    getdata();
  }, []);

  // Filter logic for consent
  const filteredBuyers = Buyer.filter((buyer) => {
    if (consentFilter === "yes") return buyer.consent === "yes";
    if (consentFilter === "No") return !buyer.consent || buyer.consent === "";
    return true; // Show all
  });

  const totalPages = Math.ceil(filteredBuyers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedFarmers = filteredBuyers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDownload = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        "Name,Created At,Village,Taluka,District,Number,Identity,Consent,Consent Date,Updated At",
        ...filteredBuyers.map((buyer) =>
          [
            buyer.name,
            buyer.createdAt,
            buyer.village,
            buyer.taluk,
            buyer.district,
            buyer.number,
            buyer.identity,
            buyer.consent || "No" || "yes",
            buyer.consent_date,
            buyer.updatedAt,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "filtered_buyers.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Reset `currentPage` to `1` when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [consentFilter]);

  // Handle File Selection
  const handleFileChange = (event) => {
    if (event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  // Upload CSV using Fetch API
  const handleUpload = async () => {
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
  const handleFileChangeUser = (event) => {
    if (event.target.files.length > 0) {
      setFileUser(event.target.files[0]);
    }
  };

  const handleUploadUser = async () => {
    if (!fileUser) {
      alert("Please select a CSV file for user import.");
      return;
    }

    const formData = new FormData();
    formData.append("csv", fileUser); // Ensure this matches the backend field name

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/user-import`;
      console.log("Uploading to:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData, // Do not manually set headers for FormData
      });

      if (!response.ok) {
        const errorText = await response.text(); // Capture backend error response
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("User Import Success:", result);
    } catch (error) {
      console.error("User Import Error:", error);
    }
  };

  useEffect(() => {
    const tableContainer = document.getElementById("table-container");
    if (tableContainer) {
      tableContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  return (
    <div className="mt-16 pr-11">
      {/* Upload Section */}
      <div className="mt-20 px-4 flex items-center space-y-6 bg-white shadow-md p-6 rounded-lg">
        {/* Consent User Upload */}
        <div className="flex flex-col items-center space-y-4 w-full mt-3">
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
            className="bg-green-500 text-white px-5 py-2 rounded-lg shadow-md 
             hover:bg-green-600 transition 
             disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!file}
          >
            Upload CSV
          </button>
        </div>

        {/* Import User Upload */}
        <div className="flex flex-col items-center space-y-4 w-full mt-3">
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
            className="bg-green-500 text-white px-5 py-2 rounded-lg shadow-md 
           hover:bg-green-600 transition 
           disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!fileUser}
          >
            User Upload
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 mt-11">
        <label className="text-gray-700">Filter Consent:</label>
        <select
          value={consentFilter}
          onChange={(e) => setConsentFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All</option>
          <option value="yes">Yes</option>
          <option value="No">No</option>
        </select>
        {consentFilter === "yes" && (
          <button
            onClick={handleDownload}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Download Table
          </button>
        )}
        {consentFilter === "No" && (
          <button
            onClick={handleDownload}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Download Table
          </button>
        )}
      </div>

      <div className="border rounded-lg shadow-sm bg-white">
        <div id="table-container" className="max-h-[300px] overflow-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="sticky top-0 bg-green-50">
              <tr className="border-b border-gray-200">
                {[
                  "Name",
                  "Created At",
                  "Village",
                  "Taluka",
                  "District",
                  "Number",
                  "Identity",
                  "Consent",
                  "Consent Date",
                  "Updated At",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 font-semibold text-gray-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {selectedFarmers.map((buyer, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 hover:bg-green-50"
                >
                  <td className="px-4 py-3 text-gray-600">{buyer.name}</td>
                  <td className="px-4 py-3 text-gray-600">{buyer.createdAt}</td>
                  <td className="px-4 py-3 text-gray-600">{buyer.village}</td>
                  <td className="px-4 py-3 text-gray-600">{buyer.taluk}</td>
                  <td className="px-4 py-3 text-gray-600">{buyer.district}</td>
                  <td className="px-4 py-3 text-gray-600">{buyer.number}</td>
                  <td className="px-4 py-3 text-gray-600">{buyer.identity}</td>
                  <td className="px-4 py-3 text-gray-600">{buyer.consent}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {buyer.consent_date}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{buyer.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between p-4 bg-white border-t">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Page;
