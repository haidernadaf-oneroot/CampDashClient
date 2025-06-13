"use client";
import { Toaster, toast } from "react-hot-toast";
import { CheckCircle, AlertCircle } from "lucide-react";

const ToastNotifications = ({ position = "top-right" }) => {
  return <Toaster position={position} />;
};

export const showToastSuccess = (message) => {
  toast.success(message, {
    style: {
      background: "#ECFDF5",
      color: "#065F46",
      border: "1px solid #6EE7B7",
    },
    icon: <CheckCircle size={20} />,
  });
};

export const showToastError = (message) => {
  toast.error(message, {
    style: {
      background: "#FEF2F2",
      color: "#991B1B",
      border: "1px solid #FECACA",
    },
    icon: <AlertCircle size={20} />,
  });
};

export default ToastNotifications;
