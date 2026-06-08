import {
  FaLaptop,
  FaTshirt,
  FaHome,
  FaMagic,
  FaGem,
  FaIndustry,
  FaWrench,
  FaPlug,
  FaMedkit,
  FaSeedling,
  FaBuilding,
  FaChair,
} from "react-icons/fa";

export const categories = [
  {
    id: 1,
    name: "Consumer Electronics",
    slug: "consumer-electronics",

    // ✅ BASIC DISPLAY DATA
    icon: <FaLaptop />,
    image: "/images/electronics.jpg",
    banner: "/images/electronics-banner.jpg",

    // =========================
    // 🟢 1. UI DISPLAY SECTION
    // =========================
    rating: 4.8,
    reviewCount: 1542,
    featuredProducts: [1, 2, 3, 4],
    newArrivals: true,
    bestSeller: true,

    // =========================
    // 🟡 2. SEARCH & SEO SECTION
    // =========================
    topSearchKeywords: ["smartphones", "laptops", "gaming monitors"],

    seo: {
      metaTitle: "Consumer Electronics Wholesale Suppliers",
      metaDescription:
        "Find verified electronics suppliers and manufacturers worldwide.",
    },

    // =========================
    // 🔵 3. ANALYTICS SECTION
    // =========================
    analytics: {
      monthlyViews: 125000,
      monthlyOrders: 4200,
    },

    // =========================
    // 🟣 4. BUSINESS RULES
    // =========================
    subscriptionRequired: false,
    rfqEnabled: true,
    chatEnabled: true,
    wishlistEnabled: true,
    compareEnabled: true,

    // =========================
    // 🟠 5. MONETIZATION / ADS
    // =========================
    advertisementSlots: [
      {
        title: "Featured Supplier Banner",
        image: "/ads/electronics-ad.jpg",
      },
    ],

    // =========================
    // 🟤 6. SUPPORT INFO
    // =========================
    faqs: [
      {
        question: "What is the MOQ?",
        answer: "MOQ starts from 10 units.",
      },
    ],

    // =========================
    // ⚫ 7. LOGISTICS
    // =========================
    shippingOptions: ["Air Freight", "Sea Freight", "Express Delivery"],

    paymentMethods: ["UPI", "Credit Card", "Bank Transfer", "PayPal"],

    languagesSupported: ["English", "Hindi", "Chinese"],

    description:
      "Source smartphones, laptops, cameras, accessories and electronic devices from verified suppliers worldwide.",

    productCount: 15420,
    supplierCount: 1280,

    trending: true,
    featured: true,
    isActive: true,

    minimumMOQ: 10,

    popularBrands: [
      "Samsung",
      "Apple",
      "Dell",
      "HP",
      "Lenovo",
    ],

    countries: [
      "India",
      "China",
      "USA",
      "Germany",
      "Japan",
    ],

    certifications: [
      "ISO 9001",
      "CE",
      "RoHS",
    ],

    featuredSuppliers: [
      "Tech World Pvt Ltd",
      "Electro Solutions",
      "Smart Devices Ltd",
    ],

    filters: [
      "Brand",
      "Price",
      "MOQ",
      "Country",
      "Supplier Rating",
      "Availability",
    ],

    deals: [
      {
        title: "10% Off Bulk Orders",
        discount: "10%",
      },
    ],

    recommendedFor: [
      "Retailers",
      "Wholesalers",
      "Importers",
    ],

    relatedCategories: [
      "Electrical Equipment & Supplies",
      "Industrial Machinery",
    ],

    subCategories: [
      {
        name: "Mobiles",
        slug: "mobiles",
        image: "/images/subcategories/mobiles.jpg",
        productCount: 3200,
      },
      {
        name: "Laptops",
        slug: "laptops",
        image: "/images/subcategories/laptops.jpg",
        productCount: 2400,
      },
      {
        name: "CPUs & Processors",
        slug: "cpus-processors",
        image: "/images/subcategories/cpu.jpg",
        productCount: 900,
      },
      {
        name: "Monitors",
        slug: "monitors",
        image: "/images/subcategories/monitor.jpg",
        productCount: 1100,
      },
      {
        name: "Cameras",
        slug: "cameras",
        image: "/images/subcategories/camera.jpg",
        productCount: 800,
      },
      {
        name: "Accessories",
        slug: "accessories",
        image: "/images/subcategories/accessories.jpg",
        productCount: 2500,
      },
    ],
  },

  {
    id: 2,
    name: "Apparel & Accessories",
    slug: "apparel-accessories",

    icon: <FaTshirt />,

    image: "/images/categories/fashion.jpg",
    banner: "/images/banners/fashion-banner.jpg",

    description:
      "Find clothing, footwear and fashion accessories from manufacturers and exporters.",

    productCount: 21500,
    supplierCount: 1800,

    trending: true,
    featured: false,
    isActive: true,

    minimumMOQ: 50,

    popularBrands: [
      "Nike",
      "Adidas",
      "Puma",
      "Levis",
    ],

    countries: [
      "India",
      "China",
      "Bangladesh",
      "Vietnam",
    ],

    certifications: [
      "ISO 9001",
      "OEKO-TEX",
    ],

    filters: [
      "Size",
      "Color",
      "Price",
      "MOQ",
      "Country",
    ],

    subCategories: [
      {
        name: "Men Clothing",
        slug: "men-clothing",
        image: "/images/subcategories/men.jpg",
      },
      {
        name: "Women Clothing",
        slug: "women-clothing",
        image: "/images/subcategories/women.jpg",
      },
      {
        name: "Kids Wear",
        slug: "kids-wear",
        image: "/images/subcategories/kids.jpg",
      },
      {
        name: "Footwear",
        slug: "footwear",
        image: "/images/subcategories/footwear.jpg",
      },
      {
        name: "Fashion Accessories",
        slug: "fashion-accessories",
        image: "/images/subcategories/accessories.jpg",
      },
    ],
  },

  {
    id: 3,
    name: "Home & Garden",
    slug: "home-garden",
    icon: <FaHome />,
    description: "Source home decor, gardening tools, kitchenware and household items from verified manufacturers.",
    subCategories: [
      { name: "Kitchen & Tabletop", slug: "kitchen-tabletop" },
      { name: "Home Decor", slug: "home-decor" },
      { name: "Garden Supplies", slug: "garden-supplies" },
      { name: "Pet Supplies", slug: "pet-supplies" },
      { name: "Household Cleaning", slug: "cleaning" },
    ],
  },

  {
    id: 4,
    name: "Beauty",
    slug: "beauty",
    icon: <FaMagic />,
    description: "Premium beauty products, skincare, makeup, and professional salon equipment.",
    subCategories: [
      { name: "Skincare", slug: "skincare" },
      { name: "Makeup", slug: "makeup" },
      { name: "Hair Care", slug: "hair-care" },
      { name: "Salon Equipment", slug: "salon-equipment" },
      { name: "Fragrances", slug: "fragrances" },
    ],
  },

  {
    id: 5,
    name: "Jewellery, Eyewear & Watches",
    slug: "jewellery-eyewear-watches",
    icon: <FaGem />,
    description: "Luxury watches, fine jewellery, fashion eyewear and accessories from top craftsmen.",
    subCategories: [
      { name: "Fine Jewellery", slug: "fine-jewellery" },
      { name: "Wristwatches", slug: "wristwatches" },
      { name: "Fashion Eyewear", slug: "eyewear" },
      { name: "Loose Gemstones", slug: "gemstones" },
      { name: "Jewellery Packaging", slug: "packaging" },
    ],
  },

  {
    id: 6,
    name: "Industrial Machinery",
    slug: "industrial-machinery",
    icon: <FaIndustry />,
    description: "Heavy machinery, industrial tools, and manufacturing equipment for various sectors.",
    subCategories: [
      { name: "Metalworking Machinery", slug: "metalworking" },
      { name: "Plastic & Rubber Machinery", slug: "plastic-rubber" },
      { name: "Woodworking Machinery", slug: "woodworking" },
      { name: "Food & Beverage Machinery", slug: "food-bev-machinery" },
      { name: "Packing Machinery", slug: "packing" },
    ],
  },

  {
    id: 7,
    name: "Automotive Supplies & Tools",
    slug: "automotive-supplies-tools",
    icon: <FaWrench />,
    description: "Vehicle parts, diagnostic tools, car care products and automotive accessories.",
    subCategories: [
      { name: "Car Parts & Accessories", slug: "car-parts" },
      { name: "Diagnostic Tools", slug: "diagnostics" },
      { name: "Car Care & Cleaning", slug: "car-care" },
      { name: "Motorcycle Parts", slug: "motorcycle-parts" },
      { name: "Workshop Equipment", slug: "workshop" },
    ],
  },

  {
    id: 8,
    name: "Electrical Equipment & Supplies",
    slug: "electrical-equipment-supplies",
    icon: <FaPlug />,
    description: "Cables, switches, power distribution and professional electrical components.",
    subCategories: [
      { name: "Solar Energy Products", slug: "solar" },
      { name: "Cables & Wires", slug: "cables" },
      { name: "Power Distribution", slug: "power" },
      { name: "Lighting & Fixtures", slug: "lighting" },
      { name: "Circuit Breakers", slug: "breakers" },
    ],
  },

  {
    id: 9,
    name: "Health & Medical",
    slug: "health-medical",
    icon: <FaMedkit />,
    description: "Medical devices, clinical supplies, hospital furniture and healthcare technology.",
    subCategories: [
      { name: "Medical Devices", slug: "medical-devices" },
      { name: "Clinical Supplies", slug: "clinical" },
      { name: "Health Care Products", slug: "healthcare" },
      { name: "Laboratory Equipment", slug: "lab" },
      { name: "Dental Equipment", slug: "dental" },
    ],
  },

  {
    id: 10,
    name: "Agriculture, Food & Beverage",
    slug: "agriculture-food-beverage",
    icon: <FaSeedling />,
    description: "Agricultural machinery, organic food items, and bulk beverage supplies.",
    subCategories: [
      { name: "Agriculture Machinery", slug: "agri-machinery" },
      { name: "Bulk Food Items", slug: "bulk-food" },
      { name: "Organic Produce", slug: "organic" },
      { name: "Beverage Supplies", slug: "beverages" },
      { name: "Livestock Supplies", slug: "livestock" },
    ],
  },

  {
    id: 11,
    name: "Construction & Real Estate",
    slug: "construction-real-estate",
    icon: <FaBuilding />,
    description: "Construction materials, heavy earthmoving equipment and real estate services.",
    subCategories: [
      { name: "Building Materials", slug: "materials" },
      { name: "Earthmoving Machinery", slug: "earthmoving" },
      { name: "Real Estate Services", slug: "real-estate" },
      { name: "Safety & Security", slug: "safety" },
      { name: "Timber & Flooring", slug: "timber" },
    ],
  },

  {
    id: 12,
    name: "Furniture",
    slug: "furniture",
    icon: <FaChair />,
    description: "Office furniture, home decor, commercial seating and modular furniture designs.",
    subCategories: [
      { name: "Office Furniture", slug: "office-furniture" },
      { name: "Home Furniture", slug: "home-furniture" },
      { name: "Commercial Seating", slug: "commercial-seating" },
      { name: "Outdoor Furniture", slug: "outdoor-furniture" },
      { name: "Modular Units", slug: "modular" },
    ],
  },
];

export const majorCategories = [
  "Consumer Electronics",
  "Apparel & Accessories",
  "Home & Garden",
  "Beauty",
  "Jewellery, Eyewear & Watches",
  "Industrial Machinery",
  "Automotive Supplies & Tools",
  "Electrical Equipment & Supplies",
  "Health & Medical",
  "Agriculture, Food & Beverage",
  "Construction & Real Estate",
  "Furniture",
];

export const categoryMap = categories.reduce((acc, cat) => {
  if (cat.subCategories) {
    acc[cat.name] = cat.subCategories.map(sub => sub.name);
  }
  return acc;
}, {});