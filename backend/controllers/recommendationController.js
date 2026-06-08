import Product from "../models/Product.js";
import User from "../models/User.js";
import Supplier from "../models/Supplier.js";

export const getRecommendations = async (req, res) => {
  const userId = req.headers["x-user-id"];

  try {
    // 1. Cold Start User or No User ID
    if (!userId) {
      const trending = await Product.find({ trending: true }).limit(5).populate("supplier");
      const bestSellers = await Product.find({ bestSeller: true }).limit(5).populate("supplier");
      const featuredSuppliers = await Supplier.find({ verificationStatus: "VERIFIED" }).limit(5);
      
      return res.json({
        type: "cold-start",
        trending,
        bestSellers,
        featuredSuppliers,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User profile not found" });
    }

    // 2. Logged-in User Personalization
    // A. Content-Based: recommend products matching user's searches & clicked categories
    const clickedCategories = user.clickedCategories || [];
    const searches = user.searches || [];

    let contentQuery = {};
    if (clickedCategories.length > 0) {
      contentQuery.category = { $in: clickedCategories };
    }
    
    // Find up to 10 content-based recommendations
    const contentRecommendations = await Product.find(contentQuery)
      .limit(10)
      .populate("supplier");

    // B. Collaborative Filtering: find products viewed by users with similar interest profiles
    const similarUsers = await User.find({
      _id: { $ne: user._id },
      interests: { $in: user.interests },
    }).limit(5);

    const similarUserProductIds = [];
    similarUsers.forEach((u) => {
      if (u.viewedProducts) {
        u.viewedProducts.forEach((pId) => {
          if (!similarUserProductIds.includes(pId.toString())) {
            similarUserProductIds.push(pId);
          }
        });
      }
    });

    const collaborativeRecommendations = await Product.find({
      _id: { $in: similarUserProductIds, $nin: user.viewedProducts || [] },
    })
      .limit(10)
      .populate("supplier");

    // Combine & return
    res.json({
      type: "personalized",
      contentBased: contentRecommendations,
      collaborative: collaborativeRecommendations,
      interests: user.interests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
