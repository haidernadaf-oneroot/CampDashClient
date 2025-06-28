"use client";

import { useEffect, useState } from "react";
import { Filter, FilterX } from "lucide-react";
import Update from "@/components/Update";
import FilterOptions from "@/components/FilterOptions";
import SearchAndColumns from "@/components/SearchAndColumns";
import TableView from "@/components/TableView";
import CardView from "@/components/CardView";
import EditModal from "@/components/EditModal";
import DownloadModal from "@/components/DownloadModal";
import CreateTicketForm from "@/components/CreateTicketForm ";

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", "");
};

const Page = () => {
  const [farmer, setFarmer] = useState([]);
  const [tags, setTags] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [hoblis, setHoblis] = useState([]);
  const [villages, setVillages] = useState([]);
  const [tagFilter, setTagFilter] = useState("");
  const [consentFilter, setConsentFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [downloadedFilter, setDownloadedFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [talukaFilter, setTalukaFilter] = useState("");
  const [hobliFilter, setHobliFilter] = useState("");
  const [villageFilter, setVillageFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState({
    tags: false,
    districts: false,
    talukas: false,
    hoblis: false,
    villages: false,
  });
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [editingFarmerId, setEditingFarmerId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [pincode, setPincode] = useState("");
  const [modalVillages, setModalVillages] = useState([]);
  const [locationData, setLocationData] = useState(null);
  const [activeTab, setActiveTab] = useState("table");
  const [selectedColumns, setSelectedColumns] = useState([
    "name",
    "number",
    "pincode",
    "identity",
    "tag",
    "consent",
    "consent_date",
    "downloaded",
    "downloaded_date",
    "onboarded_date",
    "farmer_category",
    "district",
    "taluk",
    "hobli",
    "village",
  ]);
  const [showFilter, setShowFilter] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadRange, setDownloadRange] = useState({
    from: 0,
    to: totalUsers,
  });
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const allColumns = [
    { key: "name", label: "Name" },
    { key: "gov_farmer_id", label: "Govt_ID" },
    { key: "age", label: "Age" },
    { key: "pincode", label: "Pincode" },
    { key: "hobli", label: "Hobli" },
    { key: "farmer_category", label: "Farmer Category" },
    { key: "village", label: "Village" },
    { key: "taluk", label: "Taluk" },
    { key: "district", label: "District" },
    { key: "number", label: "Mobile Number" },
    { key: "identity", label: "Identity" },
    { key: "tag", label: "Tags" },
    { key: "consent", label: "Consent" },
    { key: "consent_date", label: "Consent Date" },
    { key: "createdAt", label: "Created At" },
    { key: "updatedAt", label: "Updated At" },
    { key: "downloaded", label: "Download" },
    { key: "downloaded_date", label: "Downloaded Date" },
    { key: "onboarded_date", label: "Onboarded Date" },
    { key: "coordinates", label: "Coordinates" },
  ];

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      setLocationLoading((prev) => ({ ...prev, tags: true }));
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("API URL is not defined in environment variables");
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tags`);
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags(data.length ? data : ["No tags available"]);
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags(["Error loading tags"]);
      } finally {
        setLocationLoading((prev) => ({ ...prev, tags: false }));
      }
    };
    fetchTags();
  }, []);

  // Fetch districts
  useEffect(() => {
    const fetchDistricts = async () => {
      setLocationLoading((prev) => ({ ...prev, districts: true }));
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("API URL is not defined in environment variables");
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/districts`
        );
        if (!response.ok) throw new Error("Failed to fetch districts");
        const data = await response.json();
        setDistricts(data.length ? data : ["No districts available"]);
      } catch (error) {
        console.error("Error fetching districts:", error);
        setDistricts(["Error loading districts"]);
      } finally {
        setLocationLoading((prev) => ({ ...prev, districts: false }));
      }
    };
    fetchDistricts();
  }, []);

  // Fetch taluks
  useEffect(() => {
    const fetchTaluks = async () => {
      setLocationLoading((prev) => ({ ...prev, talukas: true }));
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("API URL is not defined in environment variables");
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/taluks`
        );
        if (!response.ok) throw new Error("Failed to fetch taluks");
        const data = await response.json();
        setTalukas(data.length ? data : ["No taluks available"]);
      } catch (error) {
        console.error("Error fetching taluks:", error);
        setTalukas(["Error loading taluks"]);
      } finally {
        setLocationLoading((prev) => ({ ...prev, talukas: false }));
      }
    };
    fetchTaluks();
  }, []);

  // Fetch hoblis
  useEffect(() => {
    const fetchHoblis = async () => {
      setLocationLoading((prev) => ({ ...prev, hoblis: true }));
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("API URL is not defined in environment variables");
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/hoblis`
        );
        if (!response.ok) throw new Error("Failed to fetch hoblis");
        const data = await response.json();
        setHoblis(data.length ? data : ["No hoblis available"]);
      } catch (error) {
        console.error("Error fetching hoblis:", error);
        setHoblis(["Error loading hoblis"]);
      } finally {
        setLocationLoading((prev) => ({ ...prev, hoblis: false }));
      }
    };
    fetchHoblis();
  }, []);

  // Fetch villages
  useEffect(() => {
    const fetchVillages = async () => {
      setLocationLoading((prev) => ({ ...prev, villages: true }));
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("API URL is not defined in environment variables");
        }
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/villages`
        );
        if (!response.ok) throw new Error("Failed to fetch villages");
        const data = await response.json();
        setVillages(data.length ? data : ["No villages available"]);
      } catch (error) {
        console.error("Error fetching villages:", error);
        setVillages(["Error loading villages"]);
      } finally {
        setLocationLoading((prev) => ({ ...prev, villages: false }));
      }
    };
    fetchVillages();
  }, []);

  // Fetch farmers
  useEffect(() => {
    const getdata = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          // identity: "Farmer",
          ...(tagFilter && { tag: tagFilter }),
          ...(consentFilter && { consent: consentFilter }),
          ...(dateFilter && { date: dateFilter }),
          ...(downloadedFilter && { downloaded: downloadedFilter }),
          ...(searchTerm && { search: searchTerm }),
          ...(categoryFilter && { category: categoryFilter }),
          ...(districtFilter && { district: districtFilter }),
          ...(talukaFilter && { taluk: talukaFilter }),
          ...(hobliFilter && { hobli: hobliFilter }),
          ...(villageFilter && { village: villageFilter }),
        });

        console.log("Fetching users with query:", queryParams.toString());

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users?${queryParams}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setFarmer(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalUsers(data.totalUsers || 0);
        setDownloadRange((prev) => ({ ...prev, to: data.totalUsers || 0 }));
      } catch (error) {
        console.error("Error fetching users:", error);
        setFarmer([]);
        setTotalPages(1);
        setTotalUsers(0);
        setDownloadRange({ from: 0, to: 0 });
      } finally {
        setLoading(false);
      }
    };
    getdata();
  }, [
    currentPage,
    tagFilter,
    consentFilter,
    dateFilter,
    downloadedFilter,
    searchTerm,
    categoryFilter,
    districtFilter,
    talukaFilter,
    hobliFilter,
    villageFilter,
  ]);

  // Fetch location data for EditModal based on pincode
  const fetchLocationData = async (pincodeValue) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/location/${pincodeValue}`
      );
      if (!response.ok) throw new Error("Failed to fetch location data");

      const result = await response.json();
      const data = result.data;
      setLocationData(data);
      const villageList = data.map((loc) => loc.village);
      setModalVillages(villageList);

      if (data.length > 0) {
        setEditFormData((prev) => ({
          ...prev,
          taluk: data[0].taluk || "",
          district: data[0].district || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      setModalVillages([]);
      setLocationData(null);
    }
  };

  const handleEditClick = (farmer) => {
    setEditingFarmerId(farmer._id);
    setEditFormData({ ...farmer });
    setShowEditModal(true);
    setPincode("");
    setModalVillages([]);
    setLocationData(null);
  };

  const handleTaskClick = (farmer) => {
    setSelectedFarmer(farmer);
    setShowTicketForm(true);
  };

  const handleCloseTicketForm = () => {
    setShowTicketForm(false);
    setSelectedFarmer(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "village" && locationData) {
      const selectedLocation = locationData.find(
        (loc) => loc.village === value
      );
      if (selectedLocation) {
        setEditFormData((prev) => ({
          ...prev,
          village: value,
          taluk: selectedLocation.taluk || "",
          district: selectedLocation.district || "",
        }));
      }
    } else {
      setEditFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePincodeChange = (e) => {
    const value = e.target.value;
    setPincode(value);
    if (value.length === 6) {
      fetchLocationData(value);
    } else {
      setModalVillages([]);
      setLocationData(null);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        downloaded:
          editFormData.downloaded === true
            ? true
            : editFormData.downloaded === false
            ? false
            : null,
        _id: editingFarmerId,
        name: editFormData.name || "",
        village: editFormData.village || "",
        taluk: editFormData.taluk || "",
        district: editFormData.district || "",
        number: editFormData.number || "",
        identity: editFormData.identity || "",
        tag: editFormData.tag || "",
        __v: editFormData.__v || 0,
        createdAt: editFormData.createdAt || "",
        updatedAt: editFormData.updatedAt || "",
        onboarded_date: editFormData.onboarded_date || "",
        consent: editFormData.consent || "",
        consent_date: editFormData.consent_date || "",
        downloaded_date: editFormData.downloaded_date || "",
        farmer_category: editFormData.farmer_category || "",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${editingFarmerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedFarmer = await response.json();
      setFarmer((prev) =>
        prev.map((f) => (f._id === editingFarmerId ? updatedFarmer : f))
      );
      setShowEditModal(false);
      setEditingFarmerId(null);
      setModalVillages([]);
      setPincode("");
      setLocationData(null);
    } catch (error) {
      console.error("Error updating farmer:", error);
      alert("Failed to save changes.");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingFarmerId(null);
    setPincode("");
    setModalVillages([]);
    setLocationData(null);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("API URL is not defined in environment variables");
      }

      if (!selectedColumns || selectedColumns.length === 0) {
        alert("Please select at least one column to download.");
        setDownloading(false);
        return;
      }

      const columnsParam = selectedColumns.join(",");
      const queryParams = new URLSearchParams({
        ...(tagFilter && { tag: tagFilter }),
        ...(consentFilter && { consent: consentFilter }),
        ...(dateFilter && { date: dateFilter }),
        ...(downloadedFilter && { downloaded: downloadedFilter }),
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(districtFilter && { district: districtFilter }),
        ...(talukaFilter && { taluk: talukaFilter }),
        ...(hobliFilter && { hobli: hobliFilter }),
        ...(villageFilter && { village: villageFilter }),
        columns: columnsParam,
        from: downloadRange.from.toString(),
        to: downloadRange.to.toString(),
      });

      console.log("Downloading with query:", queryParams.toString());

      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}/download-users?${queryParams}`;

      const response = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Accept: "text/csv",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status}, Message: ${errorText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `users_${tagFilter || "all"}_from_${
        downloadRange.from
      }_to_${downloadRange.to}_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading users:", error);
      alert(`Failed to download users: ${error.message}`);
    } finally {
      setDownloading(false);
      setShowDownloadModal(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [
    consentFilter,
    searchTerm,
    tagFilter,
    dateFilter,
    downloadedFilter,
    categoryFilter,
    districtFilter,
    talukaFilter,
    hobliFilter,
    villageFilter,
  ]);

  useEffect(() => {
    const tableContainer = document.getElementById("table-container");
    if (tableContainer) {
      tableContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const getPageNumbers = () => {
    let start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    if (end - start < 4) start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const toggleColumn = (column) => {
    setSelectedColumns((prev) => {
      const newColumns = prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column];
      return newColumns;
    });
  };

  const handleToggle = () => {
    setIsVisible((prev) => !prev);
  };

  const getStatusText = (status) => {
    if (status === true) return "App";
    if (status === false) return "On-board";
    return "Lead";
  };

  const resetFilters = () => {
    setTagFilter("");
    setConsentFilter("");
    setDateFilter("");
    setDownloadedFilter("");
    setSearchTerm("");
    setCategoryFilter("");
    setDistrictFilter("");
    setTalukaFilter("");
    setHobliFilter("");
    setVillageFilter("");
  };

  const displayedFarmers = farmer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Farmer Management</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
          >
            {isVisible ? (
              <FilterX className="h-4 w-4" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            {isVisible ? "Hide Filters" : "Show Filters"}
          </button>
          <Update />
        </div>
      </div>

      {isVisible && (
        <FilterOptions
          tags={tags}
          districts={districts}
          talukas={talukas}
          hoblis={hoblis}
          villages={villages}
          consentFilter={consentFilter}
          setConsentFilter={setConsentFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          tagFilter={tagFilter}
          setTagFilter={setTagFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          downloadedFilter={downloadedFilter}
          setDownloadedFilter={setDownloadedFilter}
          districtFilter={districtFilter}
          setDistrictFilter={setDistrictFilter}
          talukaFilter={talukaFilter}
          setTalukaFilter={setTalukaFilter}
          hobliFilter={hobliFilter}
          setHobliFilter={setHobliFilter}
          villageFilter={villageFilter}
          setVillageFilter={setVillageFilter}
          resetFilters={resetFilters}
          showDownloadModal={showDownloadModal}
          setShowDownloadModal={setShowDownloadModal}
          downloading={downloading}
          selectedColumns={selectedColumns}
          locationLoading={locationLoading} // Add this prop
        />
      )}

      <SearchAndColumns
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        selectedColumns={selectedColumns}
        toggleColumn={toggleColumn}
        allColumns={allColumns}
        downloading={downloading}
        setShowDownloadModal={setShowDownloadModal}
      />

      <div className="border-b border-gray-200">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("table")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "table"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Table View
          </button>
          {/* <button
            onClick={() => setActiveTab("cards")}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "cards"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Card View
          </button> */}
        </div>
      </div>

      {activeTab === "table" && (
        <TableView
          loading={loading}
          displayedFarmers={displayedFarmers}
          selectedColumns={selectedColumns}
          allColumns={allColumns}
          formatDate={formatDate}
          getStatusText={getStatusText}
          handleEditClick={handleEditClick}
          handleTaskClick={handleTaskClick}
          currentPage={currentPage}
          totalUsers={totalUsers}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          getPageNumbers={getPageNumbers}
        />
      )}

      {activeTab === "cards" && (
        <CardView
          loading={loading}
          displayedFarmers={displayedFarmers}
          formatDate={formatDate}
          getStatusText={getStatusText}
          handleEditClick={handleEditClick}
          handleTaskClick={handleTaskClick}
          currentPage={currentPage}
          totalUsers={totalUsers}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          getPageNumbers={getPageNumbers}
        />
      )}

      {showTicketForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <CreateTicketForm
              farmer={selectedFarmer}
              onClose={handleCloseTicketForm}
            />
          </div>
        </div>
      )}

      <EditModal
        showEditModal={showEditModal}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        pincode={pincode}
        setPincode={setPincode}
        villages={modalVillages}
        handleEditChange={handleEditChange}
        handlePincodeChange={handlePincodeChange}
        handleEditSubmit={handleEditSubmit}
        handleCancelEdit={handleCancelEdit}
      />

      <DownloadModal
        showDownloadModal={showDownloadModal}
        setShowDownloadModal={setShowDownloadModal}
        downloadRange={downloadRange}
        setDownloadRange={setDownloadRange}
        totalUsers={totalUsers}
        downloading={downloading}
        handleDownload={handleDownload}
      />
    </div>
  );
};

export default Page;
