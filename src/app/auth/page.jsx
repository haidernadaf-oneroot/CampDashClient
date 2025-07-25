"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ phoneNumber: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/agent/token/:token`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        router.replace("/Farmer");
      } catch {
        localStorage.clear();
        router.replace("/auth");
      }
    };

    validateToken();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let phone = formData.phoneNumber.trim();
      if (!phone.startsWith("+91")) {
        phone = "+91" + phone;
      }

      const payload = {
        ...formData,
        phoneNumber: phone,
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/agent/login`,
        payload
      );

      const { token, agent } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("agentName", agent.name || "Agent");

      router.replace("/Farmer");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-purple-600">
      <div className="max-w-md mx-auto border-yellow-700 border-2 border-y-yellow-700  p-6 rounded-lg  bg-purple-200 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Login
        </h2>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 text-black">
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
