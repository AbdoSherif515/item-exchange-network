
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db.query(
      'SELECT account_id, email, balance FROM ACCOUNT WHERE account_id = $1',
      [req.user.id]
    );
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deposit cash to user account
router.post('/deposit', auth, async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { amount } = req.body;
    const userId = req.user.id;
    
    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid deposit amount' });
    }
    
    // Update user balance
    const updatedUser = await client.query(
      'UPDATE ACCOUNT SET balance = balance + $1 WHERE account_id = $2 RETURNING account_id, email, balance',
      [amount, userId]
    );
    
    // Record the transaction
    await client.query(
      'INSERT INTO MONEY_TRANSACTION (account_id, amount) VALUES ($1, $2)',
      [userId, amount]
    );
    
    await client.query('COMMIT');
    
    res.json(updatedUser.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
