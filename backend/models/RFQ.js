import mongoose from "mongoose";

const quotationSchema = new mongoose.Schema({
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED"],
    default: "PENDING",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const rfqSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
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
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      default: "pieces",
    },
    budget: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["OPEN", "CLOSED", "COMPLETED"],
      default: "OPEN",
    },
    quotations: [quotationSchema],
  },
  { timestamps: true }
);

const RFQ = mongoose.model("RFQ", rfqSchema);
export default RFQ;
