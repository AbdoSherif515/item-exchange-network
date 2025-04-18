
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Service URLs
const ACCOUNT_SERVICE_URL = process.env.ACCOUNT_SERVICE_URL || 'http://account-service:5001';
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-service:5002';
const TRANSACTION_SERVICE_URL = process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:5003';

// Proxy middleware configuration
const accountServiceProxy = createProxyMiddleware({
  target: ACCOUNT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth',
    '^/api/users': '/api/users'
  }
});

const productServiceProxy = createProxyMiddleware({
  target: PRODUCT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/items': '/api/items'
  }
});

const transactionServiceProxy = createProxyMiddleware({
  target: TRANSACTION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/transactions': '/api/transactions'
  }
});

// Routes
app.use('/api/auth', accountServiceProxy);
app.use('/api/users', accountServiceProxy);
app.use('/api/items', productServiceProxy);
app.use('/api/transactions', transactionServiceProxy);

app.get('/', (req, res) => {
  res.send('ItemExchange API Gateway is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
