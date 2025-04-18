
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get all items for marketplace
router.get('/', async (req, res) => {
  try {
    const items = await db.query(`
      SELECT i.*, u.username as seller_name 
      FROM items i 
      JOIN users u ON i.seller_id = u.id 
      WHERE i.is_sold = false
    `);
    
    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single item by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await db.query(`
      SELECT i.*, u.username as seller_name 
      FROM items i 
      JOIN users u ON i.seller_id = u.id 
      WHERE i.id = $1
    `, [id]);
    
    if (item.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new item (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const sellerId = req.user.id;
    
    const newItem = await db.query(
      'INSERT INTO items (name, description, price, seller_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, price, sellerId]
    );
    
    // Get seller name for response
    const seller = await db.query('SELECT username FROM users WHERE id = $1', [sellerId]);
    
    const responseItem = {
      ...newItem.rows[0],
      seller_name: seller.rows[0].username
    };
    
    res.status(201).json(responseItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an item (auth required + must be owner)
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    
    // Check if item exists and user is owner
    const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [id]);
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (itemCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    // Update item
    const updatedItem = await db.query(
      'UPDATE items SET name = $1, description = $2, price = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, description, price, id]
    );
    
    // Get seller name for response
    const seller = await db.query('SELECT username FROM users WHERE id = $1', [req.user.id]);
    
    const responseItem = {
      ...updatedItem.rows[0],
      seller_name: seller.rows[0].username
    };
    
    res.json(responseItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an item (auth required + must be owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if item exists and user is owner
    const itemCheck = await db.query('SELECT * FROM items WHERE id = $1', [id]);
    
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (itemCheck.rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    // Delete item
    await db.query('DELETE FROM items WHERE id = $1', [id]);
    
    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search items
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    
    const items = await db.query(`
      SELECT i.*, u.username as seller_name 
      FROM items i 
      JOIN users u ON i.seller_id = u.id 
      WHERE (i.name ILIKE $1 OR i.description ILIKE $1) AND i.is_sold = false
    `, [`%${query}%`]);
    
    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's items
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate if the requester is the owner or has rights
    if (userId !== req.user.id) {
      // You could add permission check here
    }
    
    const items = await db.query('SELECT * FROM items WHERE seller_id = $1', [userId]);
    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
