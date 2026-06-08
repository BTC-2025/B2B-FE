import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      default: "",
    },
    verificationStatus: {
      type: String,
      enum: ["VERIFIED", "UNVERIFIED", "PENDING"],
      default: "UNVERIFIED",
    },
    responseRate: {
      type: Number,
      default: 95,
    },
    responseTime: {
      type: String,
      default: "within 24 hours",
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    yearsOnPlatform: {
      type: Number,
      default: 1,
    },
    certifications: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;
