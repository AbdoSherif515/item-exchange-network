
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get all user's purchases
router.get('/purchases', auth, async (req, res) => {
  try {
    const transactions = await db.query(`
      SELECT t.*, i.name as item_name, u.username as seller_name 
      FROM transactions t 
      JOIN items i ON t.item_id = i.id 
      JOIN users u ON t.seller_id = u.id 
      WHERE t.buyer_id = $1 
      ORDER BY t.created_at DESC
    `, [req.user.id]);
    
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all user's sales
router.get('/sales', auth, async (req, res) => {
  try {
    const transactions = await db.query(`
      SELECT t.*, i.name as item_name, u.username as buyer_name 
      FROM transactions t 
      JOIN items i ON t.item_id = i.id 
      JOIN users u ON t.buyer_id = u.id 
      WHERE t.seller_id = $1 
      ORDER BY t.created_at DESC
    `, [req.user.id]);
    
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Purchase an item
router.post('/purchase/:id', auth, async (req, res) => {
  // Start transaction
  const client = await db.query('BEGIN');
  
  try {
    const { id } = req.params;
    const buyerId = req.user.id;
    
    // Get the item with seller info
    const itemResult = await client.query(`
      SELECT i.*, u.balance as seller_balance 
      FROM items i 
      JOIN users u ON i.seller_id = u.id 
      WHERE i.id = $1 AND i.is_sold = false
    `, [id]);
    
    if (itemResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Item not found or already sold' });
    }
    
    const item = itemResult.rows[0];
    
    // Check if buyer is not the seller
    if (item.seller_id === buyerId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'You cannot buy your own item' });
    }
    
    // Get buyer's balance
    const buyerResult = await client.query('SELECT balance FROM users WHERE id = $1', [buyerId]);
    const buyerBalance = buyerResult.rows[0].balance;
    
    // Check if buyer has enough balance
    if (buyerBalance < item.price) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    
    // Update item to sold
    await client.query('UPDATE items SET is_sold = true WHERE id = $1', [id]);
    
    // Deduct from buyer's balance
    await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [item.price, buyerId]);
    
    // Add to seller's balance
    await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [item.price, item.seller_id]);
    
    // Create transaction record
    const transactionResult = await client.query(
      'INSERT INTO transactions (item_id, seller_id, buyer_id, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, item.seller_id, buyerId, item.price]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Purchase successful',
      transaction: transactionResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transaction reports
router.get('/reports', auth, async (req, res) => {
  try {
    // Get summary of user's transactions
    const summary = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM transactions WHERE buyer_id = $1) as total_purchases,
        (SELECT COALESCE(SUM(price), 0) FROM transactions WHERE buyer_id = $1) as total_spent,
        (SELECT COUNT(*) FROM transactions WHERE seller_id = $1) as total_sales,
        (SELECT COALESCE(SUM(price), 0) FROM transactions WHERE seller_id = $1) as total_earned
    `, [req.user.id]);
    
    // Get recent transactions
    const recentTransactions = await db.query(`
      (SELECT t.id, t.created_at, i.name as item_name, t.price, 'purchase' as type, u.username as other_party
       FROM transactions t 
       JOIN items i ON t.item_id = i.id 
       JOIN users u ON t.seller_id = u.id
       WHERE t.buyer_id = $1
       ORDER BY t.created_at DESC
       LIMIT 5)
      UNION
      (SELECT t.id, t.created_at, i.name as item_name, t.price, 'sale' as type, u.username as other_party
       FROM transactions t 
       JOIN items i ON t.item_id = i.id 
       JOIN users u ON t.buyer_id = u.id
       WHERE t.seller_id = $1
       ORDER BY t.created_at DESC
       LIMIT 5)
      ORDER BY created_at DESC
      LIMIT 10
    `, [req.user.id]);
    
    res.json({
      summary: summary.rows[0],
      recentTransactions: recentTransactions.rows
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
