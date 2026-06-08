import RFQ from "../models/RFQ.js";
import Supplier from "../models/Supplier.js";

export const createRFQ = async (req, res) => {
  const { title, description, category, quantity, unit, budget } = req.body;

  try {
    const rfq = await RFQ.create({
      buyer: req.user._id,
      title,
      description,
      category,
      quantity,
      unit,
      budget,
    });
    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRFQs = async (req, res) => {
  try {
    let query = {};

    // Buyers only see their own RFQs
    if (req.user.role === "BUYER") {
      query.buyer = req.user._id;
    }
    // Sellers/Admins see all RFQs (can filter by category if needed)
    else if (req.user.role === "SELLER") {
      const { category } = req.query;
      if (category) {
        query.category = category;
      }
    }

    const rfqs = await RFQ.find(query)
      .populate("buyer", "name email")
      .populate("quotations.supplier")
      .sort({ createdAt: -1 });

    res.json(rfqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRFQById = async (req, res) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("quotations.supplier");
      
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    // Auth validation
    if (req.user.role === "BUYER" && rfq.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this RFQ" });
    }

    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitQuotation = async (req, res) => {
  const { price, details } = req.body;

  try {
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(403).json({ message: "Only registered suppliers can quote on RFQs" });
    }

    // Check if supplier already quoted
    const alreadyQuoted = rfq.quotations.some(
      (q) => q.supplier.toString() === supplier._id.toString()
    );
    if (alreadyQuoted) {
      return res.status(400).json({ message: "You have already submitted a quotation for this RFQ" });
    }

    rfq.quotations.push({
      supplier: supplier._id,
      price,
      details,
    });

    await rfq.save();
    res.status(201).json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuotationStatus = async (req, res) => {
  const { quotationId, status } = req.body; // 'ACCEPTED' or 'REJECTED'

  try {
    const rfq = await RFQ.findById(req.params.id);
    if (!rfq) {
      return res.status(404).json({ message: "RFQ not found" });
    }

    if (rfq.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this RFQ" });
    }

    const quote = rfq.quotations.id(quotationId);
    if (!quote) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    quote.status = status;

    if (status === "ACCEPTED") {
      rfq.status = "COMPLETED";
    }

    await rfq.save();
    res.json(rfq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
