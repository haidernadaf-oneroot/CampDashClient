"use client";
import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Users,
  FileText,
  Clock,
  X,
  Plus,
} from "lucide-react";

const CreateTicketForm = ({ farmer, onClose }) => {
  const [formData, setFormData] = useState({
    userId: farmer?._id || "",
    task: "",
    assigned_to: [],
    priority: "medium",
    dueDate: "",
    status: "Opened",
    name: farmer?.name || "",
    number: farmer?.number || "",
    cropName: "Tender Coconut",
    tag: farmer?.tag || "",
    downloaded: farmer?.downloaded || null,
    consent: farmer?.consent || null,
    consent_date: farmer?.consent_date || null,
    pincode: farmer?.pincode || null,
    village: farmer?.village || "",
    taluk: farmer?.taluk || "",
    district: farmer?.district || "",
    age: farmer?.age || null,
    farmer_category: farmer?.farmer_category || "",
  });

  const [agents, setAgents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  const getAuthToken = () => localStorage.getItem("token");

  const decodeToken = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const showMessage = (message, isError = false) => {
    if (isError) setError(message);
    else setSuccess(message);
    setTimeout(() => {
      setError(null);
      setSuccess("");
    }, 3000);
  };

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      try {
        const token = getAuthToken();
        if (!token) throw new Error("Please log in");

        const userInfo = decodeToken(token);
        if (userInfo) {
          setCurrentUser({ _id: userInfo.id, name: userInfo.name || "You" });
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/agent`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch agents");
        let data = await response.json();

        setAgents(data || []);
      } catch (err) {
        showMessage(err.message, true);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [farmer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleAgent = (agentId) => {
    setFormData((prev) => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(agentId)
        ? prev.assigned_to.filter((id) => id !== agentId)
        : [...prev.assigned_to, agentId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.task.trim() ||
      !formData.dueDate ||
      !formData.assigned_to.length ||
      !formData.cropName ||
      !formData.number
    ) {
      showMessage("Please fill all required fields", true);
      return;
    }

    const validCrops = ["Tender Coconut", "Banana", "Dry Coconut", "Turmeric"];
    if (!validCrops.includes(formData.cropName)) {
      showMessage("Invalid crop name selected", true);
      return;
    }

    setLoading(true);
    try {
      const token = getAuthToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        showMessage("Ticket created successfully!");
        setTimeout(onClose, 2000);
      } else {
        showMessage(data.message || "Failed to create ticket", true);
      }
    } catch (err) {
      showMessage(err.message || "Something went wrong!", true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2">
            <FileText size={18} />
            <div>
              <h2 className="text-lg font-bold">Create Ticket</h2>
              <p className="text-xs text-purple-100">
                for {farmer?.name || "farmer"}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 space-y-3 overflow-y-auto max-h-[calc(95vh-100px)]">
          {(success || error) && (
            <div
              className={`p-2 rounded-lg flex items-center gap-2 text-sm ${
                success
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{success || error}</span>
            </div>
          )}

          {/* Farmer Info */}
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center gap-1 mb-2">
              <User className="text-gray-600" size={14} />
              <h3 className="text-sm font-semibold text-gray-900">Farmer</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border">
                <div className="text-gray-500">Name</div>
                <div className="font-medium">{formData.name || "N/A"}</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="text-gray-500">Contact</div>
                <div className="font-medium">{formData.number || "N/A"}</div>
              </div>
            </div>
          </div>

          {/* Task */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task *
            </label>
            <textarea
              name="task"
              placeholder="Describe the task..."
              value={formData.task}
              onChange={handleChange}
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm resize-none"
              required
            />
          </div>

          {/* Crop */}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Crop Name *
            </label>
            <select
              name="cropName"
              value={formData.cropName}
              onChange={handleChange}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm bg-white"
              required
            >
              <option value="Tender Coconut">Tender Coconut</option>
              <option value="Banana">Banana</option>
              <option value="Dry Coconut">Dry Coconut</option>
              <option value="Turmeric">Turmeric</option>
            </select>
          </div>

          {/* Assign Agents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Users size={14} />
              Assign Agents * ({formData.assigned_to.length})
            </label>
            {loading ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mx-auto mb-1"></div>
                Loading...
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="max-h-32 overflow-y-auto">
                  {[...agents]
                    .sort((a, b) => {
                      if (a._id === currentUser?._id) return -1;
                      if (b._id === currentUser?._id) return 1;
                      return 0;
                    })
                    .map((agent) => (
                      <label
                        key={agent._id}
                        className="flex items-center p-2 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={formData.assigned_to.includes(agent._id)}
                          onChange={() => toggleAgent(agent._id)}
                          className="mr-2 h-3 w-3 text-purple-600 rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {agent._id === currentUser?._id
                              ? `${agent.name} (You)`
                              : agent.name}
                          </div>
                          {agent.email && (
                            <div className="text-xs text-gray-500">
                              {agent.email}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Priority + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="asap">ASAP</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar size={14} />
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-0 text-sm"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  Status
                </span>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                Opened
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Creating...
              </>
            ) : (
              <>
                <Plus size={16} />
                Create Ticket
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTicketForm;
