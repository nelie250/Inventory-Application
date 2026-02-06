const pool = require("../db");

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT t.*, p.name AS product_name, p.sku, u.name AS user_name FROM stock_transactions t LEFT JOIN products p ON t.product_id = p.id LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC",
    );
    res.render("stockTransactions", { transactions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT t.*, p.name AS product_name, p.sku, u.name AS user_name FROM stock_transactions t LEFT JOIN products p ON t.product_id = p.id LEFT JOIN users u ON t.user_id = u.id WHERE t.id = $1",
      [id],
    );
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("stockTransaction", { transaction: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.newForm = async (req, res) => {
  try {
    const { rows: products } = await pool.query(
      "SELECT id, name, sku FROM products ORDER BY name",
    );
    const { rows: users } = await pool.query(
      "SELECT id, name FROM users ORDER BY name",
    );
    res.render("stockTransactionForm", { transaction: null, products, users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.create = async (req, res) => {
  const client = await pool.connect();
  try {
    const { product_id, user_id, location, quantity_change, reason } = req.body;
    await client.query("BEGIN");

    await client.query(
      "INSERT INTO stock_transactions (product_id, user_id, location, quantity_change, reason) VALUES ($1, $2, $3, $4, $5)",
      [
        product_id || null,
        user_id || null,
        location || null,
        Number(quantity_change || 0),
        reason || null,
      ],
    );

    if (product_id && location) {
      const existing = await client.query(
        "SELECT id, quantity FROM inventory WHERE product_id = $1 AND location = $2",
        [product_id, location],
      );

      if (existing.rows.length > 0) {
        await client.query(
          "UPDATE inventory SET quantity = $1, updated_at = NOW() WHERE id = $2",
          [
            Number(existing.rows[0].quantity) + Number(quantity_change || 0),
            existing.rows[0].id,
          ],
        );
      } else {
        await client.query(
          "INSERT INTO inventory (product_id, location, quantity, reorder_level) VALUES ($1, $2, $3, $4)",
          [product_id, location, Number(quantity_change || 0), 0],
        );
      }
    }

    await client.query("COMMIT");
    res.redirect("/stock-transactions");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    client.release();
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM stock_transactions WHERE id = $1", [id]);
    res.redirect("/stock-transactions");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
