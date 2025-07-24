"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { X, Save, Search, Plus, Loader2, Trash2 } from "lucide-react";

const UpdateHarvesterForm = ({
  isModalOpen,
  setIsModalOpen,
  harvester,
  onUpdate,
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
    workers_count: "",
    main_markets: [],
    secondary_markets: [],
    harvest_areas: [],
    max_distance_km: "",
    min_quantity_required: "",
    min_daily_target_nuts: "",
    price_per_nut: "",
    nut_type: "Selection",
    other_crops: [],
    harvests_in_winter: "No",
    taken_advance: "No",
    ready_to_supply: "Not interested",
    Buyer_notes: "",
    bank_account: "",
    aadhaar_card: null,
    photo: null,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
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
    { id: "market1", name: "Arakalgud" },
    { id: "market2", name: "Arsikere" },
    { id: "market3", name: "Bagepalli" },
    { id: "market4", name: "Bangarpet" },
    { id: "market5", name: "Belur" },
    { id: "market6", name: "Bhadravathi" },
    { id: "market7", name: "C.R.Nagar" },
    { id: "market8", name: "C.R.Patna" },
    { id: "market9", name: "Channagiri" },
    { id: "market10", name: "Channapatna" },
    { id: "market11", name: "Chikkamagaluru" },
    { id: "market12", name: "Gonikoppal" },
    { id: "market13", name: "Gundlupet" },
    { id: "market14", name: "Hangal" },
    { id: "market15", name: "Hanur" },
    { id: "market16", name: "Harapanahalli" },
    { id: "market17", name: "Hassan" },
    { id: "market18", name: "Hiriyur" },
    { id: "market19", name: "Holalkere" },
    { id: "market20", name: "Holenarasipur" },
    { id: "market21", name: "Honnali" },
    { id: "market22", name: "Hosapete" },
    { id: "market23", name: "Hungund" },
    { id: "market24", name: "Hunsur" },
    { id: "market25", name: "Jagalur" },
    { id: "market26", name: "K.R.Nagar" },
    { id: "market27", name: "K.R.Pet" },
    { id: "market28", name: "Kadur" },
    { id: "market29", name: "Kanakapura" },
    { id: "market30", name: "Karwar" },
    { id: "market31", name: "Kollegal" },
    { id: "market32", name: "Koppa" },
    { id: "market33", name: "Kunigal" },
    { id: "market34", name: "Maddur" },
    { id: "market35", name: "Madhugiri" },
    { id: "market36", name: "Malavalli" },
    { id: "market37", name: "Malur" },
    { id: "market38", name: "Mandya" },
    { id: "market39", name: "Mudigere" },
    { id: "market40", name: "Nagamangala" },
    { id: "market41", name: "Nanjangud" },
    { id: "market42", name: "Nippani" },
    { id: "market43", name: "Pandavapura" },
    { id: "market44", name: "Periyapatna" },
    { id: "market45", name: "Puttur" },
    { id: "market46", name: "Rampura" },
    { id: "market47", name: "Sakleshpur" },
    { id: "market48", name: "Santhesargur" },
    { id: "market49", name: "Sira" },
    { id: "market50", name: "Somwarpet" },
    { id: "market51", name: "Sringeri" },
    { id: "market52", name: "Srinivaspur" },
    { id: "market53", name: "Srirangapatna" },
    { id: "market54", name: "T.Narsipur" },
    { id: "market55", name: "Tarikere" },
    { id: "market56", name: "Tirthahalli" },
  ];

  const filteredMarkets = [...availableMarkets, ...customMarkets].filter(
    (market) => market.name.toLowerCase().includes(marketSearch.toLowerCase())
  );

  useEffect(() => {
    if (harvester) {
      const customMarketsFromHarvester = [
        ...(harvester.main_markets || []),
        ...(harvester.secondary_markets || []),
      ]
        .filter(
          (market) =>
            !availableMarkets.some((m) => m.name === market) &&
            !customMarkets.some((m) => m.name === market)
        )
        .map((market, index) => ({
          id: `custom-harvester-${index}-${Date.now()}`,
          name: market,
        }));

      setCustomMarkets(customMarketsFromHarvester);
      setFormData({
        name: harvester.name || "",
        phone: harvester.phone || "",
        village: harvester.village || "",
        hobli: harvester.hobli || "",
        taluk: harvester.taluk || "",
        district: harvester.district || "",
        is_owner: harvester.is_owner ? "Yes" : "No",
        workers_count: harvester.workers_count || "",
        has_pickup: harvester.has_pickup ? "Yes" : "No",
        main_markets: harvester.main_markets || [],
        secondary_markets: harvester.secondary_markets || [],
        harvest_areas: harvester.harvest_areas || [],
        max_distance_km: harvester.max_distance_km || "",
        min_quantity_required: harvester.min_quantity_required || "",
        min_daily_target_nuts: harvester.min_daily_target_nuts || "",
        price_per_nut: harvester.price_per_nut || "",
        nut_type: harvester.nut_type || "Selection",
        other_crops: harvester.other_crops || [],
        harvests_in_winter: harvester.harvests_in_winter ? "Yes" : "No",
        taken_advance: harvester.taken_advance ? "Yes" : "No",
        ready_to_supply: harvester.ready_to_supply || "Not interested",
        Buyer_notes: harvester.Buyer_notes || "",
        bank_account: harvester.bank_account || "",
        aadhaar_card: null,
        photo: null,
      });
      setAadhaarPreview(harvester.aadhaar_card_url || null);
      setPhotoPreview(harvester.photo_url || null);
    }
  }, [harvester]);

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

  const handleClearMarkets = (type) => {
    setFormData({
      ...formData,
      [type]: [],
    });
    setErrors((prev) => ({ ...prev, [type]: null }));
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

  const getImagePreview = (file) => {
    if (!file) return null;
    if (file.type?.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    if (file.type === "application/pdf") {
      return "https://via.placeholder.com/150?text=PDF+Preview";
    }
    return null;
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
        `${process.env.NEXT_PUBLIC_API_URL}/harvester/${harvester._id}`,
        {
          method: "PUT",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update harvester");
      }

      const updatedHarvester = await response.json();
      onUpdate(updatedHarvester);
      setIsModalOpen(false);
      setFormData(initialFormData);
      setAadhaarPreview(updatedHarvester.aadhaar_card_url || null);
      setPhotoPreview(updatedHarvester.photo_url || null);
      setCustomMarkets([]);
      setMarketSearch("");
      setCustomMarketInput("");
      setCustomMarketError(null);
      setHarvestInput("");
      setCropInput("");
      setErrors({});
    } catch (err) {
      console.error("Error updating harvester:", err);
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative transform transition-all duration-300 scale-100">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-full p-1"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            Update Harvester
          </h2>
          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {errors.submit}
            </div>
          )}
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
                    className={`w-full border text-black ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                    placeholder="Enter name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
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
                    className={`w-full border text-black ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                    placeholder="Enter 10-digit phone number"
                    required
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
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
                    className={`w-full border text-black ${
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
                    className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white"
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
                    className={`w-full border text-black ${
                      errors.taluk ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                    placeholder="Enter taluk"
                  />
                  {errors.taluk && (
                    <p className="text-red-500 text-xs mt-1">{errors.taluk}</p>
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
                    className={`w-full border text-black ${
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
                    className={`w-full border  text-black ${
                      errors.aadhaar_card ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                  />
                  {errors.aadhaar_card && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.aadhaar_card}
                    </p>
                  )}
                  {(formData.aadhaar_card || aadhaarPreview) && (
                    <div className="mt-2">
                      {formData.aadhaar_card && (
                        <p className="text-sm text-gray-600">
                          Selected File: {formData.aadhaar_card.name}
                        </p>
                      )}
                      {(getImagePreview(formData.aadhaar_card) ||
                        aadhaarPreview) && (
                        <img
                          src={
                            getImagePreview(formData.aadhaar_card) ||
                            aadhaarPreview
                          }
                          alt="Aadhaar Card Preview"
                          className="mt-2 text-black h-32 w-auto object-contain rounded-lg border border-gray-300"
                          onError={(e) => (e.target.style.display = "none")}
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
                    className={`w-full border text-black ${
                      errors.photo ? "border-red-500" : "border-gray-300"
                    } rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white`}
                  />
                  {errors.photo && (
                    <p className="text-red-500 text-xs mt-1">{errors.photo}</p>
                  )}
                  {(formData.photo || photoPreview) && (
                    <div className="mt-2">
                      {formData.photo && (
                        <p className="text-sm text-black">
                          Selected File: {formData.photo.name}
                        </p>
                      )}
                      {(getImagePreview(formData.photo) || photoPreview) && (
                        <img
                          src={getImagePreview(formData.photo) || photoPreview}
                          alt="Photo Preview"
                          className="mt-2 h-32 w-auto object-contain rounded-lg border border-gray-300"
                        />
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleInputChange}
                    className={`w-full border text-black ${
                      errors.bank_account ? "border-red-500" : "border-gray-300"
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
                  <label className="block text-sm font-medium text-black mb-1">
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
                      <span className="ml-2 text-black">Yes</span>
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
                      <span className="ml-2 text-black">No</span>
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
                    className={`w-full border text-black ${
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
                  <label className="block text-sm font-medium text-black mb-1">
                    Markets
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMarkets(!showMarkets)}
                    className="w-full text-black border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
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
                              onChange={(e) => setMarketSearch(e.target.value)}
                              className="w-full border text-black border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white"
                              placeholder="Search markets..."
                            />
                            <Search className="absolute text-black left-3 top-1/2 transform -translate-y-1/2  h-5 w-5" />
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
                            className={`w-full border text-black ${
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
                              className={`bg-gray-50 text-black p-4 rounded-lg h-[200px] overflow-y-auto border ${
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
                                        className={`bg-white text-black p-3 mb-2 rounded-lg shadow-sm flex items-center justify-between ${
                                          snapshot.isDragging
                                            ? "shadow-lg bg-purple-100"
                                            : "hover:shadow-md hover:bg-gray-100"
                                        } transition-all cursor-move`}
                                      >
                                        <span>{market.name}</span>
                                        <span className="text-xs text-black">
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
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-black">
                            Main Markets
                          </h3>
                          {formData.main_markets.length > 0 && (
                            <button
                              type="button"
                              onClick={() => handleClearMarkets("main_markets")}
                              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Clear
                            </button>
                          )}
                        </div>
                        <Droppable droppableId="main">
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`bg-gray-50 text-black p-4 rounded-lg h-[200px] overflow-y-auto border ${
                                errors.main_markets
                                  ? "border-red-500"
                                  : snapshot.isDraggingOver
                                  ? "border-purple-300 bg-purple-50"
                                  : "border-gray-200"
                              } transition-colors scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100`}
                            >
                              {formData.main_markets.length > 0 ? (
                                formData.main_markets.map((market, index) => (
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
                                        className={`bg-white text-black p-3 mb-2 rounded-lg shadow-sm ${
                                          snapshot.isDragging
                                            ? "shadow-lg bg-purple-100"
                                            : "hover:shadow-md hover:bg-gray-100"
                                        } transition-all cursor-move`}
                                      >
                                        {market}
                                      </div>
                                    )}
                                  </Draggable>
                                ))
                              ) : (
                                <div className="text-center text-black text-sm py-4">
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
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-sm font-medium text-black">
                            Secondary Markets
                          </h3>
                          {formData.secondary_markets.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                handleClearMarkets("secondary_markets")
                              }
                              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Clear
                            </button>
                          )}
                        </div>
                        <Droppable droppableId="secondary">
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className={`bg-gray-50 p-4 text-black rounded-lg h-[200px] overflow-y-auto border ${
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
                                          className={`bg-white p-3 text-black mb-2 rounded-lg shadow-sm ${
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
                                <div className="text-center text-black text-sm py-4">
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
                    className={`w-full border text-black ${
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
                    <label className="block text-sm font-medium text-black mb-1">
                      Max Distance (KM) ?
                    </label>
                    <input
                      type="number"
                      name="max_distance_km"
                      value={formData.max_distance_km}
                      onChange={handleInputChange}
                      className={`w-full border text-black ${
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
                    <label className="block text-sm font-medium text-black mb-1">
                      Min Quantity ?
                    </label>
                    <input
                      type="number"
                      name="min_quantity_required"
                      value={formData.min_quantity_required}
                      onChange={handleInputChange}
                      className={`w-full border text-black ${
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
                  <label className="block text-sm font-medium text-black mb-1">
                    Daily Target of nuts ?
                  </label>
                  <input
                    type="number"
                    name="min_daily_target_nuts"
                    value={formData.min_daily_target_nuts}
                    onChange={handleInputChange}
                    className={`w-full border text-black ${
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
                  <label className="block text-sm font-medium text-black mb-1">
                    Price/Nut
                  </label>
                  <input
                    type="number"
                    name="price_per_nut"
                    value={formData.price_per_nut}
                    onChange={handleInputChange}
                    className={`w-full border text-black ${
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
                  <label className="block text-sm font-medium text-black mb-1">
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
                  <label className="block text-sm font-medium text-black mb-1">
                    Other Crops ?
                  </label>
                  <input
                    type="text"
                    value={cropInput}
                    onChange={(e) => setCropInput(e.target.value)}
                    onKeyPress={handleCropInputKeyPress}
                    className={`w-full border text-black ${
                      errors.other_crops ? "border-red-500" : "border-gray-300"
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
                      <span className="ml-2 text-black">Yes</span>
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
                      <span className="ml-2 text-black">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
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
                      <span className="ml-2 text-black">Yes</span>
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
                      <span className="ml-2 text-black">No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Ready to Supply
                  </label>
                  <div className="flex gap-6">
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="ready_to_supply"
                        value="Not interested"
                        checked={formData.ready_to_supply === "Not interested"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-black">Not interested</span>
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
                      <span className="ml-2 text-black">Interested</span>
                    </label>
                    <label className="flex items-center text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="ready_to_supply"
                        value="Interested but cannot"
                        checked={
                          formData.ready_to_supply === "Interested but cannot"
                        }
                        onChange={handleInputChange}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-black">
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
                  <label className="block text-sm font-medium text-black mb-1">
                    Notes
                  </label>
                  <textarea
                    name="Buyer_notes"
                    value={formData.Buyer_notes}
                    onChange={handleInputChange}
                    className="w-full border text-black border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors bg-gray-50 hover:bg-white resize-y"
                    placeholder="Enter any additional notes (e.g., Prefers early morning deliveries)"
                    rows="4"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                  {isSubmitting ? "Updating..." : "Save"}
                </button>
              </div>
            </form>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};

export default UpdateHarvesterForm;
