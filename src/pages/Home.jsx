import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";
import TopUtilityBar from "../components/TopUtilityBar";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { fetchProducts, fetchRecommendations } from "../services/api";
import { products as dummyProducts } from "../data/Product";
import { categories } from "../data/Category";

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoriesRef = useRef(null);
  const recsRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const productsPromise = fetchProducts({ query: searchQuery })
          .catch(() => {
            console.warn("API failed, using dummy products fallback");
            const filtered = searchQuery
              ? dummyProducts.filter((p) =>
                  p.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
              : dummyProducts;
            return filtered.map((p) => ({
              _id: p.id,
              title: p.name,
              price: p.price,
              moq: p.moq,
              images: [p.image],
              category: "General",
              supplier: { companyName: "Mock Supplier" },
            }));
          });

        const recPromise = fetchRecommendations().catch(() => {
          return { type: "cold-start", trending: [] };
        });

        let [productsData, recData] = await Promise.all([
          productsPromise,
          recPromise,
        ]);

        if (searchQuery && productsData.length === 0) {
          const filtered = dummyProducts.filter((p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          if (filtered.length > 0) {
            productsData = filtered.map((p) => ({
              _id: p.id,
              title: p.name,
              price: p.price,
              moq: p.moq,
              images: [p.image],
            }));
          }
        }

        setProducts(productsData);

        if (!searchQuery) {
          const grouped = productsData.reduce((acc, p) => {
            const cat = p.category || "Other";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(p);
            return acc;
          }, {});
          setGroupedProducts(grouped);
        }

        if (recData && recData.type === "personalized") {
          const combined = [
            ...(recData.contentBased || []),
            ...(recData.collaborative || []),
          ];
          const uniqueRecs = [];
          const seenIds = new Set();
          combined.forEach((item) => {
            if (!seenIds.has(item._id)) {
              seenIds.add(item._id);
              uniqueRecs.push(item);
            }
          });
          setRecommendations(
            uniqueRecs.length > 0 ? uniqueRecs : productsData.slice(0, 5)
          );
        } else {
          setRecommendations(
            recData && recData.trending && recData.trending.length > 0
              ? recData.trending
              : productsData.slice(0, 5)
          );
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchQuery]);

  useEffect(() => {
    // Force a re-render when search history changes to ensure home screen stays updated
    const handleStorageChange = (e) => {
      if (e.key === "searchHistory") {
        setProducts([...products]); // Trigger re-render
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [products]);

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <TopUtilityBar />
      <NavBar />
      <SecondaryNavBar />

      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Hero Section */}
        <div className="bg-[#195BAC] text-white relative overflow-hidden min-h-[400px] flex items-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
          </div>
          
          <div className="px-10 py-16 max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase mb-4 border border-white/20">
                Verified Global Wholesale
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
                {searchQuery ? `Search Results for "${searchQuery}"` : (
                  <>
                    Global Wholesale <br />
                    <span className="text-[#00C2A0]">Trade Starts Here</span>
                  </>
                )}
              </h1>
              <p className="text-lg opacity-90 max-w-xl mb-8 font-medium">
                {searchQuery ? "Find verified wholesale manufacturers and factories for your business." : "Source millions of products from 200,000+ verified suppliers worldwide. High quality, low MOQ, factory prices."}
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-[#00C2A0] hover:bg-[#00a88b] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-[#00C2A0]/20 flex items-center gap-2">
                  Source Now <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button 
                   onClick={() => navigate("/post-rfq")}
                   className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold transition-all"
                >
                  Get RFQ Quotes
                </button>
              </div>
            </div>
            
            {!searchQuery && (
              <div className="hidden lg:block w-1/3 bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
                <div className="mb-6">
                  <span className="text-xs font-bold text-[#00C2A0] block mb-1 uppercase tracking-widest">Fast Delivery</span>
                  <h3 className="text-xl font-bold">MOQ: Under 10 Units</h3>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                      <div className="w-12 h-12 bg-gray-200/20 rounded-xl"></div>
                      <div className="flex-1">
                        <div className="h-2 w-20 bg-white/20 rounded-full mb-2"></div>
                        <div className="h-2 w-12 bg-white/10 rounded-full"></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                  <p className="text-sm font-medium opacity-70">Over 50,000 items ready to ship</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {loading ? (
            <>
              <div className="mb-12">
                <div className="h-7 w-52 rounded-full skeleton-shimmer mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl skeleton-shimmer" />
                      <div className="h-3 w-20 rounded-full skeleton-shimmer" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-12">
                <div className="h-7 w-64 rounded-full skeleton-shimmer mb-8" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {Array.from({ length: 15 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Category Quick Navigation */}
              {!searchQuery && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="w-2 h-8 bg-[#195BAC] rounded-full"></span>
                      Source by Category
                    </h2>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => scroll(categoriesRef, "left")}
                        className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#195BAC] hover:text-[#195BAC] flex items-center justify-center bg-white shadow-sm transition-all cursor-pointer font-bold text-gray-600"
                        title="Scroll Left"
                      >
                        &lt;
                      </button>
                      <button 
                        onClick={() => scroll(categoriesRef, "right")}
                        className="w-8 h-8 rounded-full border border-gray-200 hover:border-[#195BAC] hover:text-[#195BAC] flex items-center justify-center bg-white shadow-sm transition-all cursor-pointer font-bold text-gray-600"
                        title="Scroll Right"
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                  <div 
                    ref={categoriesRef} 
                    className="flex overflow-x-auto gap-4 pb-3 scroll-smooth snap-x snap-mandatory custom-scrollbar"
                  >
                    {[
                      { name: "Consumer Electronics", icon: "devices" },
                      { name: "Apparel & Accessories", icon: "apparel" },
                      { name: "Home & Garden", icon: "home" },
                      { name: "Industrial Machinery", icon: "settings" },
                      { name: "Beauty", icon: "face" },
                      { name: "Automotive", icon: "directions_car" },
                      { name: "Agriculture", icon: "agriculture" },
                      { name: "Health & Medical", icon: "medical_services" },
                      { name: "Furniture", icon: "chair" },
                      { name: "Electrical Equipment", icon: "bolt" },
                      { name: "Jewellery", icon: "diamond" },
                      { name: "Construction & Real Estate", icon: "foundation" }
                    ].map(cat => (
                      <div 
                        key={cat.name} 
                        onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
                        className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#195BAC]/20 transition-all cursor-pointer group text-center snap-start min-w-[170px] flex-shrink-0"
                      >
                        <div className="w-12 h-12 bg-[#F4F5F7] rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:bg-[#195BAC]/10 transition-colors">
                           <span className="material-symbols-outlined text-[#195BAC]">{cat.icon}</span>
                        </div>
                        <span className="font-bold text-gray-700 group-hover:text-[#195BAC] transition-colors">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Directional Product Catalog */}
              {searchQuery ? (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-gray-900 flex items-center gap-4">
                      <span className="w-2.5 h-10 bg-[#00C2A0] rounded-full"></span>
                      Search Results for "{searchQuery}"
                    </h2>
                    <span className="bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full text-sm font-bold">
                      {products.length} {products.length === 1 ? "Product" : "Products"} Found
                    </span>
                  </div>

                  {products.length === 0 ? (
                    <>
                      <div className="bg-white p-20 rounded-[40px] text-center shadow-xl shadow-[#195BAC]/5 border border-gray-100 flex flex-col items-center mb-16">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                          <span className="material-symbols-outlined text-gray-300 text-5xl">search_off</span>
                        </div>
                        <h3 className="text-gray-900 font-black text-2xl mb-2">No matching wholesale items</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-8">We couldn't find any products matching your search. Try different keywords or browse our categories.</p>
                        <button 
                          onClick={() => navigate("/")}
                          className="bg-[#195BAC] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#154d92] transition-all shadow-lg shadow-[#195BAC]/20"
                        >
                          Clear Search & Browse All
                        </button>
                      </div>

                      {recommendations.length > 0 && (
                        <div className="mb-16">
                           <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                              <span className="w-2 h-8 bg-[#195BAC] rounded-full"></span>
                              Products You May Like
                           </h2>
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                              {recommendations.slice(0, 10).map((p) => (
                                <ProductCard key={p._id || p.id} product={p} />
                              ))}
                           </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {products.map((p) => (
                        <ProductCard key={p._id || p.id} product={p} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Category Row - Search History if exists */}
                  {localStorage.getItem("searchHistory") && JSON.parse(localStorage.getItem("searchHistory")).length > 0 && (
                    <div className="mb-12 bg-white/50 p-6 rounded-3xl border border-dashed border-gray-200">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">history</span>
                        Jump Back In
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {JSON.parse(localStorage.getItem("searchHistory")).slice(0, 5).map(term => (
                          <button 
                            key={term}
                            onClick={() => navigate(`/?search=${encodeURIComponent(term)}`)}
                            className="bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:border-[#195BAC] hover:text-[#195BAC] transition-all shadow-sm flex items-center gap-2 group"
                          >
                            <span>🔍</span>
                            {term}
                            <span className="material-symbols-outlined text-xs text-gray-300 group-hover:text-[#195BAC] transition-colors">trending_flat</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category Rows - Multi-Directional Browsing */}
                  <div className="space-y-16 mb-16">
                    {Object.entries(groupedProducts).map(([catName, items]) => (
                      <ProductRow key={catName} title={catName} products={items} />
                    ))}
                  </div>
                </>
              )}

              {/* Recommendations */}
              {!searchQuery && recommendations.length > 0 && (
                <div className="bg-[#F8FAFC] -mx-8 px-8 py-16 mb-12 border-y border-gray-100">
                  <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Personalized For You
                        </h2>
                        <p className="text-gray-500 mt-1">Based on your browsing history and industry interests</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => scroll(recsRef, "left")}
                          className="w-8 h-8 rounded-full border border-gray-200 hover:border-primary hover:text-primary flex items-center justify-center bg-white shadow-sm transition-all cursor-pointer font-bold text-gray-600"
                          title="Scroll Left"
                        >
                          &lt;
                        </button>
                        <button 
                          onClick={() => scroll(recsRef, "right")}
                          className="w-8 h-8 rounded-full border border-gray-200 hover:border-primary hover:text-primary flex items-center justify-center bg-white shadow-sm transition-all cursor-pointer font-bold text-gray-600"
                          title="Scroll Right"
                        >
                          &gt;
                        </button>
                      </div>
                    </div>
                    <div 
                      ref={recsRef} 
                      className="flex overflow-x-auto gap-6 pb-5 scroll-smooth snap-x snap-mandatory custom-scrollbar"
                    >
                      {recommendations.map((p) => (
                        <div key={`${p._id || p.id}-rec`} className="snap-start min-w-[240px] max-w-[240px] flex-shrink-0">
                          <ProductCard product={{
                            ...p,
                            id: p._id || p.id,
                            name: p.title,
                            price: typeof p.price === "number" ? `₹${p.price.toLocaleString()}` : p.price,
                            image: p.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                          }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Featured Suppliers Section */}
              {!searchQuery && (
                <div className="mb-16">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                      <span className="w-2 h-8 bg-orange-400 rounded-full"></span>
                      Verified Top Suppliers
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { name: "Global Tech Electronics", origin: "Shenzhen, CN", rate: "98%", score: 4.9 },
                      { name: "Precision Industrial Ltd", origin: "Maharashtra, IN", rate: "95%", score: 4.8 },
                      { name: "Prime Apparel Factory", origin: "Dhaka, BD", rate: "99%", score: 5.0 }
                    ].map(sup => (
                      <div key={sup.name} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center font-bold text-[#195BAC]">
                            {sup.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{sup.name}</h3>
                            <p className="text-xs text-gray-500">{sup.origin}</p>
                          </div>
                          <div className="ml-auto flex items-center gap-1 text-orange-400 text-sm font-bold">
                            <span className="material-symbols-outlined text-sm">star</span>
                            {sup.score}
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-50">
                          <span>Response Rate: <span className="text-[#00C2A0]">{sup.rate}</span></span>
                          <button className="text-[#195BAC] hover:underline">Profile →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Shared Component for Category Rows ─────────────────────────────
function ProductRow({ title, products }) {
  const rowRef = useRef(null);
  const navigate = useNavigate();

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === "left" ? -500 : 500;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <span className="w-2 h-8 bg-primary rounded-full opacity-30"></span>
          {title}
        </h2>
        <div className="flex items-center gap-4">
          <span 
            onClick={() => navigate(`/category/${encodeURIComponent(title)}`)}
            className="text-primary cursor-pointer hover:underline text-sm font-bold flex items-center gap-1"
          >
            View all <span className="material-symbols-outlined text-sm">trending_flat</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => scroll("left")}
              className="w-9 h-9 rounded-full border border-gray-200 hover:border-primary hover:text-primary flex items-center justify-center bg-white shadow-sm transition-all cursor-pointer font-bold text-gray-600"
              title="Scroll Left"
            >
              &lt;
            </button>
            <button 
              onClick={() => scroll("right")}
              className="w-9 h-9 rounded-full border border-gray-200 hover:border-primary hover:text-primary flex items-center justify-center bg-white shadow-sm transition-all cursor-pointer font-bold text-gray-600"
              title="Scroll Right"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={rowRef} 
        className="flex overflow-x-auto gap-6 pb-6 scroll-smooth snap-x snap-mandatory custom-scrollbar"
      >
        {products.map((p) => (
          <div key={p._id || p.id} className="snap-start min-w-[260px] max-w-[260px] flex-shrink-0">
            <ProductCard product={p} />
          </div>
        ))}
        {/* "View More" card at the end of each row */}
        <div 
          onClick={() => navigate(`/category/${encodeURIComponent(title)}`)}
          className="snap-start min-w-[200px] flex-shrink-0 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white hover:border-primary transition-all group"
        >
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary">add</span>
           </div>
           <span className="font-bold text-gray-500 group-hover:text-primary">View All {title}</span>
        </div>
      </div>
    </div>
  );
}
