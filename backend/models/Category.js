import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    banner: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    productCount: {
      type: Number,
      default: 0,
    },
    supplierCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    newArrivals: {
      type: Boolean,
      default: false,
    },
    featuredProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
    topSearchKeywords: {
      type: [String],
      default: [],
    },
    popularBrands: {
      type: [String],
      default: [],
    },
    countries: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [String],
      default: [],
    },
    shippingOptions: {
      type: [String],
      default: [],
    },
    paymentMethods: {
      type: [String],
      default: [],
    },
    languagesSupported: {
      type: [String],
      default: [],
    },
    advertisementSlots: [
      {
        title: String,
        image: String,
        link: String,
      },
    ],
    faqs: [
      {
        question: String,
        answer: String,
      },
    ],
    relatedCategories: {
      type: [String],
      default: [],
    },
    filters: {
      type: [String],
      default: [],
    },
    analytics: {
      monthlyViews: { type: Number, default: 0 },
      monthlyOrders: { type: Number, default: 0 },
    },
    rfqEnabled: {
      type: Boolean,
      default: true,
    },
    chatEnabled: {
      type: Boolean,
      default: true,
    },
    wishlistEnabled: {
      type: Boolean,
      default: true,
    },
    compareEnabled: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
    },
    subscriptionRequired: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
