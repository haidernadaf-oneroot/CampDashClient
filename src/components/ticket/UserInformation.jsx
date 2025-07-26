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

  const ticket = selectedTickets[0] || {};
  const user = ticket.userInfo || {}; // From populated foreign key

  // Safe fallback values
  const name = user.name || ticket.name || "Unknown User";
  const number = ticket.number || "Unknown";
  const age = user.age ?? "N/A";
  const taluk = user.taluk || "N/A";
  const district = user.district || "N/A";
  const tag = user.tag || "N/A";
  const downloaded = user.downloaded ? "Yes" : "No";
  const pincode = user.pincode || "Unknown";
  const village = user.village || "N/A";
  const consent = user.consent ? "Yes" : "No";
  const consentDate = user.consent_date
    ? new Date(user.consent_date).toLocaleDateString()
    : "N/A";
  const farmerCategory = user.farmer_category || "N/A";

  const farmer = {
    _id: user._id || ticket.userId || "unknown",
    name,
    number,
    age,
    taluk,
    district,
    tag,
    downloaded,
    pincode,
    village,
    consent,
    consent_date: consentDate,
    farmer_category: farmerCategory,
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
            <span>{age}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <MapPin size={18} className="text-purple-600" />
            <span className="font-semibold">Taluk:</span>
            <span>{taluk}</span>
          </p>
          <div className="flex items-center gap-2 text-sm mt-3">
            <span className="font-semibold">Ticket No:</span>
            <span>{number !== "Unknown" ? number : "--"}</span>
            <button
              onClick={() => copyToClipboard(ticket._id, number)}
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
            <span>{district}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Tag size={18} className="text-purple-600" />
            <span className="font-semibold">Tag:</span>
            <span>{tag}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Download size={18} className="text-purple-600" />
            <span className="font-semibold">Downloaded:</span>
            <span>{downloaded}</span>
          </p>
          <p className="flex items-center gap-2 text-base sm:text-lg">
            <Pin size={18} className="text-purple-600" />
            <span className="font-semibold">Pincode:</span>
            <span>{pincode}</span>
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
