import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CgProfile } from "react-icons/cg";
import { FaMessage } from "react-icons/fa6";
import { IoIosNotifications } from "react-icons/io";
import { FaBars } from "react-icons/fa";
import { categories } from "../data/Category";
import { FaShoppingCart, FaHeart, FaHistory, FaTimes, FaFire } from "react-icons/fa";
import { getSearchSuggestions, fetchRecommendations, fetchProducts } from "../services/api";

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const readSearchHistory = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string" && item.trim()) : [];
  } catch {
    return [];
  }
};

const getProductId = (product) => product?._id || product?.id;
const getProductTitle = (product) => product?.title || product?.name || "";
const getProductImage = (product) => product?.images?.[0] || product?.image || FALLBACK_PRODUCT_IMAGE;

const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  CNY: "¥",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  SGD: "S$",
  AED: "DH",
};

export default function NavBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get("search") || "";
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState(readSearchHistory);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  // ── Localization ──
  const [currency, setCurrency] = useState(() => localStorage.getItem("selectedCurrency") || "INR");
  useEffect(() => {
    const handleLocaleChange = () => setCurrency(localStorage.getItem("selectedCurrency") || "INR");
    window.addEventListener("localeChange", handleLocaleChange);
    return () => window.removeEventListener("localeChange", handleLocaleChange);
  }, []);

  const getProductPrice = (product) => {
    if (typeof product?.price !== "number") return product?.price || "";
    const symbol = CURRENCY_SYMBOLS[currency] || currency;
    return `${symbol}${product.price.toLocaleString()}`;
  };

  const cacheRef = useRef({});
  const searchFormRef = useRef(null);

  const saveToHistory = useCallback((query) => {
    if (!query || !query.trim()) return;
    const trimmed = query.trim();
    let history = readSearchHistory();
    history = history.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    history.unshift(trimmed);
    history = history.slice(0, 5);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    setSearchHistory(history);
  }, []);

  const runSearch = useCallback((query) => {
    if (!query || !query.trim()) return;
    const trimmed = query.trim();
    saveToHistory(trimmed);
    setSearchQuery(trimmed);
    navigate(`/?search=${encodeURIComponent(trimmed)}`);
    setShowSuggestions(false);
  }, [navigate, saveToHistory]);

  const openProduct = useCallback((product) => {
    const productId = getProductId(product);
    const title = getProductTitle(product);
    if (!productId) return;
    if (title) saveToHistory(title);
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
  }, [navigate, saveToHistory]);

  const deleteHistoryItem = useCallback((e, itemToDelete) => {
    e.stopPropagation();
    const history = readSearchHistory().filter((item) => item !== itemToDelete);
    localStorage.setItem("searchHistory", JSON.stringify(history));
    setSearchHistory(history);
  }, []);

  const clearHistory = useCallback((e) => {
    e.stopPropagation();
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchTrending = async () => {
      const applyTrending = (items = []) => {
        const nextItems = items.filter(Boolean).slice(0, 4);
        if (isActive && nextItems.length > 0) {
          setTrendingProducts(nextItems);
        }
        return nextItems.length;
      };

      try {
        const data = await fetchRecommendations();
        const recommendedTrending = data?.trending?.length
          ? data.trending
          : [...(data?.contentBased || []), ...(data?.collaborative || [])];
        if (applyTrending(recommendedTrending)) return;

        const directTrending = await fetchProducts({ trending: true });
        if (applyTrending(directTrending)) return;

        const products = await fetchProducts();
        applyTrending(products.filter((product) => product.trending).slice(0, 4));
      } catch (err) {
        try {
          const products = await fetchProducts();
          applyTrending(products.filter((product) => product.trending).slice(0, 4));
        } catch (fallbackErr) {
          console.error("Failed to load trending products for search:", fallbackErr || err);
        }
      }
    };
    fetchTrending();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setSearchQuery((current) => (current === urlSearchQuery ? current : urlSearchQuery));
      if (urlSearchQuery.trim()) {
        saveToHistory(urlSearchQuery);
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [urlSearchQuery, saveToHistory]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      return;
    }

    const cacheKey = trimmedQuery.toLowerCase();
    if (cacheRef.current[cacheKey]) {
      setSuggestions(cacheRef.current[cacheKey].suggestions);
      setSuggestedProducts(cacheRef.current[cacheKey].products);
      return;
    }

    let isActive = true;
    const delayDebounceFn = setTimeout(async () => {
      const [suggestionResult, productsResult] = await Promise.allSettled([
        getSearchSuggestions(trimmedQuery),
        fetchProducts({ query: trimmedQuery }),
      ]);

      if (!isActive) return;

      if (suggestionResult.status === "rejected") {
        console.error("Search suggestions failed:", suggestionResult.reason);
      }

      if (productsResult.status === "rejected") {
        console.error("Product search failed:", productsResult.reason);
      }

      const products =
        productsResult.status === "fulfilled" && Array.isArray(productsResult.value)
          ? productsResult.value.slice(0, 5)
          : [];
      const apiSuggestions =
        suggestionResult.status === "fulfilled" && Array.isArray(suggestionResult.value)
          ? suggestionResult.value
          : [];
      const productTitleSuggestions = products.map(getProductTitle).filter(Boolean);
      const mergedSuggestions = [...new Set([...productTitleSuggestions, ...apiSuggestions])].slice(0, 8);

      cacheRef.current[cacheKey] = {
        suggestions: mergedSuggestions,
        products,
      };
      setSuggestions(mergedSuggestions);
      setSuggestedProducts(products);
    }, 250);

    return () => {
      isActive = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    runSearch(searchQuery);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const userJson = localStorage.getItem("user");
  let user = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch {
    localStorage.removeItem("user");
  }

  return (
    <div className="bg-white px-6 py-3 flex items-center justify-between shadow-md relative z-50">
      {/* Logo & Categories Trigger */}
      <div className="flex items-center space-x-6">
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-primary cursor-pointer tracking-tight"
        >
          B2BMarket
        </h1>

        <div className="relative">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center space-x-2 text-gray-700 hover:text-primary font-medium border border-gray-200 px-3 py-1.5 rounded-md hover:border-primary transition-colors"
          >
            <FaBars />
            <span>All Categories</span>
          </button>

          {/* Dropdown Menu */}
          {showCategories && (
            <div className="absolute top-12 left-0 w-64 bg-white shadow-xl rounded-lg border border-gray-100 max-h-96 overflow-y-auto custom-scrollbar">
              {categories.map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(`/category/${encodeURIComponent(cat.name)}`);
                    setShowCategories(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 hover:text-primary"
                >
                  {cat.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center Search */}
      <form ref={searchFormRef} onSubmit={handleSearchSubmit} className="flex w-1/3 mx-4 relative">
        <input
          className="w-full border border-gray-300 rounded-l-md px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="Search for products, suppliers..."
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            setSuggestions([]);
            setSuggestedProducts([]);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-r-md font-medium hover:bg-blue-700 transition-colors">
          Search
        </button>

        {/* Suggestions / History / Trending Dropdown */}
        {showSuggestions && (searchHistory.length > 0 || trendingProducts.length > 0 || (searchQuery.trim() && (suggestions.length > 0 || suggestedProducts.length > 0))) && (
          <div className="absolute top-full left-0 mt-1 w-full lg:w-[500px] bg-white border border-gray-200 rounded-xl shadow-2xl z-[100] overflow-hidden p-4 max-h-[500px] overflow-y-auto custom-scrollbar">
            
            {/* 1. TOP SECTION: Recent Searches & Trending Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
              {/* Recent Searches */}
              {searchHistory.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                      <FaHistory className="text-gray-300" />
                      <span>Recent Searches</span>
                    </span>
                    <button onClick={clearHistory} className="text-[10px] text-red-400 hover:text-red-600 font-bold">Clear</button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {searchHistory.slice(0, 3).map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-lg cursor-pointer group transition-all"
                        onClick={() => runSearch(item)}
                      >
                        <span className="text-xs text-gray-600 font-semibold truncate max-w-[120px]">{item}</span>
                        <FaTimes 
                          size={8} 
                          className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100" 
                          onClick={(e) => deleteHistoryItem(e, item)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Trending Links */}
              {trendingProducts.length > 0 && (
                <div>
                  <div className="mb-3 px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                      <FaFire className="text-orange-400" />
                      <span>Hot Right Now</span>
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {trendingProducts.slice(0, 3).map((p) => (
                      <div 
                        key={getProductId(p)}
                        onClick={() => openProduct(p)}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-orange-50 rounded-lg cursor-pointer transition-all"
                      >
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse flex-shrink-0" />
                        <span className="text-xs text-gray-700 font-bold truncate">{getProductTitle(p)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. TRENDING PRODUCTS FULL VIEW (Only if not typing) */}
            {!searchQuery.trim() && trendingProducts.length > 0 && (
              <div className="mb-4 pb-3">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-3 px-1">Recommended Wholesale Items</div>
                <div className="grid grid-cols-1 gap-2">
                  {trendingProducts.slice(0, 4).map((p) => {
                    const title = getProductTitle(p);
                    const priceFormatted = getProductPrice(p);
                    const image = getProductImage(p);
                    return (
                      <div
                        key={getProductId(p) || getProductTitle(p)}
                        onClick={() => openProduct(p)}
                        className="flex items-center gap-3 p-2.5 hover:bg-blue-50/50 rounded-xl cursor-pointer border border-transparent hover:border-blue-100 transition-all"
                      >
                        <img src={image} alt={title} className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-800 truncate">{title}</h4>
                          <p className="text-[10px] text-gray-500 truncate">{p.category || "General"}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-black text-[#195BAC]">{priceFormatted}</span>
                          <p className="text-[9px] text-gray-400 font-medium">MOQ: {p.moq || "1 unit"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. SUGGESTIONS (While typing) */}
            {searchQuery.trim() && suggestions.length > 0 && (
              <div className="mb-4 pb-3 border-b border-gray-100">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2 px-1">Suggestions</div>
                <div className="flex flex-col gap-1">
                  {suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      onClick={() => runSearch(suggestion)}
                      className="px-3 py-2.5 hover:bg-blue-50 rounded-lg cursor-pointer text-sm text-gray-700 font-bold hover:text-[#195BAC] transition-all flex items-center gap-3"
                    >
                      <span className="text-gray-300">🔍</span>
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SUGGESTED PRODUCTS (While typing) */}
            {searchQuery.trim() && suggestedProducts.length > 0 && (
              <div className="mb-1">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] mb-3 px-1">Quick Matches</div>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedProducts.map((p) => {
                    const title = getProductTitle(p);
                    const priceFormatted = getProductPrice(p);
                    const image = getProductImage(p);
                    return (
                      <div
                        key={getProductId(p) || getProductTitle(p)}
                        onClick={() => openProduct(p)}
                        className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer border border-gray-100 transition-all bg-gray-50/30"
                      >
                        <img src={image} alt={title} className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-gray-800 truncate">{title}</h4>
                          <p className="text-[10px] text-gray-500 truncate">{p.category}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-black text-[#195BAC]">{priceFormatted}</span>
                          <p className="text-[9px] text-gray-400 font-medium">MOQ: {p.moq}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {/* Right Actions */}
      <div className="flex items-center space-x-6 text-gray-600">
        <div className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors relative group">
          <IoIosNotifications size={22} />
          <span className="text-xs">Alerts</span>
        </div>

        <div onClick={() => navigate("/help-desk")} className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors">
          <FaMessage size={20} />
          <span className="text-xs">Messages</span>
        </div>

        <div onClick={() => navigate("/wishlist")} className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors">
          <FaHeart size={20} className="mb-0.5" />
          <span className="text-xs">Wishlist</span>
        </div>

        <div
          onClick={() => navigate("/cart")}
          className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors"
        >
          <span className="text-lg font-bold">
            <FaShoppingCart size={22} />
          </span>
          <span className="text-xs">Cart</span>
        </div>

        {user ? (
          <div className="flex items-center gap-2">
            <div
              onClick={() => navigate(user.role === "SELLER" ? "/seller-dashboard" : "/settings")}
              className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors"
            >
              <CgProfile size={22} />
              <span className="text-xs font-semibold">{user.name.split(" ")[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-red-500 font-bold hover:underline cursor-pointer ml-1"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="bg-primary text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="border border-primary text-primary px-4 py-2 rounded-md font-semibold hover:bg-primary hover:text-white transition-colors cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
