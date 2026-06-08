import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SecondaryNavBar from "../components/SecondaryNavBar";
import { fetchProductById, trackUserInterest, addProductReview } from "../services/api";
import { FaHeart, FaShoppingCart, FaCheckCircle, FaStar, FaBuilding, FaMapMarkerAlt, FaShieldAlt } from "react-icons/fa";
import RelatedProducts from "../components/RelatedProducts";

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

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // ── Localization ──
  const [currency, setCurrency] = useState(() => localStorage.getItem("selectedCurrency") || "INR");
  useEffect(() => {
    const handleLocaleChange = () => setCurrency(localStorage.getItem("selectedCurrency") || "INR");
    window.addEventListener("localeChange", handleLocaleChange);
    return () => window.removeEventListener("localeChange", handleLocaleChange);
  }, []);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      try {
        const data = await fetchProductById(productId);
        setProduct(data);
        setQuantity(data.moq || 1);
        setReviews(data.reviews || []);

        // Track user interest in this category/product for recommendations
        const userJson = localStorage.getItem("user");
        if (userJson) {
          trackUserInterest({ product: data._id, category: data.category }).catch(console.error);
        }

        // Check wishlist status
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setInWishlist(wishlist.some((item) => (item._id || item.id) === (data._id || data.id)));

        // Check cart status
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setInCart(cart.some((item) => (item._id || item.id) === (data._id || data.id)));

      } catch (err) {
        console.error("Error in loadProduct:", err);
        setError(`Failed to load product details: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleWishlistToggle = () => {
    if (!product) return;
    let wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const pid = product._id || product.id;
    
    if (inWishlist) {
      wishlist = wishlist.filter((item) => (item._id || item.id) !== pid);
      setInWishlist(false);
    } else {
      wishlist.push(product);
      setInWishlist(true);
    }
    
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  };

  const handleAddToCart = () => {
    if (!product) return;
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const pid = product._id || product.id;

    if (inCart) {
      navigate("/cart");
      return;
    }

    const cartItem = {
      ...product,
      id: pid,
      quantity: quantity,
    };
    cart.push(cartItem);
    setInCart(true);
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    setReviewError("");
    try {
      const updatedProduct = await addProductReview(productId, {
        rating: newRating,
        comment: newComment,
      });
      setProduct(updatedProduct);
      setReviews(updatedProduct.reviews || []);
      setNewComment("");
      setNewRating(5);
    } catch (err) {
      setReviewError(
        err.response?.data?.message ||
          "Failed to submit review. Make sure you are logged in."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <NavBar />
        <SecondaryNavBar />
        <div className="flex-1 flex items-center justify-center text-gray-500 font-medium">
          Loading product specifications...
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        <NavBar />
        <SecondaryNavBar />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <p className="text-red-500 font-bold mb-4">{error || "Product not found."}</p>
          <button onClick={() => navigate("/")} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const mainImage = product.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col font-sans">
      <NavBar />
      <SecondaryNavBar />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 flex gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => navigate("/")}>Home</span>
          <span>&gt;</span>
          <span className="hover:underline cursor-pointer" onClick={() => navigate(`/?search=${encodeURIComponent(product.category)}`)}>{product.category}</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-medium">{product.title}</span>
        </div>

        {/* Product Info Block */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Gallery */}
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[4/3] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
              <img src={mainImage} alt={product.title} className="w-full h-full object-contain" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images?.map((img, idx) => (
                <div key={idx} className="aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden cursor-pointer">
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </div>
              ))}
            </div>
          </div>

          {/* Center Column - Title & Specs */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              {product.trending && (
                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
                  Trending Item
                </span>
              )}
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                {product.title}
              </h1>
              <p className="text-sm text-gray-400 mt-1">Brand: {product.brand}</p>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex text-yellow-400">
                <FaStar />
              </div>
              <span className="font-bold text-gray-800">{product.rating}</span>
              <span className="text-gray-400">({product.reviewCount} Reviews)</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 font-semibold">{product.salesCount}+ Ordered</span>
            </div>

            <hr className="border-gray-100" />

            {/* Price & MOQ */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Wholesale Price (FOB)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#195BAC]">
                    {CURRENCY_SYMBOLS[currency] || currency}{product.price.toLocaleString()}
                  </span>
                  <span className="text-gray-500 text-sm font-medium">/ piece</span>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-700 bg-slate-50/50 p-3 rounded-lg border border-gray-100">
                <span className="font-medium">Minimum Order Quantity (MOQ):</span>
                <span className="font-bold text-[#195BAC]">{product.moq} pieces</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 text-sm">
              <span className="font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.moq || 1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center focus:outline-none text-sm font-bold"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Cart / Wishlist Actions with both Text & Icon */}
            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className={`flex-1 min-w-[150px] h-12 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer
                  ${
                    inCart
                      ? "bg-teal-600 text-white hover:bg-teal-700"
                      : "bg-[#195BAC] text-white hover:bg-[#144b8d]"
                  }
                `}
              >
                <FaShoppingCart />
                <span>{inCart ? "In Cart (View)" : "Add to Cart"}</span>
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`h-12 px-6 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer
                  ${
                    inWishlist
                      ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <FaHeart />
                <span>{inWishlist ? "In Favorites" : "Add to Wishlist"}</span>
              </button>
            </div>
          </div>

          {/* Right Column - Supplier Profile Card */}
          <div className="lg:col-span-3 border border-gray-200 rounded-2xl p-6 bg-gray-50/50 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-[#00C2A0] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Verified
                </span>
                <span className="text-yellow-500 flex items-center gap-1 text-xs font-bold">
                  <FaShieldAlt /> Gold Supplier
                </span>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <FaBuilding className="text-gray-400 flex-shrink-0" />
                  {product.supplier?.companyName || "Burj Tech Wholesale Ltd"}
                </h4>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <FaMapMarkerAlt /> {product.supplier?.city || "Mumbai"}, {product.supplier?.country || "India"}
                </p>
              </div>

              <hr className="border-gray-200" />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Response Rate</span>
                  <span className="font-bold text-gray-800">{product.supplier?.responseRate || 95}%</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Response Time</span>
                  <span className="font-bold text-gray-800">{product.supplier?.responseTime || "within 2h"}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/help-desk")}
              className="w-full mt-6 h-11 border-2 border-[#195BAC] text-[#195BAC] rounded-xl font-bold text-sm hover:bg-[#195BAC]/5 transition-colors cursor-pointer"
            >
              Contact Supplier
            </button>
          </div>
        </div>

        {/* Specifications Tab */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">
            Product Specifications
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Ratings & Reviews Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12">
            <h3 className="text-xl font-bold text-gray-900 border-b border-gray-150 pb-4 mb-2">
              Ratings & Reviews
            </h3>
          </div>

          {/* Rating Summary Breakdown */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-black text-gray-950">
                {product.rating || "0.0"}
              </div>
              <div>
                <div className="flex text-yellow-400 text-lg">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar key={i} className={i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on {reviews.length} product reviews
                </p>
              </div>
            </div>

            {/* Progress Bars */}
            <div className="space-y-2 mt-4">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-12 font-semibold text-gray-600">{stars} Stars</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-400 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-5 space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No reviews yet for this product. Be the first to leave one!</p>
            ) : (
              <div className="divide-y divide-gray-150">
                {reviews.map((rev, idx) => (
                  <div key={idx} className={`${idx > 0 ? "pt-4 mt-4" : ""} space-y-1`}>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-800">{rev.userName}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex text-yellow-400 text-xs">
                      {Array.from({ length: 5 }, (_, i) => (
                        <FaStar key={i} className={i < rev.rating ? "text-yellow-400" : "text-gray-200"} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed pt-1">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write a Review */}
          <div className="lg:col-span-3 bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h4 className="font-bold text-gray-800 text-sm mb-3">Write a Review</h4>
            
            {localStorage.getItem("token") ? (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="text-lg focus:outline-none transition-transform active:scale-90 cursor-pointer"
                      >
                        <FaStar className={star <= newRating ? "text-yellow-400" : "text-gray-200"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-500">Your Comment</label>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Describe your experience with this wholesale item..."
                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-white focus:border-[#195BAC] outline-none resize-none transition-all"
                  />
                </div>

                {reviewError && (
                  <p className="text-xs text-red-500 font-medium">{reviewError}</p>
                )}

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full h-10 bg-[#195BAC] hover:bg-[#144b8d] text-white rounded-xl text-xs font-bold shadow transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-gray-500">You must be signed in to submit a product review.</p>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full h-10 bg-[#195BAC] hover:bg-[#144b8d] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
        {/* Related Products Section */}
        <section className="mt-12 max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <RelatedProducts category={product?.category} currentId={product?._id || product?.id} />
        </section>
    </div>
  );
}
