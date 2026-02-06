const pool = require("../db");
const getDashboard = async (req, res) => {
  try {
    const categoryCount = await pool.query(
      "SELECT COUNT(*) as count FROM categories",
    );
    const productCount = await pool.query(
      "SELECT COUNT(*) as count FROM products",
    );
    const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
    const orderCount = await pool.query("SELECT COUNT(*) as count FROM orders");

    const lowStockProducts = await pool.query(
      `SELECT p.id, p.name, p.sku, COALESCE(SUM(i.quantity), 0) AS quantity, p.min_stock_level
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       GROUP BY p.id, p.name, p.sku, p.min_stock_level
       HAVING COALESCE(SUM(i.quantity), 0) < COALESCE(p.min_stock_level, 0)
       ORDER BY COALESCE(SUM(i.quantity), 0) ASC
       LIMIT 5`,
    );

    const recentOrders = await pool.query(
      `SELECT o.id, o.status, o.total_amount, o.created_at, u.name 
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`,
    );
    const topProducts = await pool.query(
      `SELECT p.id, p.name, p.sku, COALESCE(SUM(i.quantity), 0) AS quantity, p.selling_price
       FROM products p
       LEFT JOIN inventory i ON p.id = i.product_id
       GROUP BY p.id, p.name, p.sku, p.selling_price
       ORDER BY COALESCE(SUM(i.quantity), 0) DESC
       LIMIT 5`,
    );

    res.render("dashboard", {
      categories: categoryCount.rows[0].count,
      products: productCount.rows[0].count,
      users: userCount.rows[0].count,
      orders: orderCount.rows[0].count,
      lowStockProducts: lowStockProducts.rows,
      recentOrders: recentOrders.rows,
      topProducts: topProducts.rows,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).render("dashboard", {
      error: "Error loading dashboard data",
      categories: 0,
      products: 0,
      users: 0,
      orders: 0,
      lowStockProducts: [],
      recentOrders: [],
      topProducts: [],
    });
  }
};

module.exports = {
  getDashboard,
};
