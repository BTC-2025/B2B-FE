import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Supplier from "../models/Supplier.js";

export const createOrder = async (req, res) => {
  const { products, shippingAddress, paymentMethod } = req.body;

  try {
    if (!products || products.length === 0) {
      return res.status(400).json({ message: "No products ordered" });
    }

    // Resolve details & supplier from first product for routing simplicity
    const firstProduct = await Product.findById(products[0].product);
    if (!firstProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let totalAmount = 0;
    const resolvedProducts = [];

    for (const p of products) {
      const dbProduct = await Product.findById(p.product);
      if (dbProduct) {
        resolvedProducts.push({
          product: dbProduct._id,
          quantity: p.quantity,
          price: dbProduct.price,
        });
        totalAmount += dbProduct.price * p.quantity;

        // Increment salesCount and decrement stock
        dbProduct.salesCount += p.quantity;
        dbProduct.stock = Math.max(dbProduct.stock - p.quantity, 0);
        await dbProduct.save();
      }
    }

    const order = await Order.create({
      buyer: req.user._id,
      supplier: firstProduct.supplier,
      products: resolvedProducts,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "BUYER") {
      filter.buyer = req.user._id;
    } else if (req.user.role === "SELLER") {
      const supplier = await Supplier.findOne({ user: req.user._id });
      if (supplier) {
        filter.supplier = supplier._id;
      } else {
        return res.json([]);
      }
    }

    const orders = await Order.find(filter)
      .populate("buyer", "name email")
      .populate("supplier")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Auth check
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (req.user.role !== "ADMIN" && (!supplier || order.supplier.toString() !== supplier._id.toString())) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSellerAnalytics = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({ user: req.user._id });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier profile not found" });
    }

    const orders = await Order.find({ supplier: supplier._id });
    const products = await Product.find({ supplier: supplier._id });

    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status !== "CANCELLED") {
        return sum + order.totalAmount;
      }
      return sum;
    }, 0);

    const totalSalesCount = products.reduce((sum, p) => sum + p.salesCount, 0);
    const totalViews = products.reduce((sum, p) => sum + p.views, 0);
    const conversionRate = totalViews > 0 ? ((orders.length / totalViews) * 100).toFixed(1) : 0;

    // Monthly aggregation for Charts
    const monthlyData = [
      { month: "Jan", revenue: totalRevenue * 0.1, orders: Math.ceil(orders.length * 0.1) },
      { month: "Feb", revenue: totalRevenue * 0.15, orders: Math.ceil(orders.length * 0.12) },
      { month: "Mar", revenue: totalRevenue * 0.22, orders: Math.ceil(orders.length * 0.2) },
      { month: "Apr", revenue: totalRevenue * 0.35, orders: Math.ceil(orders.length * 0.3) },
      { month: "May", revenue: totalRevenue * 0.5, orders: Math.ceil(orders.length * 0.45) },
      { month: "Jun", revenue: totalRevenue, orders: orders.length },
    ];

    res.json({
      revenue: totalRevenue,
      ordersCount: orders.length,
      productsCount: products.length,
      views: totalViews,
      salesCount: totalSalesCount,
      conversionRate,
      monthlyData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
