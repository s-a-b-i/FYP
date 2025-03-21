import jwt from 'jsonwebtoken';

// Verify token middleware
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded._id };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ success: false, msg: 'Token is not valid' });
  }
};

// Authentication middleware
export const isAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store the full decoded user object
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ success: false, msg: 'Authentication failed' });
  }
};

// Admin check middleware
export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ success: false, msg: 'Access denied: Admin privileges required' });
  }
  next();
};