import User from "../models/User.js";
import Supplier from "../models/Supplier.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "30d",
  });
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

const normalizeRole = (role) => (role === "SELLER" ? "SELLER" : "BUYER");

const getDisplayName = (name, email) => {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;
  return email.split("@")[0] || "B2B User";
};

const authResponse = (user) => {
  const token = generateToken(user._id);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  };
};

const isDuplicateKeyError = (error) => 
  error?.code === 11000 || error?.code === 11001 || error?.name === "MongoError" && error?.code === 11000;

const ensureSupplierProfile = async (user, companyName, country = "India") => {
  if (user.role !== "SELLER") return;

  try {
    const supplierExists = await Supplier.findOne({ user: user._id });
    if (supplierExists) return;

    await Supplier.create({
      user: user._id,
      companyName: companyName?.trim() || `${user.name}'s Store`,
      country,
      verificationStatus: "VERIFIED",
    });
  } catch (error) {
    console.error(`Error ensuring supplier profile for ${user._id}:`, error.message);
    if (!isDuplicateKeyError(error)) throw error;
  }
};

export const register = async (req, res) => {
  const { name, email, password, role, companyName, country } = req.body;
  const normalizedEmail = normalizeEmail(email || "");
  const displayName = getDisplayName(name, normalizedEmail);
  const normalizedRole = normalizeRole(role);

  console.log(`Registration attempt for: ${normalizedEmail} as ${normalizedRole}`);

  if (!normalizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  try {
    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists. Please sign in." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: displayName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    if (normalizedRole === "SELLER") {
      await ensureSupplierProfile(user, companyName, country || "India");
    }

    console.log(`Successfully registered: ${normalizedEmail}`);
    res.status(201).json(authResponse(user));
  } catch (error) {
    console.error("Registration error:", error);
    if (isDuplicateKeyError(error)) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }
    res.status(500).json({ message: "Registration failed. Please try again later." });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email || "");

  try {
    const user = await User.findOne({ email: normalizedEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json(authResponse(user));
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed. Please try again later." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInterests = async (req, res) => {
  const { category, search, product } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (category && !user.clickedCategories.includes(category)) {
        user.clickedCategories.push(category);
        if (!user.interests.includes(category)) {
          user.interests.push(category);
        }
      }
      if (search && !user.searches.includes(search)) {
        user.searches.push(search);
      }
      if (product && !user.viewedProducts.includes(product)) {
        user.viewedProducts.push(product);
      }

      await user.save();
      res.json({ message: "Interests updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleLogin = async (req, res) => {
  const { email, name, role, companyName } = req.body;
  const normalizedEmail = normalizeEmail(email || "");
  const normalizedRole = normalizeRole(role);
  const displayName = getDisplayName(name, normalizedEmail);

  console.log(`Google Login/Signup attempt for: ${normalizedEmail} as ${normalizedRole}`);

  if (!normalizedEmail) {
    return res.status(400).json({ message: "Google account email is required" });
  }

  try {
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`Creating new user via Google: ${normalizedEmail}`);
      try {
        // Create a new user with Google login.
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(Math.random().toString(36), salt);

        user = await User.create({
          name: displayName,
          email: normalizedEmail,
          password: hashedPassword,
          role: normalizedRole,
        });

        if (normalizedRole === "SELLER") {
          await ensureSupplierProfile(user, companyName);
        }
      } catch (error) {
        if (!isDuplicateKeyError(error)) {
          console.error("Error creating user in googleLogin:", error);
          throw error;
        }
        user = await User.findOne({ email: normalizedEmail });
      }
    }

    if (!user) {
      return res.status(500).json({ message: "Could not complete Google sign-in. Please try again." });
    }

    // If an existing buyer chooses seller signup/login, upgrade the account.
    if (normalizedRole === "SELLER" && user.role === "BUYER") {
      console.log(`Upgrading user ${normalizedEmail} to SELLER`);
      user.role = "SELLER";
      await user.save();
    }

    if (user.role === "SELLER") {
      await ensureSupplierProfile(user, companyName);
    }

    console.log(`Successful Google Login/Signup for: ${normalizedEmail}`);
    res.json(authResponse(user));
  } catch (error) {
    console.error("Google Login error:", error);
    res.status(500).json({ message: error.message || "Google Login failed" });
  }
};
