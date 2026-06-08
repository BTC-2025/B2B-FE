import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Import Routes
import User from "./models/User.js";
import Product from "./models/Product.js";
import Category from "./models/Category.js";
import Supplier from "./models/Supplier.js";
import Message from "./models/Message.js";

import {
  register,
  login,
  getProfile,
  updateInterests,
  googleLogin,
} from "./controllers/authController.js";
import { enableMockDb } from "./middleware/mockDb.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchSuggestions,
  addProductReview,
} from "./controllers/productController.js";
import { getRecommendations } from "./controllers/recommendationController.js";
import {
  createRFQ,
  getRFQs,
  getRFQById,
  submitQuotation,
  updateQuotationStatus,
} from "./controllers/rfqController.js";
import { getMessages, getChatContacts } from "./controllers/chatController.js";
import {
  createOrder,
  getOrders,
  updateOrderStatus,
  getSellerAnalytics,
} from "./controllers/orderController.js";

import { protect, authorize } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const logBody = { ...req.body };
    if (logBody.password) logBody.password = "***";
    console.log("  Body:", JSON.stringify(logBody));
  }
  next();
});

// Auth Endpoints
app.post("/api/auth/register", register);
app.post("/api/auth/login", login);
app.post("/api/auth/google-login", googleLogin);
app.get("/api/auth/profile", protect, getProfile);
app.post("/api/auth/interests", protect, updateInterests);

// Product Endpoints
app.get("/api/products", getProducts);
app.get("/api/products/suggest", searchSuggestions);
app.get("/api/products/:id", getProductById);
app.post("/api/products", protect, authorize("SELLER", "ADMIN"), createProduct);
app.put("/api/products/:id", protect, authorize("SELLER", "ADMIN"), updateProduct);
app.delete("/api/products/:id", protect, authorize("SELLER", "ADMIN"), deleteProduct);
app.post("/api/products/:id/reviews", protect, addProductReview);

// Recommendation Endpoints
app.get("/api/recommendations", getRecommendations);

// RFQ Endpoints
app.post("/api/rfq", protect, createRFQ);
app.get("/api/rfq", protect, getRFQs);
app.get("/api/rfq/:id", protect, getRFQById);
app.post("/api/rfq/:id/quote", protect, authorize("SELLER", "ADMIN"), submitQuotation);
app.put("/api/rfq/:id/quote-status", protect, updateQuotationStatus);

// Chat Endpoints
app.get("/api/chat/messages/:otherUserId", protect, getMessages);
app.get("/api/chat/contacts", protect, getChatContacts);

// Order Endpoints
app.post("/api/orders", protect, createOrder);
app.get("/api/orders", protect, getOrders);
app.put("/api/orders/:id", protect, authorize("SELLER", "ADMIN"), updateOrderStatus);
app.get("/api/orders/seller/analytics", protect, authorize("SELLER", "ADMIN"), getSellerAnalytics);

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error caught:", err.stack || err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

// Real-Time Chat WebSocket Listeners
const activeUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", (userId) => {
    activeUsers.set(userId, socket.id);
    console.log(`User ${userId} registered to socket ${socket.id}`);
    io.emit("user_status", { userId, status: "online" });
  });

  socket.on("send_message", async (data) => {
    const { senderId, recipientId, text, image, file } = data;

    try {
      const msg = await Message.create({
        sender: senderId,
        recipient: recipientId,
        text,
        image,
        file,
      });

      const recipientSocketId = activeUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("new_message", msg);
      }
      
      socket.emit("message_sent", msg);
    } catch (err) {
      console.error("Error sending message via WS:", err);
    }
  });

  socket.on("typing", (data) => {
    const { senderId, recipientId, isTyping } = data;
    const recipientSocket = activeUsers.get(recipientId);
    if (recipientSocket) {
      io.to(recipientSocket).emit("typing_status", { senderId, isTyping });
    }
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit("user_status", { userId, status: "offline" });
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// MongoDB Connection & Seeding
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/b2b-marketplace";

const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 });
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB connection error: Failed to connect to a real MongoDB instance. Enabling Mock Database Fallback.");
    enableMockDb();
  }

  try {
    await seedDatabase();
  } catch (err) {
    console.error("Failed to seed database:", err);
  }

  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    server.listen(PORT, () => {
      console.log(`B2B Marketplace API Server running on port ${PORT}`);
    });
  }
};

startServer();

// Export for Vercel
export default app;

