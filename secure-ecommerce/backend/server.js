// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const { checkJwt } = require('./middleware/auth');
const { 
  generalLimiter, 
  authLimiter, 
  validateOrder, 
  handleValidationErrors,
  xssProtection,
  hpp
} = require('./middleware/security');

const User = require('./models/User');
const Order = require('./models/Order');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(morgan('combined'));
app.use(compression());
app.use(hpp);
app.use(xssProtection);
app.use(generalLimiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// User profile endpoint
app.get('/api/user/profile', checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    let user = await User.findOne({ auth0Id });
    
    if (!user) {
      // Create user from Auth0 token
      user = new User({
        auth0Id,
        username: req.auth.nickname || req.auth.email || req.auth.name,
        name: req.auth.name || req.auth.nickname || req.auth.email,
        email: req.auth.email,
      });
      await user.save();
    } else {
      user.lastLogin = new Date();
      await user.save();
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/user/profile', checkJwt, [
  require('express-validator').body('contactNumber').optional().isMobilePhone(),
  require('express-validator').body('country').optional().isLength({ min: 2, max: 50 }).trim().escape()
], handleValidationErrors, async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const { contactNumber, country } = req.body;
    
    const user = await User.findOneAndUpdate(
      { auth0Id },
      { contactNumber, country },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create order
app.post('/api/orders', checkJwt, validateOrder, handleValidationErrors, async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const order = new Order({
      ...req.body,
      userId: user._id,
      username: user.username
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user orders
app.get('/api/orders', checkJwt, async (req, res) => {
  try {
    const auth0Id = req.auth.sub;
    const user = await User.findOne({ auth0Id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Orders fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get predefined options
app.get('/api/options', (req, res) => {
  res.json({
    deliveryTimes: ['10 AM', '11 AM', '12 PM'],
    locations: [
      'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
      'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
      'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
      'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
      'Moneragala', 'Ratnapura', 'Kegalle'
    ],
    products: [
      'Laptop', 'Smartphone', 'Tablet', 'Headphones', 'Smart Watch',
      'Gaming Console', 'Camera', 'Monitor', 'Keyboard', 'Mouse'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler - FIXED: Use specific path instead of wildcard
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// HTTPS Server
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production' && fs.existsSync(process.env.SSL_KEY_PATH) && fs.existsSync(process.env.SSL_CERT_PATH)) {
  const options = {
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
  };
  
  https.createServer(options, app).listen(PORT, () => {
    console.log(`Secure server running on https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}