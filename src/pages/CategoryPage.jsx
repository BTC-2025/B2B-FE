import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";
import TopUtilityBar from "../components/TopUtilityBar";
import ProductCard from "../components/ProductCard";
import { fetchProducts } from "../services/api";
import { categoryMap } from "../data/categoryStructure";

export default function CategoryPage() {
  const { categoryName } = useParams();

  // Decode the category name safely; fallback to raw param if decoding fails
  let decodedCategory = "";
  try {
    decodedCategory = categoryName ? decodeURIComponent(categoryName) : "";
  } catch {
    decodedCategory = categoryName || "";
  }

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryInfo, setCategoryInfo] = useState(null);

  useEffect(() => {
    // Find category info from map - case-insensitive match
    const entry = Object.entries(categoryMap).find(
      ([key]) =>
        key.toLowerCase() === decodedCategory.toLowerCase() ||
        decodedCategory.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(decodedCategory.toLowerCase())
    );
    const info = entry ? { name: entry[0], subCategories: entry[1] } : null;
    setCategoryInfo(info);

    const loadProducts = async () => {
      setLoading(true);
      try {
        const searchCategory = info ? info.name : decodedCategory;
        const data = await fetchProducts({ category: searchCategory });
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching products for category:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (decodedCategory && decodedCategory.trim() !== "") {
      loadProducts();
    }
  }, [decodedCategory]);

  return (
    <div className="bg-[#F4F5F7] h-screen flex flex-col overflow-hidden">
      <TopUtilityBar />
      <NavBar />
      <SecondaryNavBar />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Category Hero/Banner */}
        <div className="bg-[#195BAC] text-white py-12 px-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate("/")} 
              className="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Marketplace
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <h1 className="text-4xl font-extrabold mb-4">{decodedCategory}</h1>
                {categoryInfo?.description && (
                  <p className="max-w-2xl text-lg text-white/80 font-medium">
                    {categoryInfo.description}
                  </p>
                )}
                <div className="flex gap-6 mt-6">
                  <div className="text-center bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <p className="text-xs opacity-70 uppercase font-bold tracking-widest mb-1">Products</p>
                    <p className="text-xl font-bold">
                      {categoryInfo?.productCount || products.length * 10 || "1,200"}+
                    </p>
                  </div>
                  <div className="text-center bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                    <p className="text-xs opacity-70 uppercase font-bold tracking-widest mb-1">Suppliers</p>
                    <p className="text-xl font-bold">
                      {categoryInfo?.supplierCount || "450"}+
                    </p>
                  </div>
                </div>
              </div>

              {categoryInfo?.subCategories && (
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 max-w-sm w-full">
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-widest opacity-70">Popular Sub-categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {categoryInfo.subCategories.slice(0, 6).map((sub) => (
                      <span
                        key={sub.name}
                        onClick={() => navigate(`/category/${encodeURIComponent(sub.name)}`)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="w-2 h-8 bg-[#00C2A0] rounded-full"></span>
              Wholesale Catalog
            </h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-[#195BAC] transition-all">Filter</button>
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-[#195BAC] transition-all">Sort By</button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#195BAC] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-gray-300 text-5xl">inventory_2</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                We couldn't find any products in the "{decodedCategory}" category at the moment. Try checking related categories or post an RFQ.
              </p>
              <button
                onClick={() => navigate("/post-rfq")}
                className="mt-8 bg-[#195BAC] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#154d92] transition-all shadow-lg shadow-[#195BAC]/20"
              >
                Post an RFQ Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  product={{
                    ...p,
                    id: p._id || p.id,
                    name: p.title,
                    price:
                      typeof p.price === "number"
                        ? `₹${p.price.toLocaleString()}`
                        : p.price,
                    image:
                      p.images?.[0] ||
                      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
