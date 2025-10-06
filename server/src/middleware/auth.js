const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'is_premium', 'is_verified')
      .where('id', decoded.userId)
      .first();

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requirePremium = (req, res, next) => {
  if (!req.user.is_premium) {
    return res.status(403).json({ 
      message: 'Premium subscription required',
      code: 'PREMIUM_REQUIRED'
    });
  }
  next();
};

const requireAdmin = async (req, res, next) => {
  try {
    const user = await db('users')
      .select('role')
      .where('id', req.user.id)
      .first();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Error checking admin status' });
  }
};

module.exports = {
  authenticateToken,
  requirePremium,
  requireAdmin
};