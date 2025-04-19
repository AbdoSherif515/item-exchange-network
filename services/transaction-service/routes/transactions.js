
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../config/db');

// Get user's purchases
router.get('/purchases', auth, async (req, res) => {
  try {
    const transfers = await db.query(`
      SELECT pt.*, p.name, p.price, a.email as seller_email
      FROM PRODUCT_TRANSFER pt 
      JOIN PRODUCT p ON pt.product_id = p.product_id
      JOIN ACCOUNT a ON p.creator_id = a.account_id
      WHERE pt.buyer_id = $1 
      ORDER BY pt.date_time DESC
    `, [req.user.id]);
    
    res.json(transfers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's sales
router.get('/sales', auth, async (req, res) => {
  try {
    const sales = await db.query(`
      SELECT pt.*, p.name, p.price, a.email as buyer_email
      FROM PRODUCT_TRANSFER pt 
      JOIN PRODUCT p ON pt.product_id = p.product_id
      JOIN ACCOUNT a ON pt.buyer_id = a.account_id
      WHERE p.creator_id = $1 
      ORDER BY pt.date_time DESC
    `, [req.user.id]);
    
    res.json(sales.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Purchase a product
router.post('/purchase/:id', auth, async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const buyerId = req.user.id;
    
    // Get the product with creator info
    const productResult = await client.query(`
      SELECT p.*, a.balance as creator_balance 
      FROM PRODUCT p 
      JOIN ACCOUNT a ON p.creator_id = a.account_id 
      WHERE p.product_id = $1 AND p.on_sale = true
    `, [id]);
    
    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Product not found or not for sale' });
    }
    
    const product = productResult.rows[0];
    
    // Check if buyer is not the creator
    if (product.creator_id === buyerId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cannot buy your own product' });
    }
    
    // Get buyer's balance
    const buyerResult = await client.query(
      'SELECT balance FROM ACCOUNT WHERE account_id = $1',
      [buyerId]
    );
    
    // Check if buyer has enough balance
    if (buyerResult.rows[0].balance < product.price) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    
    // Update product to not for sale
    await client.query(
      'UPDATE PRODUCT SET on_sale = false WHERE product_id = $1',
      [id]
    );
    
    // Create transfer record
    await client.query(
      'INSERT INTO PRODUCT_TRANSFER (buyer_id, product_id) VALUES ($1, $2)',
      [buyerId, id]
    );
    
    // Deduct from buyer's balance
    await client.query(
      'UPDATE ACCOUNT SET balance = balance - $1 WHERE account_id = $2',
      [product.price, buyerId]
    );
    
    // Add to creator's balance
    await client.query(
      'UPDATE ACCOUNT SET balance = balance + $1 WHERE account_id = $2',
      [product.price, product.creator_id]
    );
    
    // Record money transactions
    await client.query(
      'INSERT INTO MONEY_TRANSACTION (account_id, amount) VALUES ($1, $2), ($3, $4)',
      [buyerId, -product.price, product.creator_id, product.price]
    );
    
    await client.query('COMMIT');
    
    res.status(201).json({
      message: 'Purchase successful',
      productId: id,
      price: product.price
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  } finally {
    client.release();
  }
});

// Get transaction history
router.get('/history', auth, async (req, res) => {
  try {
    const transactions = await db.query(`
      SELECT mt.*, a.email
      FROM MONEY_TRANSACTION mt
      JOIN ACCOUNT a ON mt.account_id = a.account_id
      WHERE mt.account_id = $1
      ORDER BY mt.timestamp DESC
    `, [req.user.id]);
    
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
