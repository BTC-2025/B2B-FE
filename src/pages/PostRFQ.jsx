import React, { useState } from "react";
import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";
import TopUtilityBar from "../components/TopUtilityBar";
import { postRFQ } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PostRFQ() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Consumer Electronics",
    quantity: 1,
    unit: "pieces",
    budget: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    "Consumer Electronics",
    "Apparel & Accessories",
    "Home & Garden",
    "Beauty",
    "Health & Medical",
    "Furniture",
    "Industrial Machinery",
    "Construction & Real Estate",
    "Agriculture",
    "Automotive",
    "Electrical Equipment",
    "Jewellery",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await postRFQ(formData);
      setSuccess(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error("Error posting RFQ:", err);
      alert("Failed to post RFQ. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F5F7] h-screen flex flex-col overflow-hidden">
      <TopUtilityBar />
      <NavBar />
      <SecondaryNavBar />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-[#195BAC] px-10 py-12 text-white">
            <h1 className="text-3xl font-bold mb-2">Request for Quotation (RFQ)</h1>
            <p className="opacity-80">Tell us what you need, and get custom quotes from verified manufacturers within 24 hours.</p>
          </div>

          <div className="p-10">
            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-green-600 text-4xl">check</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">RFQ Posted Successfully!</h2>
                <p className="text-gray-500">Redirecting you to the marketplace...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name / Title *</label>
                    <input
                      required
                      type="text"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#195BAC] focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Wholesale Cotton T-shirts for retail"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                    <select
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#195BAC] focus:border-transparent outline-none transition-all"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Quantity *</label>
                      <input
                        required
                        type="number"
                        min="1"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#195BAC] focus:border-transparent outline-none transition-all"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Unit</label>
                      <input
                        type="text"
                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#195BAC] focus:border-transparent outline-none transition-all"
                        placeholder="pcs, kg, tons..."
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Detailed Requirements *</label>
                    <textarea
                      required
                      rows="5"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#195BAC] focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Specify material, size, colors, certifications, and any other details to help suppliers provide an accurate quote."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Budget (Optional - ₹)</label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#195BAC] focus:border-transparent outline-none transition-all"
                      placeholder="Target price in INR"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-xs text-gray-400 max-w-sm">
                    By submitting this RFQ, you agree to share your contact details with verified suppliers who respond to your request.
                  </p>
                  <button
                    disabled={loading}
                    type="submit"
                    className="bg-[#00C2A0] hover:bg-[#00a88b] text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-[#00C2A0]/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? "Posting..." : "Submit RFQ Request"}
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
