import { X } from "lucide-react";

const EditModal = ({
  showEditModal,
  editFormData,
  setEditFormData,
  pincode,
  setPincode,
  villages,
  handleEditChange,
  handlePincodeChange,
  handleEditSubmit,
  handleCancelEdit,
}) => (
  <>
    {showEditModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-green-700">
                Edit Farmer Details
              </h2>
              <button
                onClick={handleCancelEdit}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={editFormData.name || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Govt_ID */}
              <div className="space-y-2">
                <label
                  htmlFor="gov_farmer_id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Govt ID
                </label>
                <input
                  id="gov_farmer_id"
                  name="gov_farmer_id"
                  value={editFormData.gov_farmer_id || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Age */}
              <div className="space-y-2">
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700"
                >
                  Age
                </label>
                <input
                  id="age"
                  name="age"
                  type="number"
                  value={editFormData.age || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <label
                  htmlFor="pincode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  id="pincode"
                  value={pincode}
                  onChange={handlePincodeChange}
                  maxLength={6}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter 6-digit pincode"
                />
              </div>

              {/* Village */}
              <div className="space-y-2">
                <label
                  htmlFor="village"
                  className="block text-sm font-medium text-gray-700"
                >
                  Village <span className="text-red-500">*</span>
                </label>
                <select
                  id="village"
                  name="village"
                  value={editFormData.village || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Village</option>
                  {villages.map((village) => (
                    <option key={village} value={village}>
                      {village}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taluk */}
              <div className="space-y-2">
                <label
                  htmlFor="taluk"
                  className="block text-sm font-medium text-gray-700"
                >
                  Taluk <span className="text-red-500">*</span>
                </label>
                <input
                  id="taluk"
                  name="taluk"
                  value={editFormData.taluk || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  readOnly
                />
              </div>

              {/* District */}
              <div className="space-y-2">
                <label
                  htmlFor="district"
                  className="block text-sm font-medium text-gray-700"
                >
                  District <span className="text-red-500">*</span>
                </label>
                <input
                  id="district"
                  name="district"
                  value={editFormData.district || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  readOnly
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label
                  htmlFor="number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="number"
                  name="number"
                  value={editFormData.number || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Identity */}
              <div className="space-y-2">
                <label
                  htmlFor="identity"
                  className="block text-sm font-medium text-gray-700"
                >
                  Identity
                </label>
                <input
                  id="identity"
                  name="identity"
                  value={editFormData.identity || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <label
                  htmlFor="tag"
                  className="block text-sm font-medium text-gray-700"
                >
                  Tags
                </label>
                <input
                  id="tag"
                  name="tag"
                  value={editFormData.tag || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Consent */}
              <div className="space-y-2">
                <label
                  htmlFor="consent"
                  className="block text-sm font-medium text-gray-700"
                >
                  Consent <span className="text-red-500">*</span>
                </label>
                <select
                  id="consent"
                  name="consent"
                  value={editFormData.consent || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select Consent</option>
                  <option value="yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Consent Date */}
              <div className="space-y-2">
                <label
                  htmlFor="consent_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Consent Date
                </label>
                <input
                  id="consent_date"
                  type="date"
                  name="consent_date"
                  value={
                    editFormData.consent_date
                      ? new Date(editFormData.consent_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Farmer Category */}
              <div className="space-y-2">
                <label
                  htmlFor="farmer_category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Farmer Category
                </label>
                <input
                  id="farmer_category"
                  name="farmer_category"
                  value={editFormData.farmer_category || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Hobli */}
              <div className="space-y-2">
                <label
                  htmlFor="hobli"
                  className="block text-sm font-medium text-gray-700"
                >
                  Hobli
                </label>
                <input
                  id="hobli"
                  name="hobli"
                  value={editFormData.hobli || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Downloaded */}
              <div className="space-y-2">
                <label
                  htmlFor="downloaded"
                  className="block text-sm font-medium text-gray-700"
                >
                  Downloaded <span className="text-red-500">*</span>
                </label>
                <select
                  id="downloaded"
                  value={
                    editFormData.downloaded === true
                      ? "app"
                      : editFormData.downloaded === false
                      ? "on-board"
                      : "lead"
                  }
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      downloaded:
                        e.target.value === "app"
                          ? true
                          : e.target.value === "on-board"
                          ? false
                          : null,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="lead">Lead</option>
                  <option value="app">App</option>
                  <option value="on-board">On-board</option>
                </select>
              </div>

              {/* Downloaded Date */}
              <div className="space-y-2">
                <label
                  htmlFor="downloaded_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Downloaded Date
                </label>
                <input
                  id="downloaded_date"
                  type="date"
                  name="downloaded_date"
                  value={
                    editFormData.downloaded_date
                      ? new Date(editFormData.downloaded_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Onboarded Date */}
              <div className="space-y-2">
                <label
                  htmlFor="onboarded_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Onboarded Date
                </label>
                <input
                  id="onboarded_date"
                  type="date"
                  name="onboarded_date"
                  value={
                    editFormData.onboarded_date
                      ? new Date(editFormData.onboarded_date)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Created At */}
              <div className="space-y-2">
                <label
                  htmlFor="createdAt"
                  className="block text-sm font-medium text-gray-700"
                >
                  Created At
                </label>
                <input
                  id="createdAt"
                  type="datetime-local"
                  name="createdAt"
                  value={
                    editFormData.createdAt
                      ? new Date(editFormData.createdAt)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  readOnly
                />
              </div>

              {/* Updated At */}
              <div className="space-y-2">
                <label
                  htmlFor="updatedAt"
                  className="block text-sm font-medium text-gray-700"
                >
                  Updated At
                </label>
                <input
                  id="updatedAt"
                  type="datetime-local"
                  name="updatedAt"
                  value={
                    editFormData.updatedAt
                      ? new Date(editFormData.updatedAt)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  readOnly
                />
              </div>

              {/* Coordinates */}
              <div className="space-y-2">
                <label
                  htmlFor="coordinates"
                  className="block text-sm font-medium text-gray-700"
                >
                  Coordinates
                </label>
                <input
                  id="coordinates"
                  name="coordinates"
                  value={editFormData.coordinates || ""}
                  onChange={handleEditChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., 12.9716,77.5946"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-md border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);

export default EditModal;
