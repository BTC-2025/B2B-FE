import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      default: "",
    },
    brand: {
      type: String,
      default: "Generic",
    },
    price: {
      type: Number,
      required: true,
    },
    moq: {
      type: Number,
      default: 1,
    },
    stock: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    supplierScore: {
      type: Number,
      default: 80,
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

// Search indexing helper (simple regex match or text index)
productSchema.index({ title: "text", description: "text", tags: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
