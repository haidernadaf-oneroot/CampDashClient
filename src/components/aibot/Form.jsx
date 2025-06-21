"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { debounce } from "lodash";
import CreatableSelect from "react-select/creatable";

const cropOptions = [
  { value: "Tender Coconut", label: "Tender Coconut" },
  { value: "Dry Coconut", label: "Dry Coconut" },
  { value: "Turmeric", label: "Turmeric" },
  { value: "Banana", label: "Banana" },
  { value: "Pineapple", label: "Pineapple" },
];

const Form = ({ recording, onClose, getToken, setRecordings }) => {
  const [formData, setFormData] = useState({
    number: recording?.To?.replace(/^(\+91|91)/, "") || "",
    name: "",
    tag: "",
    crop: [],
    next_harvest_date: "",
    no_of_trees: "",
  });

  const [userExists, setUserExists] = useState(false);
  const [loadingUser, setLoadingUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!formData.number || !/^\d{10}$/.test(formData.number)) {
        setUserExists(false);
        setLoadingUser(false);
        return;
      }

      setLoadingUser(true);
      try {
        const token = getToken();
        if (!token) throw new Error("Authentication token missing");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/aibotData/get-userbynumber?number=${formData.number}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();

        const user =
          json.user || json.data || (res.ok && json.number ? json : null);

        if (res.ok && user && user.number) {
          setFormData((prev) => ({
            ...prev,
            name: user.name || "",
            tag: user.tag || "",
            crop: user.crop ? user.crop.split(",").map((c) => c.trim()) : [],
            next_harvest_date: user.next_harvest_date
              ? new Date(user.next_harvest_date).toISOString().split("T")[0]
              : "",
            no_of_trees:
              user.no_of_trees !== undefined ? String(user.no_of_trees) : "",
          }));
          setUserExists(true);
          toast.success("Existing user loaded");
        } else {
          setUserExists(false);
          if (!res.ok) {
            throw new Error(json.message || "Failed to fetch user");
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err.message);
        toast.error(err.message || "Error fetching user");
        setUserExists(false);
      } finally {
        setLoadingUser(false);
      }
    };

    const debouncedFetch = debounce(fetchUser, 400);
    debouncedFetch();

    return () => debouncedFetch.cancel();
  }, [formData.number, getToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return toast.error("Login required");

    if (!formData.number || !/^\d{10}$/.test(formData.number)) {
      return toast.error("Enter valid 10-digit number");
    }

    if (!formData.name) {
      return toast.error("Name is required");
    }

    const payload = {
      number: formData.number,
      name: formData.name,
      tag: formData.tag || "",
      crop: Array.isArray(formData.crop)
        ? formData.crop.join(", ")
        : formData.crop,
      next_harvest_date: formData.next_harvest_date || "not specified",
      no_of_trees: formData.no_of_trees ? Number(formData.no_of_trees) : 0,
    };

    try {
      setIsSubmitting(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/aibotData/createUser`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      toast.success("User saved successfully");

      if (setRecordings) {
        setRecordings((prev) => [...prev, data.user || data.data || data]);
      }

      onClose();
    } catch (err) {
      console.error("Error saving user:", err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Create User</h2>
        <form onSubmit={handleSubmit}>
          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              disabled={loadingUser}
              className="w-full border p-2 rounded bg-gray-100"
              placeholder="Enter 10-digit number"
              required
            />
            {formData.number && !loadingUser && (
              <p
                className={`text-sm mt-1 ${
                  userExists ? "text-green-600" : "text-red-600"
                }`}
              >
                {userExists
                  ? "✅ Existing user found"
                  : "⚠️ New user - will be created"}
              </p>
            )}
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={userExists || loadingUser}
              className="w-full border p-2 rounded"
              placeholder="Enter name"
              required
            />
          </div>

          {/* Tag */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Tag</label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              disabled={loadingUser}
              className="w-full border p-2 rounded"
              placeholder="e.g., region"
            />
          </div>

          {/* Crop - Multi Select */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Crop(s)</label>
            <CreatableSelect
              isMulti
              options={cropOptions}
              value={
                formData.crop?.map((c) => ({
                  label: c,
                  value: c,
                })) || []
              }
              onChange={(selected) =>
                setFormData((prev) => ({
                  ...prev,
                  crop: selected.map((s) => s.value),
                }))
              }
              isDisabled={loadingUser}
              placeholder="Select or type crops..."
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          {/* Next Harvest Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium">
              Next Harvest Date
            </label>
            <input
              type="date"
              name="next_harvest_date"
              value={formData.next_harvest_date}
              onChange={handleChange}
              disabled={loadingUser}
              className="w-full border p-2 rounded"
            />
          </div>

          {/* No of Trees */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Number of Trees</label>
            <input
              type="number"
              name="no_of_trees"
              value={formData.no_of_trees}
              onChange={handleChange}
              disabled={loadingUser}
              min={0}
              className="w-full border p-2 rounded"
              placeholder="0"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loadingUser}
              className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-blue-300"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
