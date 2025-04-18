
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db.query('SELECT id, username, email, balance FROM users WHERE id = $1', [req.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's items
router.get('/items', auth, async (req, res) => {
  try {
    // This will be handled by the Product Service
    // We'll proxy this request to the Product Service
    res.status(501).json({ message: 'This endpoint is now handled by the Product Service' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deposit cash to user account
router.post('/deposit', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }
    
    // Update user balance
    const updatedUser = await db.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2 RETURNING id, username, email, balance',
      [amount, userId]
    );
    
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
