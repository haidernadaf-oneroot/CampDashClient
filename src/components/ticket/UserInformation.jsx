"use client";
import { useState } from "react";
import {
  User,
  Phone,
  Cake,
  MapPin,
  Map,
  Tag,
  Pin,
  Download,
  Copy,
} from "lucide-react";
import CreateTicketForm from "../CreateTicketForm ";

const UserInformation = ({ selectedTickets, getNumber, copyToClipboard }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Log the data to debug
  console.log("selectedTickets[0]:", selectedTickets[0]);
  console.log("getNumber:", getNumber);

  // Use selectedTickets[0] as the primary source, fall back to getNumber only if explicitly needed
  const ticket = selectedTickets[0] || {};
  const useGetNumber =
    ticket?.number && getNumber?.number && ticket.number === getNumber.number;

  // Extract fields, prioritizing ticket data
  const name = useGetNumber ? getNumber.name : ticket.name || "Unknown User";
  const number = useGetNumber ? getNumber.number : ticket.number || "Unknown";
  const age = useGetNumber ? getNumber.age : ticket.age;
  const taluk = useGetNumber ? getNumber.taluk : ticket.taluk;
  const district = useGetNumber ? getNumber.district : ticket.district;
  const tag = useGetNumber ? getNumber.tag : ticket.tag || "Unknown";
  const downloaded = useGetNumber ? getNumber.downloaded : ticket.downloaded;
  const pincode = useGetNumber ? getNumber.pincode : ticket.pincode;

  // Construct farmer object for CreateTicketForm
  const farmer = {
    _id: ticket.userId || "unknown", // Adjust based on actual field name
    name: name,
    number: number,
    age: age,
    taluk: taluk,
    district: district,
    tag: tag,
    downloaded: downloaded,
    pincode: pincode,
    village: ticket.village || "",
    consent: ticket.consent || null,
    consent_date: ticket.consent_date || null,
    farmer_category: ticket.farmer_category || "",
  };

  return (
    <div className="border-b border-gray-300 p-6 rounded-md border bg-white text-gray-800">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <User size={18} className="text-purple-600" />
            <span className="font-semibold">Name:</span>
            <span>{name}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Phone size={18} className="text-purple-600" />
            <span className="font-semibold">Number:</span>
            <span>{number}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Cake size={18} className="text-purple-600" />
            <span className="font-semibold">Age:</span>
            <span>{age ?? "N/A"}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin size={18} className="text-purple-600" />
            <span className="font-semibold">Taluk:</span>
            <span>{taluk || "N/A"}</span>
          </p>
          <div className="flex items-center gap-2 text-sm mt-3">
            <span className="font-semibold">Ticket No:</span>
            <span>{number !== "Unknown" ? number : "--"}</span>
            <button
              onClick={() => copyToClipboard(ticket._id, ticket.number)}
              className="text-gray-500 hover:text-purple-600 transition-colors"
              title="Copy Ticket Number"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Map size={18} className="text-purple-600" />
            <span className="font-semibold">District:</span>
            <span>{district || "N/A"}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Tag size={18} className="text-purple-600" />
            <span className="font-semibold">Tag:</span>
            <span>{tag}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Download size={18} className="text-purple-600" />
            <span className="font-semibold">Downloaded:</span>
            <span>{downloaded ?? "Unknown"}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Pin size={18} className="text-purple-600" />
            <span className="font-semibold">Pincode:</span>
            <span>{pincode ?? "Unknown"}</span>
          </p>
        </div>
      </div>
      <div className="mt-4">
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg"
        >
          Create Ticket
        </button>
      </div>
      {isFormOpen && (
        <CreateTicketForm
          farmer={farmer}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default UserInformation;
