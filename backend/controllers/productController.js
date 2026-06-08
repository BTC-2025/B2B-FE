import mongoose from "mongoose";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";
import User from "../models/User.js";

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getSearchRegex = (query = "") => new RegExp(escapeRegExp(query.trim()), "i");

// Helper to calculate ranking score
const calculateRankingScore = (product, query = "") => {
  const normalizedQuery = query.trim().toLowerCase();
  const title = product.title?.toLowerCase() || "";
  const description = product.description?.toLowerCase() || "";
  const category = product.category?.toLowerCase() || "";
  const subCategory = product.subCategory?.toLowerCase() || "";
  const brand = product.brand?.toLowerCase() || "";
  const tags = Array.isArray(product.tags) ? product.tags : [];
  const keywordMatch =
    normalizedQuery &&
    (title.includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      category.includes(normalizedQuery) ||
      subCategory.includes(normalizedQuery) ||
      brand.includes(normalizedQuery) ||
      tags.some((t) => String(t).toLowerCase().includes(normalizedQuery)))
      ? 1
      : normalizedQuery
        ? 0
        : 1;

  const supplierRating = product.supplier?.rating ? product.supplier.rating / 5 : 0.8;
  const salesCount = Math.min(product.salesCount / 1000, 1);
  const reviewRating = product.rating ? product.rating / 5 : 0.8;
  const views = Math.min(product.views / 5000, 1);

  const ageInMs = Date.now() - new Date(product.createdAt).getTime();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  const freshness = Math.max(1 - ageInMs / thirtyDaysInMs, 0);

  const score =
    keywordMatch * 0.4 +
    supplierRating * 0.2 +
    salesCount * 0.15 +
    reviewRating * 0.1 +
    views * 0.1 +
    freshness * 0.05;

  return score;
};

export const getProducts = async (req, res) => {
  const { query, category, brand, supplierId, sort, trending, bestSeller, featured } = req.query;
  const trimmedQuery = query?.trim() || "";
  const userId = req.headers["x-user-id"]; // Read optional user ID for personalization

  try {
    let filter = {};

    if (category) {
      filter.$or = [
        { category: category },
        { subCategory: category }
      ];
    }
    if (brand) filter.brand = brand;
    if (supplierId) filter.supplier = supplierId;
    if (trending === "true") filter.trending = true;
    if (bestSeller === "true") filter.bestSeller = true;
    if (featured === "true") filter.featured = true;

    if (trimmedQuery) {
      const searchRegex = getSearchRegex(trimmedQuery);
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
        { brand: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    let products = await Product.find(filter).populate("supplier");

    // Fetch user profile if logged in (safely)
    let user = null;
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      user = await User.findById(userId);
    }

    // Map and score products
    let scoredProducts = products.map((product) => {
      let score = calculateRankingScore(product, trimmedQuery);

      // Personalize ranking based on user interests
      if (user && user.interests && user.interests.includes(product.category)) {
        score += 0.3; // Boost score for matching interests
      }

      if (trimmedQuery) {
        const lowerQuery = trimmedQuery.toLowerCase();
        const lowerTitle = product.title?.toLowerCase() || "";
        if (lowerTitle === lowerQuery) score += 0.5;
        else if (lowerTitle.startsWith(lowerQuery)) score += 0.3;
        else if (lowerTitle.includes(lowerQuery)) score += 0.15;
      }

      return {
        ...product.toObject(),
        rankingScore: score,
      };
    });

    // Sort by rankingScore descending (or fallback if specified)
    scoredProducts.sort((a, b) => b.rankingScore - a.rankingScore);

    res.json(scoredProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("supplier");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Increment views asynchronously
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  const { title, description, category, subCategory, brand, price, moq, stock, images, tags } = req.body;

  try {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(403).json({ message: "Seller profile not found. Please setup supplier profile first." });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

    const product = await Product.create({
      title,
      slug,
      description,
      category,
      subCategory,
      brand,
      price,
      moq,
      stock,
      images: images || [],
      supplier: supplier._id,
      tags: tags || [],
    });

    supplier.totalProducts += 1;
    await supplier.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate ownership (sellers can only edit their own products)
    if (req.user.role !== "ADMIN") {
      const supplier = await Supplier.findOne({ user: req.user._id });
      if (!supplier || product.supplier.toString() !== supplier._id.toString()) {
        return res.status(403).json({ message: "Not authorized to update this product" });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate ownership
    if (req.user.role !== "ADMIN") {
      const supplier = await Supplier.findOne({ user: req.user._id });
      if (!supplier || product.supplier.toString() !== supplier._id.toString()) {
        return res.status(403).json({ message: "Not authorized to delete this product" });
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    const supplier = await Supplier.findById(product.supplier);
    if (supplier) {
      supplier.totalProducts = Math.max(supplier.totalProducts - 1, 0);
      await supplier.save();
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchSuggestions = async (req, res) => {
  const query = req.query.query?.trim() || "";
  if (!query) return res.json([]);

  try {
    const searchRegex = getSearchRegex(query);
    const suggestions = await Product.find({
      $or: [
        { title: searchRegex },
        { category: searchRegex },
        { subCategory: searchRegex },
        { brand: searchRegex },
        { tags: { $in: [searchRegex] } },
      ],
    })
      .limit(6)
      .select("title category brand tags");

    // Format list of suggestions to include standard phrases (Wholesale, Supplier, Manufacturer)
    const formatted = [];
    suggestions.forEach((p) => {
      if (p.title) {
        formatted.push(p.title);
        formatted.push(`${p.title} Wholesale`);
        formatted.push(`${p.title} Supplier`);
        formatted.push(`${p.title} Manufacturer`);
      }
      if (p.category) formatted.push(p.category);
      if (p.brand) formatted.push(p.brand);
    });

    res.json([...new Set(formatted)].slice(0, 8));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProductReview = async (req, res) => {
  const { rating, comment } = req.body;
  const userName = req.user?.name || "Anonymous User";

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      userName,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    if (!product.reviews) product.reviews = [];
    product.reviews.push(review);

    // Update rating calculations
    product.reviewCount = product.reviews.length;
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
    product.rating = Number((totalRating / product.reviews.length).toFixed(1));

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
