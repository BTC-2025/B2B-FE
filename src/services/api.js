import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

// ── Lightweight in-memory cache (TTL = 60 s) ─────────────
const _cache = {};
function getCached(key) {
  const entry = _cache[key];
  if (entry && Date.now() - entry.ts < 60_000) return entry.data;
  return null;
}
function setCache(key, data) {
  _cache[key] = { data, ts: Date.now() };
}


const getHeaders = () => {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  // Optional personalization tracking header
  const user = localStorage.getItem("user");
  if (user) {
    try {
      headers["x-user-id"] = JSON.parse(user)._id;
    } catch {
      // Ignored
    }
  }
  return headers;
};

// Auth
export const registerUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data;
};

export const loginWithGoogle = async (data) => {
  const res = await axios.post(`${API_URL}/auth/google-login`, data);
  return res.data;
};

export const getUserProfile = async () => {
  const res = await axios.get(`${API_URL}/auth/profile`, {
    headers: getHeaders(),
  });
  return res.data;
};

export const trackUserInterest = async (interestData) => {
  const res = await axios.post(`${API_URL}/auth/interests`, interestData, {
    headers: getHeaders(),
  });
  return res.data;
};

// Products
export const fetchProducts = async (params = {}) => {
  const cacheKey = `products:${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  const res = await axios.get(`${API_URL}/products`, {
    headers: getHeaders(),
    params,
  });
  setCache(cacheKey, res.data);
  return res.data;
};

export const fetchProductById = async (id) => {
  const res = await axios.get(`${API_URL}/products/${id}`, {
    headers: getHeaders(),
  });
  return res.data;
};

export const createProduct = async (productData) => {
  const res = await axios.post(`${API_URL}/products`, productData, {
    headers: getHeaders(),
  });
  return res.data;
};

export const updateProduct = async (id, productData) => {
  const res = await axios.put(`${API_URL}/products/${id}`, productData, {
    headers: getHeaders(),
  });
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await axios.delete(`${API_URL}/products/${id}`, {
    headers: getHeaders(),
  });
  return res.data;
};

export const addProductReview = async (id, reviewData) => {
  const res = await axios.post(`${API_URL}/products/${id}/reviews`, reviewData, {
    headers: getHeaders(),
  });
  return res.data;
};

export const getSearchSuggestions = async (query) => {
  const res = await axios.get(`${API_URL}/products/suggest`, {
    params: { query },
  });
  return res.data;
};

// Recommendations
export const fetchRecommendations = async () => {
  const cached = getCached("recommendations");
  if (cached) return cached;
  const res = await axios.get(`${API_URL}/recommendations`, {
    headers: getHeaders(),
  });
  setCache("recommendations", res.data);
  return res.data;
};

// RFQ
export const postRFQ = async (rfqData) => {
  const res = await axios.post(`${API_URL}/rfq`, rfqData, {
    headers: getHeaders(),
  });
  return res.data;
};

export const fetchRFQs = async (params = {}) => {
  const res = await axios.get(`${API_URL}/rfq`, {
    headers: getHeaders(),
    params,
  });
  return res.data;
};

export const fetchRFQById = async (id) => {
  const res = await axios.get(`${API_URL}/rfq/${id}`, {
    headers: getHeaders(),
  });
  return res.data;
};

export const submitQuotation = async (rfqId, quoteData) => {
  const res = await axios.post(`${API_URL}/rfq/${rfqId}/quote`, quoteData, {
    headers: getHeaders(),
  });
  return res.data;
};

export const updateQuotationStatus = async (rfqId, data) => {
  const res = await axios.put(`${API_URL}/rfq/${rfqId}/quote-status`, data, {
    headers: getHeaders(),
  });
  return res.data;
};

// Chat
export const fetchChatMessages = async (otherUserId) => {
  const res = await axios.get(`${API_URL}/chat/messages/${otherUserId}`, {
    headers: getHeaders(),
  });
  return res.data;
};

export const fetchChatContacts = async () => {
  const res = await axios.get(`${API_URL}/chat/contacts`, {
    headers: getHeaders(),
  });
  return res.data;
};

// Orders
export const createOrder = async (orderData) => {
  const res = await axios.post(`${API_URL}/orders`, orderData, {
    headers: getHeaders(),
  });
  return res.data;
};

export const fetchOrders = async () => {
  const res = await axios.get(`${API_URL}/orders`, {
    headers: getHeaders(),
  });
  return res.data;
};

export const updateOrderStatus = async (id, status) => {
  const res = await axios.put(
    `${API_URL}/orders/${id}`,
    { status },
    { headers: getHeaders() }
  );
  return res.data;
};

export const fetchSellerAnalytics = async () => {
  const res = await axios.get(`${API_URL}/orders/seller/analytics`, {
    headers: getHeaders(),
  });
  return res.data;
};
