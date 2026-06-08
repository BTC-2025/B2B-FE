import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60";

// Lazy image using IntersectionObserver — only loads when near viewport
function LazyImage({ src, alt }) {
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative h-44 w-full overflow-hidden rounded-xl bg-gray-100">
      {/* Shimmer placeholder */}
      {!loaded && <div className="absolute inset-0 skeleton-shimmer" />}
      {visible && (
        <img
          src={error ? FALLBACK_IMG : src || FALLBACK_IMG}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); setLoaded(true); }}
          className={`img-lazy absolute inset-0 w-full h-full object-cover ${loaded ? "loaded" : ""}`}
        />
      )}
    </div>
  );
}

function StarRating({ value = 4.5 }) {
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-xs ${i < full ? "text-amber-400" : i === full && half ? "text-amber-300" : "text-gray-200"}`}>★</span>
      ))}
      <span className="text-[10px] text-gray-400 ml-1">{value}</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  // ── Localization state ───────────────────────────────────
  const [currency, setCurrency] = useState(() => localStorage.getItem("selectedCurrency") || "INR");

  useEffect(() => {
    const handleLocaleChange = () => {
      setCurrency(localStorage.getItem("selectedCurrency") || "INR");
    };
    window.addEventListener("localeChange", handleLocaleChange);
    window.addEventListener("storage", handleLocaleChange);
    return () => {
      window.removeEventListener("localeChange", handleLocaleChange);
      window.removeEventListener("storage", handleLocaleChange);
    };
  }, []);

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

  // ── Wishlist state (localStorage) ────────────────────────
  const [wishlisted, setWishlisted] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
      return saved.some((item) => item.id === (product._id || product.id));
    } catch { return false; }
  });

  // ── Cart state (localStorage) ────────────────────────────
  const [inCart, setInCart] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      return saved.some((item) => item.id === (product._id || product.id));
    } catch { return false; }
  });

  const toggleWishlist = useCallback((e) => {
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const id = product._id || product.id;
      const exists = saved.some((i) => i.id === id);
      const updated = exists
        ? saved.filter((i) => i.id !== id)
        : [...saved, { id, name: product.name || product.title, price: product.price, image: product.images?.[0] || product.image }];
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setWishlisted(!exists);
    } catch { /* ignore */ }
  }, [product]);

  const addToCart = useCallback((e) => {
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("cart") || "[]");
      const id = product._id || product.id;
      if (!saved.some((i) => i.id === id)) {
        saved.push({ id, name: product.name || product.title, price: product.price, image: product.images?.[0] || product.image, qty: 1 });
        localStorage.setItem("cart", JSON.stringify(saved));
        setInCart(true);
      } else {
        navigate("/cart");
      }
    } catch { /* ignore */ }
  }, [product, navigate]);

  const productId = product._id || product.id;
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const displayPrice = typeof product.price === "number"
    ? `${symbol}${product.price.toLocaleString()}`
    : product.price;

  return (
    <div
      onClick={() => navigate(`/product/${productId}`)}
      className="product-card bg-white rounded-2xl border border-gray-100 p-3 cursor-pointer flex flex-col h-full group relative"
    >
      {/* Wishlist button */}
      <button
        onClick={toggleWishlist}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm shadow flex items-center justify-center transition-transform hover:scale-110"
      >
        <span className={`text-base ${wishlisted ? "text-red-500" : "text-gray-300"}`}>
          {wishlisted ? "♥" : "♡"}
        </span>
      </button>

      {/* Image */}
      <LazyImage src={product.images?.[0] || product.image} alt={product.name || product.title} />

      {/* Info */}
      <div className="flex-1 mt-3 flex flex-col gap-1">
        <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug">
          {product.name || product.title}
        </h4>
        <StarRating value={product.rating || 4.5} />
        <p className="text-base font-bold text-[#195BAC] mt-0.5">{displayPrice}</p>
        <p className="text-[11px] text-gray-400">Min. Order: {product.moq || 1} pcs</p>
        {(product.supplier?.companyName) && (
          <p className="text-[11px] text-gray-500 truncate">
            🏭 {product.supplier.companyName}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={addToCart}
          className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors ${
            inCart
              ? "bg-[#195BAC] text-white"
              : "bg-[#195BAC]/10 text-[#195BAC] hover:bg-[#195BAC] hover:text-white"
          }`}
        >
          {inCart ? "✓ In Cart" : "Add to Cart"}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); navigate("/help-desk"); }}
          className="px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 text-xs font-bold transition-colors"
        >
          RFQ
        </button>
      </div>
    </div>
  );
}
