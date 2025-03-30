import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/auth.js';  // Adjust this path if your user model is named differently

/**
 * Middleware to protect routes
 * Validates JWT token and attaches user to request
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token and catch any verification errors
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        console.log('User not found with ID:', decoded.id);
        res.status(401);
        throw new Error('User not found');
      }
      
      // Check if user is admin based on email (as per your application logic)
      const email = req.user.email;
      const charBeforeAt = email.charAt(email.indexOf('@') - 1);
      req.user.isAdmin = /[a-zA-Z]/.test(charBeforeAt);
      
      // Log successful authentication
      console.log(`User authenticated: ${req.user.name} (${req.user.isAdmin ? 'Admin' : 'User'})`);
      
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    console.log('No Bearer token in Authorization header');
    if (req.headers.authorization) {
      console.log('Authorization header exists but in wrong format:', req.headers.authorization);
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

/**
 * Admin-only middleware
 * Must be used after protect middleware
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized, admin access required');
  }
};

export { protect, adminOnly };