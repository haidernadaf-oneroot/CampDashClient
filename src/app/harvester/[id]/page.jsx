"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  CreditCard,
  Camera,
  Truck,
  Users,
  Target,
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Edit,
} from "lucide-react";
import UpdateHarvesterForm from "@/components/harvesterForm/HarvesterUpdateForm";

const HarvesterDetails = () => {
  const [harvester, setHarvester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const fetchHarvester = async () => {
      try {
        console.log(`Fetching harvester with ID: ${id}`);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/harvester/${id}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );
        console.log(`Response status: ${response.status}`);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(
            errorData.message || `HTTP error! Status: ${response.status}`
          );
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        setHarvester(data);
      } catch (error) {
        console.error("Error fetching harvester:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchHarvester();
    }
  }, [id]);

  const handleUpdate = (updatedHarvester) => {
    setHarvester(updatedHarvester);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading harvester details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-md">
          <div className="text-center py-8 px-6">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Error Loading Data
            </h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => router.push("/harvester")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Harvester
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!harvester) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-md">
          <div className="text-center py-8 px-6">
            <User className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Harvester Not Found
            </h2>
            <p className="text-slate-600 mb-6">
              The requested harvester could not be found.
            </p>
            <button
              onClick={() => router.push("/harvester")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Harvester
            </button>
          </div>
        </div>
      </div>
    );
  }

  const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <Icon className="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <p className="text-slate-900 break-words">{value || "Not provided"}</p>
      </div>
    </div>
  );

  const StatusBadge = ({ condition, trueText, falseText }) => (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
        condition
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {condition ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {condition ? trueText : falseText}
    </span>
  );

  const Badge = ({ children, variant = "default" }) => {
    const variants = {
      default: "bg-slate-100 text-slate-800",
      outline: "border border-slate-300 text-slate-700",
      secondary: "bg-slate-200 text-slate-800",
      emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      blue: "bg-blue-50 text-blue-700 border border-blue-200",
    };

    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-medium rounded-md ${variants[variant]}`}
      >
        {children}
      </span>
    );
  };

  const ImageCard = ({ url, alt, title }) => {
    const isPdf = url?.toLowerCase().endsWith(".pdf");
    const [loadError, setLoadError] = useState(null);

    const handleImageError = (e) => {
      console.error(`Failed to load image at ${url}:`, e);
      setLoadError(
        "Failed to load file. It may not exist or is not publicly accessible."
      );
      e.target.src = "/placeholder.png";
    };

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-slate-700">{title}</h4>
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group relative overflow-hidden rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
          >
            {isPdf ? (
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">View PDF</p>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={url}
                  alt={alt}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={handleImageError}
                  onLoad={() => {
                    console.log(`Successfully loaded image: ${url}`);
                    setLoadError(null);
                  }}
                />
                {loadError && (
                  <p className="text-red-500 text-sm mt-2">{loadError}</p>
                )}
              </>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ) : (
          <div className="w-full h-48 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No image available</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.push("/harvester")}
              className="flex items-center gap-2 shadow-2xl bg-white text-slate-600 hover:text-slate-800 hover:border-y-purple-800 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Harvester
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Harvester
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {harvester.name}
                </h1>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {[
                      harvester.village,
                      harvester.hobli,
                      harvester.taluk,
                      harvester.district,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <StatusBadge
                  condition={harvester.is_owner}
                  trueText="Owner"
                  falseText="Not Owner"
                />
                <StatusBadge
                  condition={harvester.has_pickup}
                  trueText="Has Pickup"
                  falseText="No Pickup"
                />
              </div>
              <div className="text-black">
                {new Date(harvester.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            </div>
          </div>
        </div>

        <UpdateHarvesterForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          harvester={harvester}
          onUpdate={handleUpdate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoItem
                  icon={User}
                  label="Full Name"
                  value={harvester.name}
                />
                <InfoItem
                  icon={Phone}
                  label="Phone Number"
                  value={harvester.phone}
                />
                <InfoItem
                  icon={MapPin}
                  label="Village"
                  value={harvester.village}
                />
                <InfoItem icon={MapPin} label="Hobli" value={harvester.hobli} />
                <InfoItem icon={MapPin} label="Taluk" value={harvester.taluk} />
                <InfoItem
                  icon={MapPin}
                  label="District"
                  value={harvester.district}
                />
              </div>
              <div className="border-t border-slate-200 pt-6">
                <InfoItem
                  icon={CreditCard}
                  label="Bank Account"
                  value={harvester.bank_account}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Documents & Photos
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <ImageCard
                url={harvester.aadhaar_card_url}
                alt="Aadhaar Card"
                title="Aadhaar Card"
              />
              <ImageCard
                url={harvester.photo_url}
                alt="Harvester Photo"
                title="Profile Photo"
              />
            </div>
          </div>
        </div>

        {/* Harvest Details */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Harvest Details & Operations
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <InfoItem
                icon={Users}
                label="Workers Count"
                value={harvester.workers_count}
              />
              <InfoItem
                icon={Truck}
                label="Max Distance"
                value={
                  harvester.max_distance_km
                    ? `${harvester.max_distance_km} km`
                    : null
                }
              />
              <InfoItem
                icon={Target}
                label="Min Quantity Required"
                value={harvester.min_quantity_required}
              />
              <InfoItem
                icon={Target}
                label="Min Daily Target Nuts"
                value={harvester.min_daily_target_nuts}
              />
              <InfoItem
                icon={DollarSign}
                label="Price per Nut"
                value={
                  harvester.price_per_nut ? `₹${harvester.price_per_nut}` : null
                }
              />
              <InfoItem
                icon={FileText}
                label="Nut Type"
                value={harvester.nut_type}
              />
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Market Areas
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Main Markets
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {harvester.main_markets?.length ? (
                          harvester.main_markets.map((market, index) => (
                            <Badge key={index} variant="outline">
                              {market}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">
                            None specified
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Secondary Markets
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {harvester.secondary_markets?.length ? (
                          harvester.secondary_markets.map((market, index) => (
                            <Badge key={index} variant="secondary">
                              {market}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">
                            None specified
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Harvest Areas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {harvester.harvest_areas?.length ? (
                          harvester.harvest_areas.map((area, index) => (
                            <Badge key={index} variant="emerald">
                              {area}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">
                            None specified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Additional Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Other Crops
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {harvester.other_crops?.length ? (
                          harvester.other_crops.map((crop, index) => (
                            <Badge key={index} variant="blue">
                              {crop}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-500 text-sm">
                            None specified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <StatusBadge
                        condition={harvester.harvests_in_winter}
                        trueText="Harvests in Winter"
                        falseText="No Winter Harvest"
                      />
                      <br />
                      <StatusBadge
                        condition={harvester.taken_advance}
                        trueText="Advance Taken"
                        falseText="No Advance"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        Ready to Supply
                      </p>
                      <p className="text-slate-900">
                        {harvester.ready_to_supply || "Not specified"}
                      </p>
                    </div>

                    {harvester.Buyer_notes && (
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-2">
                          Buyer Notes
                        </p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                          <p className="text-slate-900 text-sm">
                            {harvester.Buyer_notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HarvesterDetails;
