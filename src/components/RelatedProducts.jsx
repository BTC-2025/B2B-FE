import React, { useEffect, useState } from "react";
import { fetchProducts } from "../services/api";
import ProductCard from "./ProductCard";

// Displays a grid of related products from the same category, excluding the current product.
export default function RelatedProducts({ category, currentId }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts({ category });
        // Filter out the current product and limit to 8 items for layout consistency
        const filtered = (Array.isArray(data) ? data : [])
          .filter((p) => (p._id || p.id) !== currentId)
          .slice(0, 8);
        setRelated(filtered);
      } catch (e) {
        console.error("Failed to load related products", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [category, currentId]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-4 border-[#195BAC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {related.map((p) => (
        <ProductCard key={p._id || p.id} product={{
          ...p,
          id: p._id || p.id,
          name: p.title,
          price: typeof p.price === "number" ? `₹${p.price.toLocaleString()}` : p.price,
          image: p.images?.[0] || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=60"
        }} />
      ))}
    </div>
  );
}
