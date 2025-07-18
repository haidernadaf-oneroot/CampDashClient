"use client";
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Loader2, Search, Plus } from "lucide-react";

const CreateHarvesterForm = ({
  isModalOpen,
  setIsModalOpen,
  buyers,
  setBuyers,
  filteredBuyers,
  setFilteredBuyers,
}) => {
  const initialFormData = {
    name: "",
    phone: "",
    village: "",
    hobli: "",
    taluk: "",
    district: "",
    is_owner: "No",
    has_pickup: "No",
    workers_count: 0,
    main_markets: [],
    secondary_markets: [],
    harvest_areas: [],
    max_distance_km: 0,
    min_quantity_required: 0,
    min_daily_target_nuts: 0,
    price_per_nut: 0,
    nut_type: "Selection",
    other_crops: [],
    harvests_in_winter: "No",
    taken_advance: "No",
    ready_to_supply: "Not interested",
    Buyer_notes: "",
    aadhaar_card: null,
    photo: null,
    bank_account: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [showMarkets, setShowMarkets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [marketSearch, setMarketSearch] = useState("");
  const [customMarketInput, setCustomMarketInput] = useState("");
  const [customMarkets, setCustomMarkets] = useState([]);
  const [customMarketError, setCustomMarketError] = useState(null);
  const [harvestInput, setHarvestInput] = useState("");
  const [cropInput, setCropInput] = useState("");

  const availableMarkets = [
    { id: "market1", name: "ARAKALGUD" },
    { id: "market2", name: "ARSIKERE" },
    { id: "market3", name: "BAGEPALLI" },
    { id: "market4", name: "BANGARPET" },
    { id: "market5", name: "BELUR" },
    { id: "market6", name: "BHADRAVATHI" },
    { id: "market7", name: "C.R.NAGAR" },
    { id: "market8", name: "C.R.PATNA" },
    { id: "market9", name: "CHANNAGIRI" },
    { id: "market10", name: "CHANNAPATNA" },
    { id: "market11", name: "CHIKKAMAGALURU" },
    { id: "market12", name: "GONIKOPPAL" },
    { id: "market13", name: "GUNDLUPET" },
    { id: "market14", name: "HANGAL" },
    { id: "market15", name: "HANUR" },
    { id: "market16", name: "HARAPANAHALLI" },
    { id: "market17", name: "HASSAN" },
    { id: "market18", name: "HIRIYUR" },
    { id: "market19", name: "HOLALKERE" },
    { id: "market20", name: "HOLENARASIPUR" },
    { id: "market21", name: "HONNALI" },
    { id: "market22", name: "HOSAPETE" },
    { id: "market23", name: "HUNGUND" },
    { id: "market24", name: "HUNSUR" },
    { id: "market25", name: "JAGALUR" },
    { id: "market26", name: "K.R.NAGAR" },
    { id: "market27", name: "K.R.PET" },
    { id: "market28", name: "KADUR" },
    { id: "market29", name: "KANAKAPURA" },
    { id: "market30", name: "KARWAR" },
    { id: "market31", name: "KOLLEGAL" },
    { id: "market32", name: "KOPPA" },
    { id: "market33", name: "KUNIGAL" },
    { id: "market34", name: "MADDUR" },
    { id: "market35", name: "MADHUGIRI" },
    { id: "market36", name: "MALAVALLI" },
    { id: "market37", name: "MALUR" },
    { id: "market38", name: "MANDYA" },
    { id: "market39", name: "MUDIGERE" },
    { id: "market40", name: "NAGAMANGALA" },
    { id: "market41", name: "NANJANGUD" },
    { id: "market42", name: "NIPPANI" },
    { id: "market43", name: "PANDAVAPURA" },
    { id: "market44", name: "PERIYAPATNA" },
    { id: "market45", name: "PUTTUR" },
    { id: "market46", name: "RAMPURA" },
    { id: "market47", name: "SAKLESHPUR" },
    { id: "market48", name: "SANTHESARGUR" },
    { id: "market49", name: "SIRA" },
    { id: "market50", name: "SOMWARPET" },
    { id: "market51", name: "SRINGERI" },
    { id: "market52", name: "SRINIVASPUR" },
    { id: "market53", name: "SRIRANGAPATNA" },
    { id: "market54", name: "T.NARSIPUR" },
    { id: "market55", name: "TARIKERE" },
    { id: "market56", name: "TIRTHAHALLI" },
  ];

  const filteredMarkets = [...availableMarkets, ...customMarkets].filter(
    (market) => market.name.toLowerCase().includes(marketSearch.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "file"
          ? files[0]
          : type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    });
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleAddCustomMarket = () => {
    const trimmedInput = customMarketInput.trim();
    if (!trimmedInput) {
      setCustomMarketError("Market name cannot be empty");
      return;
    }

    const isDuplicate = [...availableMarkets, ...customMarkets].some(
      (market) => market.name.toLowerCase() === trimmedInput.toLowerCase()
    );
    if (isDuplicate) {
      setCustomMarketError("Market already exists");
      return;
    }

    const newMarket = {
      id: `custom-${Date.now()}`,
      name: trimmedInput,
    };
    setCustomMarkets([...customMarkets, newMarket]);
    setCustomMarketInput("");
    setCustomMarketError(null);
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList =
      source.droppableId === "available"
        ? filteredMarkets
        : source.droppableId === "main"
        ? formData.main_markets
        : formData.secondary_markets;
    const destList =
      destination.droppableId === "main"
        ? formData.main_markets
        : formData.secondary_markets;
    const [movedItem] = sourceList.splice(source.index, 1);

    if (source.droppableId !== destination.droppableId) {
      if (destination.droppableId !== "available") {
        destList.splice(destination.index, 0, movedItem.name || movedItem);
      }
    } else {
      destList.splice(destination.index, 0, movedItem);
    }

    setFormData({
      ...formData,
      main_markets:
        destination.droppableId === "main" ? destList : formData.main_markets,
      secondary_markets:
        destination.droppableId === "secondary"
          ? destList
          : formData.secondary_markets,
    });
    setErrors((prev) => ({
      ...prev,
      main_markets: null,
      secondary_markets: null,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setShowMarkets(false);
    setMarketSearch("");
    setCustomMarketInput("");
    setCustomMarkets([]);
    setCustomMarketError(null);
    setErrors({});
    setHarvestInput("");
    setCropInput("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.phone || !/^\d{10}$/.test(formData.phone))
      newErrors.phone = "Valid 10-digit phone number is required";
    if (formData.workers_count < 0)
      newErrors.workers_count = "Workers count cannot be negative";
    if (formData.max_distance_km < 0)
      newErrors.max_distance_km = "Max distance cannot be negative";
    if (formData.min_quantity_required < 0)
      newErrors.min_quantity_required = "Min quantity cannot be negative";
    if (formData.min_daily_target_nuts < 0)
      newErrors.min_daily_target_nuts = "Daily target cannot be negative";
    if (formData.price_per_nut < 0)
      newErrors.price_per_nut = "Price per nut cannot be negative";
    if (!["Mixed", "Selection"].includes(formData.nut_type))
      newErrors.nut_type = "Nut type must be Mixed or Selection";
    if (
      !["Not interested", "Interested", "Interested but cannot"].includes(
        formData.ready_to_supply
      )
    )
      newErrors.ready_to_supply =
        "Ready to supply must be Not interested, Interested, or Interested but cannot";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "aadhaar_card" || key === "photo") {
          if (formData[key]) formDataToSend.append(key, formData[key]);
        } else if (Array.isArray(formData[key])) {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      formDataToSend.set("is_owner", formData.is_owner === "Yes");
      formDataToSend.set("has_pickup", formData.has_pickup === "Yes");
      formDataToSend.set(
        "harvests_in_winter",
        formData.harvests_in_winter === "Yes"
      );
      formDataToSend.set("taken_advance", formData.taken_advance === "Yes");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/harvester`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create harvester");
      }
      const newHarvester = await response.json();
      setBuyers([...buyers, newHarvester]);
      setFilteredBuyers([...filteredBuyers, newHarvester]);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error creating harvester:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImagePreview = (file) => {
    if (!file) return null;
    if (file.type.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    if (file.type === "application/pdf") {
      return "https://via.placeholder.com/150?text=PDF+Preview";
    }
    return null;
  };

  const handleHarvestInputKeyPress = (e) => {
    if (e.key === "Enter" && harvestInput.trim()) {
      e.preventDefault();
      const trimmedValue = harvestInput.trim();
      if (!formData.harvest_areas.includes(trimmedValue)) {
        setFormData({
          ...formData,
          harvest_areas: [...formData.harvest_areas, trimmedValue],
        });
        setErrors((prev) => ({ ...prev, harvest_areas: null }));
      }
      setHarvestInput("");
    }
  };

  const removeHarvestArea = (areaToRemove) => {
    setFormData({
      ...formData,
      harvest_areas: formData.harvest_areas.filter(
        (area) => area !== areaToRemove
      ),
    });
  };

  const handleCropInputKeyPress = (e) => {
    if (e.key === "Enter" && cropInput.trim()) {
      e.preventDefault();
      const trimmedValue = cropInput.trim();
      if (!formData.other_crops.includes(trimmedValue)) {
        setFormData({
          ...formData,
          other_crops: [...formData.other_crops, trimmedValue],
        });
        setErrors((prev) => ({ ...prev, other_crops: null }));
      }
      setCropInput("");
    }
  };

  const removeCrop = (cropToRemove) => {
    setFormData({
      ...formData,
      other_crops: formData.other_crops.filter((crop) => crop !== cropToRemove),
    });
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">
                Add New Harvester
              </h2>
              <DragDropContext onDragEnd={handleDragEnd}>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.name ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.phone ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter 10-digit phone number"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village
                      </label>
                      <input
                        type="text"
                        name="village"
                        value={formData.village}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.village ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter village"
                      />
                      {errors.village && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.village}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hobli
                      </label>
                      <input
                        type="text"
                        name="hobli"
                        value={formData.hobli}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white"
                        placeholder="Enter hobli (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taluk
                      </label>
                      <input
                        type="text"
                        name="taluk"
                        value={formData.taluk}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.taluk ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter taluk"
                      />
                      {errors.taluk && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.taluk}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.district ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter district"
                      />
                      {errors.district && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.district}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhaar Card
                      </label>
                      <input
                        type="file"
                        name="aadhaar_card"
                        onChange={handleInputChange}
                        accept="image/*,.pdf"
                        className={`w-full border ${
                          errors.aadhaar_card
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                      />
                      {errors.aadhaar_card && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.aadhaar_card}
                        </p>
                      )}
                      {formData.aadhaar_card && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Selected File: {formData.aadhaar_card.name}
                          </p>
                          {getImagePreview(formData.aadhaar_card) && (
                            <img
                              src={getImagePreview(formData.aadhaar_card)}
                              alt="Aadhaar Card Preview"
                              className="mt-2 h-32 w-auto object-contain rounded-lg border border-gray-300"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Photo
                      </label>
                      <input
                        type="file"
                        name="photo"
                        onChange={handleInputChange}
                        accept="image/*"
                        className={`w-full border ${
                          errors.photo ? "border-red-500" : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                      />
                      {errors.photo && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.photo}
                        </p>
                      )}
                      {formData.photo && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Selected File: {formData.photo.name}
                          </p>
                          {getImagePreview(formData.photo) && (
                            <img
                              src={getImagePreview(formData.photo)}
                              alt="Photo Preview"
                              className="mt-2 h-32 w-auto object-contain rounded-lg border border-gray-300"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        name="bank_account"
                        value={formData.bank_account}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.bank_account
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter bank account number"
                      />
                      {errors.bank_account && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.bank_account}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner ?
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="is_owner"
                            value="Yes"
                            checked={formData.is_owner === "Yes"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">Yes</span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="is_owner"
                            value="No"
                            checked={formData.is_owner === "No"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">No</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Has own Pickup Truck 🚚
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="has_pickup"
                            value="Yes"
                            checked={formData.has_pickup === "Yes"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">Yes</span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="has_pickup"
                            value="No"
                            checked={formData.has_pickup === "No"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">No</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Workers Count ?
                      </label>
                      <input
                        type="number"
                        name="workers_count"
                        value={formData.workers_count}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.workers_count
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter number of workers"
                        required
                      />
                      {errors.workers_count && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.workers_count}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Markets
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowMarkets(!showMarkets)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                      >
                        {showMarkets ? "Hide Markets" : "Show Markets"}
                      </button>
                    </div>
                    {showMarkets && (
                      <div className="col-span-1 md:col-span-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                              Available Markets
                            </h3>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="relative flex-1">
                                <input
                                  type="text"
                                  value={marketSearch}
                                  onChange={(e) =>
                                    setMarketSearch(e.target.value)
                                  }
                                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white"
                                  placeholder="Search markets..."
                                />
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                              </div>
                              <button
                                type="button"
                                onClick={() => setMarketSearch("")}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                Show All
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                              <input
                                type="text"
                                value={customMarketInput}
                                onChange={(e) => {
                                  setCustomMarketInput(e.target.value);
                                  setCustomMarketError(null);
                                }}
                                className={`w-full border ${
                                  customMarketError
                                    ? "border-red-500"
                                    : "border-gray-300"
                                } rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                                placeholder="Add custom market..."
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomMarket}
                                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center"
                              >
                                <Plus className="h-4 w-4 mr-1" /> Add
                              </button>
                            </div>
                            {customMarketError && (
                              <p className="text-red-500 text-xs mb-2">
                                {customMarketError}
                              </p>
                            )}
                            <Droppable droppableId="available">
                              {(provided, snapshot) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className={`bg-gray-50 p-4 rounded-lg h-[200px] overflow-y-auto border ${
                                    snapshot.isDraggingOver
                                      ? "border-purple-300 bg-purple-50"
                                      : "border-gray-200"
                                  } transition-colors scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100`}
                                >
                                  {filteredMarkets.length > 0 ? (
                                    filteredMarkets.map((market, index) => (
                                      <Draggable
                                        key={market.id}
                                        draggableId={market.id}
                                        index={index}
                                      >
                                        {(provided, snapshot) => (
                                          <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`bg-white p-3 mb-2 rounded-lg shadow-sm flex items-center justify-between ${
                                              snapshot.isDragging
                                                ? "shadow-lg bg-purple-100"
                                                : "hover:shadow-md hover:bg-gray-100"
                                            } transition-all cursor-move`}
                                          >
                                            <span>{market.name}</span>
                                            <span className="text-xs text-gray-500">
                                              {/* {market.id.startsWith("custom-")
                                                ? "Custom"
                                                : `ID: ${market.id}`} */}
                                            </span>
                                          </div>
                                        )}
                                      </Draggable>
                                    ))
                                  ) : (
                                    <div className="text-center text-gray-500 text-sm py-4">
                                      No markets found
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                              Main Markets
                            </h3>
                            <Droppable droppableId="main">
                              {(provided, snapshot) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className={`bg-gray-50 p-4 rounded-lg h-[200px] overflow-y-auto border ${
                                    errors.main_markets
                                      ? "border-red-500"
                                      : snapshot.isDraggingOver
                                      ? "border-purple-300 bg-purple-50"
                                      : "border-gray-200"
                                  } transition-colors scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100`}
                                >
                                  {formData.main_markets.length > 0 ? (
                                    formData.main_markets.map(
                                      (market, index) => (
                                        <Draggable
                                          key={`main-${index}`}
                                          draggableId={`main-${index}`}
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={`bg-white p-3 mb-2 rounded-lg shadow-sm ${
                                                snapshot.isDragging
                                                  ? "shadow-lg bg-purple-100"
                                                  : "hover:shadow-md hover:bg-gray-100"
                                              } transition-all cursor-move`}
                                            >
                                              {market}
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    )
                                  ) : (
                                    <div className="text-center text-gray-500 text-sm py-4">
                                      Drag markets here
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                            {errors.main_markets && (
                              <p className="text-red-500 text-xs mt-1">
                                {errors.main_markets}
                              </p>
                            )}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                              Secondary Markets
                            </h3>
                            <Droppable droppableId="secondary">
                              {(provided, snapshot) => (
                                <div
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                  className={`bg-gray-50 p-4 rounded-lg h-[200px] overflow-y-auto border ${
                                    snapshot.isDraggingOver
                                      ? "border-purple-300 bg-purple-50"
                                      : "border-gray-200"
                                  } transition-colors scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100`}
                                >
                                  {formData.secondary_markets.length > 0 ? (
                                    formData.secondary_markets.map(
                                      (market, index) => (
                                        <Draggable
                                          key={`secondary-${index}`}
                                          draggableId={`secondary-${index}`}
                                          index={index}
                                        >
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={`bg-white p-3 mb-2 rounded-lg shadow-sm ${
                                                snapshot.isDragging
                                                  ? "shadow-lg bg-purple-100"
                                                  : "hover:shadow-md hover:bg-gray-100"
                                              } transition-all cursor-move`}
                                            >
                                              {market}
                                            </div>
                                          )}
                                        </Draggable>
                                      )
                                    )
                                  ) : (
                                    <div className="text-center text-gray-500 text-sm py-4">
                                      Drag markets here
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Harvest Areas ?
                      </label>
                      <input
                        type="text"
                        value={harvestInput}
                        onChange={(e) => setHarvestInput(e.target.value)}
                        onKeyPress={handleHarvestInputKeyPress}
                        className={`w-full border ${
                          errors.harvest_areas
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Type an area and press Enter"
                      />
                      {errors.harvest_areas && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.harvest_areas}
                        </p>
                      )}
                      {formData.harvest_areas.length > 0 && (
                        <div className="mt-2">
                          {formData.harvest_areas.map((area, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg mb-1"
                            >
                              <span>{area}</span>
                              <button
                                type="button"
                                onClick={() => removeHarvestArea(area)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Distance (KM) ?
                        </label>
                        <input
                          type="number"
                          name="max_distance_km"
                          value={formData.max_distance_km}
                          onChange={handleInputChange}
                          className={`w-full border ${
                            errors.max_distance_km
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                          placeholder="Enter max distance"
                          required
                        />
                        {errors.max_distance_km && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.max_distance_km}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Min Quantity ?
                        </label>
                        <input
                          type="number"
                          name="min_quantity_required"
                          value={formData.min_quantity_required}
                          onChange={handleInputChange}
                          className={`w-full border ${
                            errors.min_quantity_required
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                          placeholder="Enter minimum quantity"
                          required
                        />
                        {errors.min_quantity_required && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.min_quantity_required}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daily Target of nuts ?
                      </label>
                      <input
                        type="number"
                        name="min_daily_target_nuts"
                        value={formData.min_daily_target_nuts}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.min_daily_target_nuts
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter daily target nuts"
                        required
                      />
                      {errors.min_daily_target_nuts && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.min_daily_target_nuts}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price/Nut
                      </label>
                      <input
                        type="number"
                        name="price_per_nut"
                        value={formData.price_per_nut}
                        onChange={handleInputChange}
                        className={`w-full border ${
                          errors.price_per_nut
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Enter price per nut"
                        required
                      />
                      {errors.price_per_nut && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.price_per_nut}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nut Type
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="nut_type"
                            value="Mixed"
                            checked={formData.nut_type === "Mixed"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">Mixed</span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="nut_type"
                            value="Selection"
                            checked={formData.nut_type === "Selection"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">Selection</span>
                        </label>
                      </div>
                      {errors.nut_type && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.nut_type}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Other Crops ?
                      </label>
                      <input
                        type="text"
                        value={cropInput}
                        onChange={(e) => setCropInput(e.target.value)}
                        onKeyPress={handleCropInputKeyPress}
                        className={`w-full border ${
                          errors.other_crops
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                        placeholder="Type a crop and press Enter"
                      />
                      {errors.other_crops && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.other_crops}
                        </p>
                      )}
                      {formData.other_crops.length > 0 && (
                        <div className="mt-2">
                          {formData.other_crops.map((crop, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg mb-1"
                            >
                              <span>{crop}</span>
                              <button
                                type="button"
                                onClick={() => removeCrop(crop)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        IS Ready Harvest In Winter ☃️
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="harvests_in_winter"
                            value="Yes"
                            checked={formData.harvests_in_winter === "Yes"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">Yes</span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="harvests_in_winter"
                            value="No"
                            checked={formData.harvests_in_winter === "No"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">No</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Taken Advance ?
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="taken_advance"
                            value="Yes"
                            checked={formData.taken_advance === "Yes"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">Yes</span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="taken_advance"
                            value="No"
                            checked={formData.taken_advance === "No"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">No</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ready to Supply
                      </label>
                      <div className="flex gap-6">
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="ready_to_supply"
                            value="Not interested"
                            checked={
                              formData.ready_to_supply === "Not interested"
                            }
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">
                            Not interested
                          </span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="ready_to_supply"
                            value="Interested"
                            checked={formData.ready_to_supply === "Interested"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">Interested</span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                          <input
                            type="radio"
                            name="ready_to_supply"
                            value="Interested but cannot"
                            checked={
                              formData.ready_to_supply ===
                              "Interested but cannot"
                            }
                            onChange={handleInputChange}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-gray-600">
                            Interested but cannot
                          </span>
                        </label>
                      </div>
                      {errors.ready_to_supply && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.ready_to_supply}
                        </p>
                      )}
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        name="Buyer_notes"
                        value={formData.Buyer_notes}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white resize-y"
                        placeholder="Enter any additional notes (e.g., Prefers early morning deliveries)"
                        rows="4"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium disabled:opacity-50"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center disabled:bg-purple-400"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {isSubmitting ? "Submitting..." : "Save"}
                    </button>
                  </div>
                </form>
              </DragDropContext>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateHarvesterForm;
