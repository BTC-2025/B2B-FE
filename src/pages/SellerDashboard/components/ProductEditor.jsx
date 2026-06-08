import React, { useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { createProduct } from "../../../services/api";

const PaymentMethod = ({ icon, label, active, dashed, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`h-10 px-4 rounded-lg border flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 select-none ${active ? "border-[#195BAC] bg-[#195BAC]/5 dark:bg-[#195BAC]/20 text-[#195BAC] dark:text-[#5c9ce6] shadow-sm" : dashed ? "border-dashed border-gray-300 dark:border-slate-600 text-gray-400 hover:border-[#195BAC] dark:hover:border-[#5c9ce6] hover:text-[#195BAC] dark:hover:text-[#5c9ce6]" : "border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-[#195BAC] dark:hover:border-[#5c9ce6] hover:bg-gray-50 dark:hover:bg-slate-700"}`}
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
      {active && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#195BAC] dark:bg-[#5c9ce6]"></span>
      )}
    </div>
  );
};

const initialData = {
  productName: "Smart Watches",
  brand: "Astro Retail",
  category: "Electronics",
  regularPrice: "280",
  salePrice: "180",
  schedule: "08/12/2023 - 08/24/2023",
  date: "08/23/2023",
  sku: "123456HG",
  stock: "1234",
};

const emptyData = {
  productName: "",
  brand: "Astro Retail",
  category: "Electronics",
  regularPrice: "",
  salePrice: "",
  schedule: "",
  date: "",
  sku: "",
  stock: "",
};

const defaultImages = [
  "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1616348436168-de43ad0db179?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
];

