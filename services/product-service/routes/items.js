
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get all available products
router.get('/', async (req, res) => {
  try {
    const products = await db.query(`
      SELECT p.*, a.email as creator_email 
      FROM PRODUCT p 
      JOIN ACCOUNT a ON p.creator_id = a.account_id 
      WHERE p.on_sale = true
    `);
    
    res.json(products.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await db.query(`
      SELECT p.*, a.email as creator_email 
      FROM PRODUCT p 
      JOIN ACCOUNT a ON p.creator_id = a.account_id 
      WHERE p.product_id = $1
    `, [id]);
    
    if (product.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new product
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const creatorId = req.user.id;
    
    const newProduct = await db.query(
      'INSERT INTO PRODUCT (name, description, price, on_sale, creator_id) VALUES ($1, $2, $3, true, $4) RETURNING *',
      [name, description, price, creatorId]
    );
    
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, on_sale } = req.body;
    
    // Check if product exists and user is creator
    const productCheck = await db.query(
      'SELECT * FROM PRODUCT WHERE product_id = $1',
      [id]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (productCheck.rows[0].creator_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedProduct = await db.query(
      'UPDATE PRODUCT SET name = $1, description = $2, price = $3, on_sale = $4 WHERE product_id = $5 RETURNING *',
      [name, description, price, on_sale, id]
    );
    
    res.json(updatedProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's products
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const products = await db.query(
      'SELECT * FROM PRODUCT WHERE creator_id = $1',
      [userId]
    );
    
    res.json(products.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