// Database Seed Function
async function seedDatabase() {
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log("Seeding Category data...");
      const categories = [
        { name: "Consumer Electronics", slug: "consumer-electronics" },
        { name: "Apparel & Accessories", slug: "apparel-accessories" },
        { name: "Home & Garden", slug: "home-garden" },
        { name: "Beauty", slug: "beauty" },
        { name: "Health & Medical", slug: "health-medical" },
        { name: "Furniture", slug: "furniture" },
        { name: "Industrial Machinery", slug: "industrial-machinery" },
        { name: "Construction & Real Estate", slug: "construction-real-estate" },
        { name: "Agriculture", slug: "agriculture" },
        { name: "Automotive", slug: "automotive" },
        { name: "Electrical Equipment", slug: "electrical-equipment" },
        { name: "Jewellery", slug: "jewellery" },
      ];
      await Category.insertMany(categories);
    }

    // Create or find mock seller & supplier
    let adminUser = await User.findOne({ email: "seller@burj.com" });
    let supplier;

    if (!adminUser) {
      const hashedPassword = "$2a$10$wK1RkMecF.3mO1V4nE.f3eqG0wK2RkMecF.3mO1V4nE.f3eqG0wK2"; // "password123"
      adminUser = await User.create({
        name: "Burj Tech Vendor",
        email: "seller@burj.com",
        password: hashedPassword,
        role: "SELLER",
        interests: ["Consumer Electronics", "Industrial Machinery"],
      });

      supplier = await Supplier.create({
        user: adminUser._id,
        companyName: "Burj Tech Wholesale Ltd",
        country: "India",
        city: "Mumbai",
        verificationStatus: "VERIFIED",
        rating: 4.9,
        reviews: 240,
        yearsOnPlatform: 3,
        totalProducts: 8,
      });
    } else {
      supplier = await Supplier.findOne({ user: adminUser._id });
    }

    // Seed Products if low count
    const productCount = await Product.countDocuments();
    if (productCount < 50 && supplier) {
      console.log("Seeding expanded Product data...");
      const products = [
        // Consumer Electronics
        {
          title: "Premium Smart Watches",
          slug: "premium-smart-watches-1",
          description: "High quality wholesale smart watches for retail and distribution. Features heart rate monitoring, GPS, and custom applications.",
          category: "Consumer Electronics",
          subCategory: "Mobiles",
          brand: "Astro Retail",
          price: 180,
          moq: 10,
          stock: 1200,
          images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 35,
          salesCount: 850,
          views: 3200,
          tags: ["smartwatch", "wearables", "electronics"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Ultra-HD Smart Security Camera",
          slug: "ultra-hd-smart-security-camera-1",
          description: "4K Resolution outdoor security camera with AI person detection, night vision, and cloud storage integration.",
          category: "Consumer Electronics",
          subCategory: "Security",
          brand: "Guardian",
          price: 45,
          moq: 20,
          stock: 500,
          images: ["https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.6,
          reviewCount: 89,
          salesCount: 1200,
          views: 4500,
          tags: ["security", "camera", "smart home"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        {
          title: "Wireless Noise Cancelling Headphones",
          slug: "wireless-noise-cancelling-headphones-1",
          description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.",
          category: "Consumer Electronics",
          subCategory: "Audio",
          brand: "SoundMaster",
          price: 250,
          moq: 5,
          stock: 500,
          images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 120,
          salesCount: 1500,
          views: 6000,
          tags: ["headphones", "audio", "wireless", "electronics"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Smart Wi-Fi Coffee Maker",
          slug: "smart-coffee-maker-1",
          description: "Programmable coffee maker with Wi-Fi connectivity. Start your brew from your smartphone.",
          category: "Consumer Electronics",
          subCategory: "Home Appliances",
          brand: "BrewTech",
          price: 85,
          moq: 10,
          stock: 300,
          images: ["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.6,
          reviewCount: 56,
          salesCount: 450,
          views: 2200,
          tags: ["coffee", "smart home", "appliances"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        // Apparel & Accessories
        {
          title: "Custom Cotton Blank T-Shirts",
          slug: "custom-cotton-blank-t-shirts-1",
          description: "Wholesale 100% premium combed cotton blanks for custom printing, embroidery, and retail fashion houses.",
          category: "Apparel & Accessories",
          subCategory: "Men Clothing",
          brand: "Burj Apparel",
          price: 4,
          moq: 50,
          stock: 15000,
          images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 112,
          salesCount: 14000,
          views: 9200,
          tags: ["t-shirt", "cotton", "apparel", "wholesale clothing"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Designer Silk Scarves",
          slug: "designer-silk-scarves-1",
          description: "Elegant 100% mulberry silk scarves with hand-rolled edges. Various patterns available for luxury boutiques.",
          category: "Apparel & Accessories",
          subCategory: "Women Accessories",
          brand: "Elite Silk",
          price: 35,
          moq: 20,
          stock: 500,
          images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 42,
          salesCount: 1200,
          views: 3500,
          tags: ["silk", "scarf", "accessories", "luxury"],
          featured: true,
          trending: false,
          bestSeller: false,
        },
        // Home & Garden
        {
          title: "Solar Powered LED Path Lights",
          slug: "solar-powered-led-path-lights-1",
          description: "Weatherproof solar lights for gardens and paths. Easy installation, automatic dusk-to-dawn operation, and eco-friendly.",
          category: "Home & Garden",
          subCategory: "Lighting",
          brand: "EcoLight",
          price: 8,
          moq: 50,
          stock: 10000,
          images: ["https://images.unsplash.com/photo-1508704919640-f9ef78e59dea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.5,
          reviewCount: 67,
          salesCount: 5000,
          views: 8000,
          tags: ["garden", "lighting", "solar", "eco"],
          featured: false,
          trending: false,
          bestSeller: true,
        },
        {
          title: "Stainless Steel Eco-Friendly Water Bottle",
          slug: "stainless-steel-water-bottle-1",
          description: "Vacuum insulated double-wall stainless steel water bottle. Keeps drinks cold for 24h or hot for 12h.",
          category: "Home & Garden",
          subCategory: "Kitchen",
          brand: "EcoVibe",
          price: 12,
          moq: 100,
          stock: 2000,
          images: ["https://images.unsplash.com/photo-1602143399827-bd95968c07b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 340,
          salesCount: 10000,
          views: 15000,
          tags: ["bottle", "water", "eco", "stainless steel"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        // Beauty
        {
          title: "Organic Vitamin C Face Serum",
          slug: "organic-vitamin-c-serum-1",
          description: "Natural brightening serum with 20% Vitamin C, E and Hyaluronic Acid. Wholesale for skincare clinics and spas.",
          category: "Beauty",
          subCategory: "Skincare",
          brand: "GlowNature",
          price: 18,
          moq: 50,
          stock: 3000,
          images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 156,
          salesCount: 4500,
          views: 12000,
          tags: ["skincare", "serum", "beauty", "organic"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Luxury Matte Lipstick Set",
          slug: "luxury-matte-lipstick-set-1",
          description: "Pack of 12 long-lasting matte lipsticks in trending shades. High pigment and velvet finish.",
          category: "Beauty",
          subCategory: "Makeup",
          brand: "VogueColor",
          price: 45,
          moq: 10,
          stock: 1500,
          images: ["https://images.unsplash.com/photo-1586771107445-d3ca888129ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 89,
          salesCount: 2000,
          views: 6500,
          tags: ["makeup", "lipstick", "beauty", "wholesale"],
          featured: false,
          trending: true,
          bestSeller: false,
        },
        // Health & Medical
        {
          title: "Organic Ceremonial Matcha Tea",
          slug: "organic-ceremonial-matcha-tea-1",
          description: "Premium Japanese ceremonial grade matcha powder, 100% organic and rich in antioxidants for wholesale distribution.",
          category: "Health & Medical",
          subCategory: "Supplements",
          brand: "Zen Tea",
          price: 15,
          moq: 100,
          stock: 5000,
          images: ["https://images.unsplash.com/photo-1582733315331-a941f5359a0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 210,
          salesCount: 8000,
          views: 12000,
          tags: ["matcha", "tea", "organic", "health"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Pro Yoga Mat with Alignment Lines",
          slug: "pro-yoga-mat-1",
          description: "Non-slip eco-friendly TPE yoga mat with alignment lines for perfect posture during practice.",
          category: "Health & Medical",
          subCategory: "Fitness",
          brand: "ZenBody",
          price: 25,
          moq: 20,
          stock: 800,
          images: ["https://images.unsplash.com/photo-1592432676556-28453d078e49?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 85,
          salesCount: 1200,
          views: 4000,
          tags: ["yoga", "mat", "fitness", "health"],
          featured: false,
          trending: false,
          bestSeller: false,
        },
        {
          title: "Digital Infrared Thermometer",
          slug: "digital-infrared-thermometer-1",
          description: "Professional grade non-contact infrared thermometer. Fast and accurate temperature readings.",
          category: "Health & Medical",
          subCategory: "Medical Equipment",
          brand: "MedTech",
          price: 22,
          moq: 100,
          stock: 5000,
          images: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.6,
          reviewCount: 145,
          salesCount: 15000,
          views: 25000,
          tags: ["thermometer", "medical", "health", "safety"],
          featured: true,
          trending: false,
          bestSeller: true,
        },
        // Furniture
        {
          title: "Ergonomic Mesh Office Chair",
          slug: "ergonomic-mesh-office-chair-1",
          description: "Professional grade office chair with lumbar support, adjustable armrests, and breathable mesh fabric for long hours.",
          category: "Furniture",
          subCategory: "Office",
          brand: "ComfortMax",
          price: 120,
          moq: 5,
          stock: 200,
          images: ["https://images.unsplash.com/photo-1505843490701-5be5d0b19d58?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 45,
          salesCount: 300,
          views: 1500,
          tags: ["furniture", "office", "chair"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Modern Velvet Accent Chair",
          slug: "modern-velvet-accent-chair-1",
          description: "Stylish velvet chair with gold-finished legs. Perfect for boutique hotels and modern home interiors.",
          category: "Furniture",
          subCategory: "Living Room",
          brand: "LuxeHome",
          price: 180,
          moq: 2,
          stock: 150,
          images: ["https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 28,
          salesCount: 120,
          views: 2200,
          tags: ["furniture", "chair", "velvet", "modern"],
          featured: true,
          trending: false,
          bestSeller: false,
        },
        // Industrial Machinery
        {
          title: "Electric B2B Forklift Truck",
          slug: "electric-b2b-forklift-truck-1",
          description: "Industrial warehouse forklift featuring clean energy electric propulsion, a 3-ton load capacity, and robust build quality.",
          category: "Industrial Machinery",
          subCategory: "Material Handling",
          brand: "Heli Equip",
          price: 8500,
          moq: 1,
          stock: 45,
          images: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 12,
          salesCount: 18,
          views: 850,
          tags: ["forklift", "warehouse", "machinery", "heavy machinery"],
          featured: true,
          trending: false,
          bestSeller: false,
        },
        {
          title: "CNC Laser Cutting Machine",
          slug: "cnc-laser-cutting-machine-1",
          description: "High precision fiber laser cutting machine for metal sheets. 1500W power with stable performance.",
          category: "Industrial Machinery",
          subCategory: "Metal Processing",
          brand: "PrecisionCut",
          price: 15000,
          moq: 1,
          stock: 10,
          images: ["https://images.unsplash.com/photo-1610444583731-9282ec617882?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 5.0,
          reviewCount: 8,
          salesCount: 5,
          views: 1200,
          tags: ["cnc", "laser", "cutting", "industrial"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        // Construction & Real Estate
        {
          title: "Industrial Grade Concrete Mixer",
          slug: "industrial-grade-concrete-mixer-1",
          description: "Heavy duty portable concrete mixer with 180L capacity, powerful electric motor, and durable steel construction for construction sites.",
          category: "Construction & Real Estate",
          subCategory: "Machinery",
          brand: "BuildStrong",
          price: 450,
          moq: 1,
          stock: 30,
          images: ["https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 15,
          salesCount: 25,
          views: 1200,
          tags: ["construction", "machinery", "concrete", "mixer"],
          featured: true,
          trending: false,
          bestSeller: false,
        },
        {
          title: "Double Glazed Aluminum Windows",
          slug: "double-glazed-aluminum-windows-1",
          description: "Energy efficient double glazed windows with robust aluminum frames. Custom sizes for commercial projects.",
          category: "Construction & Real Estate",
          subCategory: "Building Materials",
          brand: "VisionBuild",
          price: 120,
          moq: 10,
          stock: 500,
          images: ["https://images.unsplash.com/photo-1503708928676-1cb796a0891e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 32,
          salesCount: 450,
          views: 1800,
          tags: ["construction", "windows", "building", "aluminum"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        // Agriculture
        {
          title: "Automatic Poultry Feeding System",
          slug: "automatic-poultry-feeding-system-1",
          description: "Smart automatic feeding and watering system for commercial poultry farms. Reduces labor and waste.",
          category: "Agriculture",
          subCategory: "Animal Husbandry",
          brand: "FarmSmart",
          price: 1200,
          moq: 1,
          stock: 100,
          images: ["https://images.unsplash.com/photo-1516467508483-a7212febe31a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 18,
          salesCount: 45,
          views: 1500,
          tags: ["agriculture", "poultry", "farming", "automation"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        {
          title: "High Yield Organic Tomato Seeds",
          slug: "organic-tomato-seeds-1",
          description: "Bulk packs of F1 hybrid tomato seeds. Disease resistant and high yield for commercial greenhouses.",
          category: "Agriculture",
          subCategory: "Seeds",
          brand: "GrowPlus",
          price: 2,
          moq: 1000,
          stock: 100000,
          images: ["https://images.unsplash.com/photo-1592841200221-a6898f307bac?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 56,
          salesCount: 12000,
          views: 8000,
          tags: ["seeds", "tomato", "agriculture", "organic"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        // Automotive
        {
          title: "Universal LED Headlight Kit",
          slug: "universal-led-headlight-kit-1",
          description: "High brightness 6000K LED headlight conversion kit. Plug and play for 95% of vehicle models.",
          category: "Automotive",
          subCategory: "Auto Parts",
          brand: "AutoBright",
          price: 35,
          moq: 20,
          stock: 2000,
          images: ["https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 124,
          salesCount: 5000,
          views: 9500,
          tags: ["automotive", "led", "headlight", "car parts"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Portable Electric Car Jack",
          slug: "portable-electric-car-jack-1",
          description: "3-ton capacity electric hydraulic jack with impact wrench. Emergency roadside tool kit for wholesalers.",
          category: "Automotive",
          subCategory: "Tools",
          brand: "RoadSafe",
          price: 65,
          moq: 10,
          stock: 800,
          images: ["https://images.unsplash.com/photo-1530046339160-ce3e5b0c7a2f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 45,
          salesCount: 850,
          views: 3200,
          tags: ["automotive", "tools", "car jack", "safety"],
          featured: false,
          trending: false,
          bestSeller: false,
        },
        // Electrical Equipment
        {
          title: "Hybrid Solar Inverter 5kW",
          slug: "hybrid-solar-inverter-5kw-1",
          description: "Advanced hybrid solar inverter with battery storage compatibility. Pure sine wave output for home and commercial use.",
          category: "Electrical Equipment",
          subCategory: "Power Supplies",
          brand: "SolarGrid",
          price: 850,
          moq: 5,
          stock: 200,
          images: ["https://images.unsplash.com/photo-1509391366360-fe5bb60213ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 38,
          salesCount: 150,
          views: 4500,
          tags: ["solar", "inverter", "electrical", "energy"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Industrial Grade Extension Cord",
          slug: "industrial-extension-cord-1",
          description: "Heavy duty 14AWG extension cord, 50ft, outdoor rated. Durable and safe for construction and industrial sites.",
          category: "Electrical Equipment",
          subCategory: "Cables",
          brand: "PowerLink",
          price: 45,
          moq: 50,
          stock: 1500,
          images: ["https://images.unsplash.com/photo-1558484663-90d564993175?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 62,
          salesCount: 2000,
          views: 3800,
          tags: ["electrical", "cable", "extension cord", "industrial"],
          featured: false,
          trending: false,
          bestSeller: true,
        },
        // Jewellery
        {
          title: "18K Gold Plated Necklace",
          slug: "18k-gold-plated-necklace-1",
          description: "High quality 18K gold plated minimalist necklace. Tarnish resistant and hypoallergenic for fashion retail.",
          category: "Jewellery",
          subCategory: "Necklaces",
          brand: "AuraGlow",
          price: 15,
          moq: 30,
          stock: 5000,
          images: ["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 95,
          salesCount: 6500,
          views: 15000,
          tags: ["jewellery", "necklace", "gold", "fashion"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Luxury Watch Box Organizer",
          slug: "luxury-watch-box-organizer-1",
          description: "Premium leather watch box with 12 slots and glass lid. Ideal for jewelry shops and luxury gift retailers.",
          category: "Jewellery",
          subCategory: "Packaging & Display",
          brand: "Timeless",
          price: 25,
          moq: 10,
          stock: 1000,
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 42,
          salesCount: 1200,
          views: 5500,
          tags: ["jewellery", "watch box", "display", "luxury"],
          featured: false,
          trending: true,
          bestSeller: false,
        },
        // Additional Products
        {
          title: "High-Speed Mini Drone with 4K Camera",
          slug: "high-speed-mini-drone-1",
          description: "Compact foldable drone with 4K UHD camera, 30-min flight time, and GPS return-to-home feature.",
          category: "Consumer Electronics",
          subCategory: "Drones",
          brand: "SkyHigh",
          price: 150,
          moq: 5,
          stock: 400,
          images: ["https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 64,
          salesCount: 1100,
          views: 5200,
          tags: ["drone", "camera", "electronics", "gadgets"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        {
          title: "Professional Condenser Microphone Kit",
          slug: "professional-condenser-microphone-1",
          description: "Studio-quality USB condenser microphone with boom arm and pop filter. Perfect for podcasting and streaming.",
          category: "Consumer Electronics",
          subCategory: "Audio",
          brand: "StudioPro",
          price: 85,
          moq: 10,
          stock: 600,
          images: ["https://images.unsplash.com/photo-1590602847861-f357a9332bbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 110,
          salesCount: 2500,
          views: 7000,
          tags: ["microphone", "audio", "studio", "electronics"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Waterproof Winter Down Jacket",
          slug: "waterproof-winter-down-jacket-1",
          description: "Heavy-duty insulated winter jacket with waterproof shell. Rated for -20°C. Available in various sizes.",
          category: "Apparel & Accessories",
          subCategory: "Outerwear",
          brand: "ArcticEdge",
          price: 85,
          moq: 10,
          stock: 800,
          images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 54,
          salesCount: 1500,
          views: 4200,
          tags: ["jacket", "winter", "apparel", "waterproof"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        {
          title: "Premium Leather Business Briefcase",
          slug: "premium-leather-business-briefcase-1",
          description: "Genuine top-grain leather briefcase with laptop compartment and adjustable strap. Elegant design for professionals.",
          category: "Apparel & Accessories",
          subCategory: "Bags",
          brand: "LuxBag",
          price: 120,
          moq: 5,
          stock: 300,
          images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 36,
          salesCount: 450,
          views: 2800,
          tags: ["leather", "bag", "briefcase", "business"],
          featured: false,
          trending: false,
          bestSeller: true,
        },
        {
          title: "Automatic Robotic Vacuum Cleaner",
          slug: "automatic-robotic-vacuum-cleaner-1",
          description: "Smart robot vacuum with LiDAR mapping and mopping function. Controlled via mobile app and voice assistants.",
          category: "Home & Garden",
          subCategory: "Cleaning",
          brand: "CleanBot",
          price: 350,
          moq: 2,
          stock: 150,
          images: ["https://images.unsplash.com/photo-1589151553945-a44e5f617671?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 88,
          salesCount: 600,
          views: 8500,
          tags: ["vacuum", "robot", "cleaning", "home"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        {
          title: "Outdoor Rattan Sofa Set",
          slug: "outdoor-rattan-sofa-set-1",
          description: "Weather-resistant 5-piece rattan sofa set with cushions. Durable and stylish for garden and patio areas.",
          category: "Home & Garden",
          subCategory: "Garden Furniture",
          brand: "PatioPlus",
          price: 650,
          moq: 1,
          stock: 50,
          images: ["https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 22,
          salesCount: 80,
          views: 3500,
          tags: ["garden", "sofa", "furniture", "rattan"],
          featured: false,
          trending: false,
          bestSeller: false,
        },
        {
          title: "Professional 15-Piece Makeup Brush Set",
          slug: "professional-makeup-brush-set-1",
          description: "High-quality synthetic hair brushes with wooden handles. Includes travel case. Perfect for professional makeup artists.",
          category: "Beauty",
          subCategory: "Makeup Tools",
          brand: "BrushMaster",
          price: 25,
          moq: 20,
          stock: 1000,
          images: ["https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 75,
          salesCount: 3000,
          views: 6000,
          tags: ["makeup", "brushes", "beauty", "tools"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Natural Argan Oil Hair Mask",
          slug: "natural-argan-oil-hair-mask-1",
          description: "Deep conditioning treatment with 100% pure Moroccan Argan Oil. Restores shine and manages frizz.",
          category: "Beauty",
          subCategory: "Haircare",
          brand: "PureGlow",
          price: 12,
          moq: 50,
          stock: 2500,
          images: ["https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 130,
          salesCount: 5500,
          views: 9000,
          tags: ["haircare", "mask", "argan oil", "beauty"],
          featured: true,
          trending: false,
          bestSeller: true,
        },
        {
          title: "Adjustable Weight Bench",
          slug: "adjustable-weight-bench-1",
          description: "Foldable multi-purpose weight bench for home and commercial gyms. 600lb weight capacity.",
          category: "Health & Medical",
          subCategory: "Fitness Equipment",
          brand: "IronFit",
          price: 110,
          moq: 5,
          stock: 150,
          images: ["https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 42,
          salesCount: 400,
          views: 3200,
          tags: ["fitness", "gym", "bench", "health"],
          featured: false,
          trending: true,
          bestSeller: false,
        },
        {
          title: "Nordic Minimalist Oak Dining Table",
          slug: "nordic-oak-dining-table-1",
          description: "Solid oak dining table with minimalist Scandinavian design. Seats 6. Durable and timeless piece for home or restaurants.",
          category: "Furniture",
          subCategory: "Dining Room",
          brand: "NordicWood",
          price: 450,
          moq: 2,
          stock: 40,
          images: ["https://images.unsplash.com/photo-1530018607912-eff2df114f11?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 15,
          salesCount: 30,
          views: 2500,
          tags: ["furniture", "table", "oak", "minimalist"],
          featured: true,
          trending: false,
          bestSeller: false,
        },
        {
          title: "Memory Foam Orthopedic Mattress",
          slug: "memory-foam-orthopedic-mattress-1",
          description: "10-inch thick memory foam mattress with cooling gel technology. Medium-firm support for better sleep.",
          category: "Furniture",
          subCategory: "Bedroom",
          brand: "SleepCloud",
          price: 320,
          moq: 5,
          stock: 100,
          images: ["https://images.unsplash.com/photo-1505691938895-1758d7eaa511?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 56,
          salesCount: 200,
          views: 4500,
          tags: ["furniture", "mattress", "sleep", "bedroom"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Hydraulic Metal Shear Machine",
          slug: "hydraulic-metal-shear-1",
          description: "High-capacity hydraulic shear for metal recycling and industrial processing. 300-ton cutting force.",
          category: "Industrial Machinery",
          subCategory: "Metal Processing",
          brand: "IronCut",
          price: 12000,
          moq: 1,
          stock: 5,
          images: ["https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 6,
          salesCount: 3,
          views: 1100,
          tags: ["machinery", "metal", "industrial", "shear"],
          featured: false,
          trending: false,
          bestSeller: false,
        },
        {
          title: "Industrial Air Compressor 500L",
          slug: "industrial-air-compressor-500l-1",
          description: "Stationary piston air compressor for large workshops and industrial applications. 10HP motor.",
          category: "Industrial Machinery",
          subCategory: "Power Tools",
          brand: "AirForce",
          price: 1800,
          moq: 1,
          stock: 15,
          images: ["https://images.unsplash.com/photo-1581092335397-9583ee92d0bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 12,
          salesCount: 20,
          views: 1800,
          tags: ["machinery", "compressor", "industrial", "tools"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        {
          title: "Self-Leveling Multi-Line Laser Level",
          slug: "self-leveling-laser-level-1",
          description: "360-degree green beam laser level for precision construction and interior fit-outs. Rechargeable battery.",
          category: "Construction & Real Estate",
          subCategory: "Tools",
          brand: "PrecisionBuild",
          price: 150,
          moq: 10,
          stock: 400,
          images: ["https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 48,
          salesCount: 1200,
          views: 3200,
          tags: ["construction", "tools", "laser", "level"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Polyurethane Sandwich Wall Panels",
          slug: "pu-sandwich-wall-panels-1",
          description: "Insulated wall panels for cold storage and warehouse construction. High R-value and fire resistant.",
          category: "Construction & Real Estate",
          subCategory: "Building Materials",
          brand: "IsoPanel",
          price: 25,
          moq: 100,
          stock: 10000,
          images: ["https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 14,
          salesCount: 5000,
          views: 2200,
          tags: ["construction", "panels", "insulation", "building"],
          featured: false,
          trending: false,
          bestSeller: false,
        },
        {
          title: "Compact 4-Wheel Farm Tractor",
          slug: "compact-farm-tractor-1",
          description: "50HP versatile tractor for small to medium farms. Supports various attachments like ploughs and mowers.",
          category: "Agriculture",
          subCategory: "Farm Machinery",
          brand: "AgriPower",
          price: 15000,
          moq: 1,
          stock: 20,
          images: ["https://images.unsplash.com/photo-1594411133535-618848d79717?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 10,
          salesCount: 12,
          views: 2800,
          tags: ["tractor", "agriculture", "farming", "machinery"],
          featured: true,
          trending: false,
          bestSeller: false,
        },
        {
          title: "Greenhouse Hydroponic Grow System",
          slug: "hydroponic-grow-system-1",
          description: "Complete NFT hydroponic system for lettuce and herb production. High-density growth with low water usage.",
          category: "Agriculture",
          subCategory: "Greenhouse",
          brand: "HydroGrow",
          price: 450,
          moq: 5,
          stock: 150,
          images: ["https://images.unsplash.com/photo-1558449028-b53a39d100fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 32,
          salesCount: 180,
          views: 4200,
          tags: ["agriculture", "hydroponics", "greenhouse", "farming"],
          featured: false,
          trending: true,
          bestSeller: false,
        },
        {
          title: "OBD2 Bluetooth Diagnostic Scanner",
          slug: "obd2-bluetooth-scanner-1",
          description: "Advanced car code reader with live data and ECU coding support. Compatible with iOS and Android.",
          category: "Automotive",
          subCategory: "Auto Parts",
          brand: "ScanPro",
          price: 25,
          moq: 50,
          stock: 3000,
          images: ["https://images.unsplash.com/photo-1542362567-b05503f3f7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 156,
          salesCount: 8000,
          views: 12000,
          tags: ["automotive", "scanner", "diagnostic", "obd2"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Electric Vehicle (EV) Home Charger",
          slug: "ev-home-charger-1",
          description: "Level 2 EV charging station, 32A, Type 2 connector. Smart charging features via Wi-Fi.",
          category: "Automotive",
          subCategory: "Electric Vehicles",
          brand: "EVLink",
          price: 450,
          moq: 10,
          stock: 500,
          images: ["https://images.unsplash.com/photo-1593941707882-a5bba14938c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 45,
          salesCount: 1200,
          views: 6500,
          tags: ["automotive", "ev", "charger", "electric vehicle"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        {
          title: "Uninterruptible Power Supply (UPS) 2kVA",
          slug: "ups-2kva-1",
          description: "Online double-conversion UPS for server rooms and critical electronics. 2kVA/1.8kW capacity.",
          category: "Electrical Equipment",
          subCategory: "Power Supplies",
          brand: "SafePower",
          price: 280,
          moq: 5,
          stock: 120,
          images: ["https://images.unsplash.com/photo-1558494949-ef010958618e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 22,
          salesCount: 150,
          views: 2800,
          tags: ["electrical", "ups", "power", "electronics"],
          featured: false,
          trending: false,
          bestSeller: false,
        },
        {
          title: "IP68 Industrial Grade Switch",
          slug: "industrial-switch-ip68-1",
          description: "Managed 8-port gigabit industrial switch. Waterproof and extreme temperature resistant.",
          category: "Electrical Equipment",
          subCategory: "Networking",
          brand: "NetInd",
          price: 180,
          moq: 10,
          stock: 400,
          images: ["https://images.unsplash.com/photo-1558484663-90d564993175?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.7,
          reviewCount: 18,
          salesCount: 300,
          views: 3200,
          tags: ["electrical", "networking", "switch", "industrial"],
          featured: true,
          trending: true,
          bestSeller: false,
        },
        {
          title: "Swarovski Crystal Jewelry Set",
          slug: "swarovski-crystal-jewelry-set-1",
          description: "Luxury rhodium plated necklace and earrings set with authentic Swarovski crystals. Gift box included.",
          category: "Jewellery",
          subCategory: "Sets",
          brand: "CrystalLux",
          price: 45,
          moq: 10,
          stock: 1500,
          images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.9,
          reviewCount: 52,
          salesCount: 2500,
          views: 9500,
          tags: ["jewellery", "crystal", "swarovski", "fashion"],
          featured: true,
          trending: true,
          bestSeller: true,
        },
        {
          title: "Custom 925 Sterling Silver Ring",
          slug: "sterling-silver-ring-1",
          description: "Personalized engraved 925 sterling silver bands for weddings and anniversaries. High-polish finish.",
          category: "Jewellery",
          subCategory: "Rings",
          brand: "SilverCraft",
          price: 22,
          moq: 20,
          stock: 4000,
          images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
          supplier: supplier._id,
          rating: 4.8,
          reviewCount: 110,
          salesCount: 5000,
          views: 12000,
          tags: ["jewellery", "ring", "silver", "custom"],
          featured: false,
          trending: true,
          bestSeller: true,
        },
      ];
      
      // Filter out products that might already exist by slug if we want to avoid duplicates
      // For this mock/seed script, we'll just insert if count is low
      await Product.insertMany(products);
    }
    
    // Dynamically seed mock reviews on all products for initial display
    const allProducts = await Product.find({});
    const mockReviews = [
      { userName: "Alex Carter", rating: 5, comment: "High quality materials. Highly recommend this supplier for bulk orders!" },
      { userName: "Sophia Davis", rating: 4, comment: "Great value and prompt communication from the manufacturer." },
      { userName: "Liam Chen", rating: 5, comment: "Exactly as described. Will buy again." }
    ];
    for (const p of allProducts) {
      if (!p.reviews || p.reviews.length === 0) {
        p.reviews = mockReviews.slice(0, Math.floor(Math.random() * 2) + 2); // 2 or 3 reviews
        p.reviewCount = p.reviews.length;
        const totalRating = p.reviews.reduce((sum, r) => sum + r.rating, 0);
        p.rating = Number((totalRating / p.reviews.length).toFixed(1));
        await p.save();
      }
    }
  } catch (err) {
    console.error("Seeding database error:", err);
  }
}