const ProductEditor = ({ isNewProduct, onAddProduct }) => {
  const [activeTab, setActiveTab] = useState("All");

  const [formData, setFormData] = useState(
    isNewProduct ? emptyData : initialData,
  );

  // Reset form when isNewProduct changes
  React.useEffect(() => {
    setFormData(isNewProduct ? emptyData : initialData);
  }, [isNewProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* State for Images */
  const [images, setImages] = useState(isNewProduct ? [] : defaultImages);

  /* Refs for file inputs */
  const fileInputRef = React.useRef(null);

  const handlePublish = async () => {
    try {
      const productPayload = {
        title: formData.productName,
        description: `Premium wholesale B2B ${formData.productName} by Astro Retail. High quality production materials and design.`,
        category: formData.category,
        subCategory: "General",
        brand: formData.brand,
        price: parseFloat(formData.salePrice || formData.regularPrice || 0),
        moq: 10,
        stock: parseInt(formData.stock || 100),
        images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        tags: [formData.category.toLowerCase(), "wholesale", "b2b"]
      };

      const newProduct = await createProduct(productPayload);
      if (onAddProduct) {
        onAddProduct(newProduct);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish product");
    }
  };

  /* Handle Image Upload */
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImageUrls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...newImageUrls]);
  };

  /* Handle Change Click */
  const triggerImageUpload = () => {
    fileInputRef.current.click();
  };

  // Reset images when isNewProduct changes
  React.useEffect(() => {
    setImages(isNewProduct ? [] : defaultImages);
  }, [isNewProduct]);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-10 pb-20">
      {/* Hidden File Input */}
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />

      {/* Breadcrumb / Title area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Product Editor
        </h1>
       {/*  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2.5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-2 text-[#195BAC] dark:text-[#5c9ce6] font-semibold bg-[#195BAC]/10 dark:bg-[#195BAC]/20 px-2 py-1 rounded-md">
            <span className="material-symbols-outlined text-sm">refresh</span>
            Data Refreshed
          </span>
          <span className="hidden sm:inline">September 28, 2023 12:35 PM</span>
        </div> */}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700 mb-6 overflow-x-auto hide-scrollbar">
        {["All", "Published", "Drafts", "Trash"].map((tab, i) => {
          const isActive = tab.startsWith(activeTab); // Simplified logic
          // In a real app we'd parse the name
          const tabName = tab.split(" ")[0];

          return (
            <button
              key={i}
              onClick={() => setActiveTab(tabName)}
              className={`pb-3 border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-[#195BAC] dark:border-[#5c9ce6] text-[#195BAC] dark:text-[#5c9ce6]"
                  : "border-transparent hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          );
        })}
       
      </div>

      {/* Product Settings Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 lg:p-8 transition-colors duration-300">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="w-1 h-6 bg-[#195BAC] dark:bg-[#5c9ce6] rounded-full"></span>
          Product Settings
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-1 border rounded-xl p-5 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50/50 dark:bg-slate-900/50">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
              Product Images
            </p>

            {/* Main Preview */}
            <div className="aspect-[3/4] bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600 flex items-center justify-center mb-4 relative overflow-hidden group">
              {images.length > 0 ? (
                <img
                  src={images[0]}
                  alt="Product Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-4xl mb-2">
                    image
                  </span>
                  <span className="text-sm">No Image Selected</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-[2px]">
                <button
                  onClick={triggerImageUpload}
                  className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:scale-105 transition-transform flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    edit
                  </span>{" "}
                  {images.length > 0 ? "Change" : "Upload"}
                </button>
              </div>
            </div>

            {/* Grid Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              <div
                onClick={triggerImageUpload}
                className="aspect-square bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-[#195BAC] dark:hover:border-[#5c9ce6] hover:text-[#195BAC] dark:hover:text-[#5c9ce6] hover:bg-[#195BAC]/5 dark:hover:bg-[#195BAC]/10 transition-all text-center p-1"
              >
                {/* <span className="material-symbols-outlined mb-1">
                  add_photo
                </span> */}
                <span className="text-[10px] font-medium">Add</span>
              </div>

              {/* Show remaining images (skip index 0 as it's the main one) */}
              {images.slice(1).map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 relative group overflow-hidden cursor-pointer"
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                Product Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-[#195BAC]/10 focus:border-[#195BAC] dark:focus:border-[#5c9ce6] outline-none transition-all font-medium text-gray-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Brand Name
                </label>
                <div className="relative">
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-[#195BAC]/10 focus:border-[#195BAC] dark:focus:border-[#5c9ce6] outline-none transition-all appearance-none cursor-pointer text-gray-800 dark:text-white"
                  >
                    <option>Astro Retail</option>
                    <option>Other Brand</option>
                  </select>
                  {/*  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  </span> */}
                </div>
              </div>
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-[#195BAC]/10 focus:border-[#195BAC] dark:focus:border-[#5c9ce6] outline-none transition-all appearance-none cursor-pointer text-gray-800 dark:text-white"
                  >
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Regular Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Regular Price
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium group-focus-within:text-[#195BAC] dark:group-focus-within:text-[#5c9ce6] transition-colors">
                    $
                  </span>
                  <input
                    type="text"
                    name="regularPrice"
                    value={formData.regularPrice}
                    onChange={handleChange}
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-[#195BAC] dark:border-[#5c9ce6] ring-4 ring-[#195BAC]/10 dark:ring-[#5c9ce6]/20 bg-white dark:bg-slate-700 outline-none font-bold text-gray-800 dark:text-white transition-all"
                  />
                </div>
              </div>
              {/* Sale Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Sale Price
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium group-focus-within:text-[#195BAC] dark:group-focus-within:text-[#5c9ce6] transition-colors">
                    $
                  </span>
                  <input
                    type="text"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-[#195BAC]/10 focus:border-[#195BAC] dark:focus:border-[#5c9ce6] outline-none font-medium text-gray-800 dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Schedule */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Schedule
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-[#195BAC]/10 focus:border-[#195BAC] dark:focus:border-[#5c9ce6] outline-none transition-all text-gray-800 dark:text-white"
                  />
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                    <CalendarMonthIcon />
                  </span>
                </div>
              </div>
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-[#195BAC]/10 focus:border-[#195BAC] dark:focus:border-[#5c9ce6] outline-none transition-all text-gray-800 dark:text-white"
                  />
                  {/*  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                    expand_more
                  </span> */}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Product type
                </label>
                <div className="relative">
                  <select className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white outline-none appearance-none cursor-pointer">
                    <option>Simple</option>
                    <option>Variable</option>
                  </select>
                  {/*   <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span> */}
                </div>
              </div>
              {/* Stock status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Stock status
                </label>
                <div className="relative">
                  <select className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white outline-none appearance-none cursor-pointer">
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-[#195BAC]/10 focus:border-[#195BAC] dark:focus:border-[#5c9ce6] outline-none transition-all uppercase font-mono tracking-wider text-gray-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Stock Status (Already have this field but following image structure) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Delivery Type
                </label>
                <select className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white outline-none appearance-none cursor-pointer relative">
                  <option>Fast Delivery</option>
                </select>
              </div>
              {/* Quantity in stock */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Quantity in stock
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50/30 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-4 focus:ring-[#195BAC]/10 focus:border-[#195BAC] dark:focus:border-[#5c9ce6] outline-none transition-all text-gray-800 dark:text-white"
                />
              </div>
              {/* Units */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                  Units
                </label>
                <select className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white outline-none appearance-none cursor-pointer">
                  <option>Pieces</option>
                  <option>Kg</option>
                  <option>Liters</option>
                </select>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">
                Payment Methods
              </label>
              <div className="flex flex-wrap gap-3">
                <PaymentMethod icon="credit_card" label="Mastercard" active />
                <PaymentMethod icon="payments" label="VISA" />
                <PaymentMethod icon="account_balance_wallet" label="G Pay" />
                <PaymentMethod icon="laptop" label="Apple Pay" />
                <PaymentMethod icon="currency_bitcoin" label="PayPal" />
                <PaymentMethod icon="add" label="Add" dashed />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-4 pt-8 mt-4 border-t border-gray-100 dark:border-slate-700">
              <button className="h-12 px-8 rounded-full border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 font-bold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                Cancel
              </button>
              <button className="h-12 px-8 rounded-full bg-[#195BAC]/10 dark:bg-[#195BAC]/20 text-[#195BAC] dark:text-[#5c9ce6] font-bold text-sm hover:bg-[#195BAC]/20 dark:hover:bg-[#195BAC]/30 transition-colors">
                Save to Drafts
              </button>
              <button
                onClick={handlePublish}
                className="h-12 px-10 rounded-full bg-[#00C2A0] text-white font-bold text-sm hover:bg-[#00a98b] shadow-lg shadow-[#00C2A0]/20 hover:shadow-xl hover:shadow-[#00C2A0]/30 transform active:scale-95 transition-all cursor-pointer"
              >
                Publish Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductEditor;
