const pool = require("../db");

function normalizeItems(body) {
  const productIds = Array.isArray(body.product_id)
    ? body.product_id
    : [body.product_id];
  const quantities = Array.isArray(body.quantity)
    ? body.quantity
    : [body.quantity];
  const prices = Array.isArray(body.unit_price)
    ? body.unit_price
    : [body.unit_price];

  return productIds
    .map((productId, index) => ({
      productId,
      quantity: Number(quantities[index] || 0),
      unitPrice: Number(prices[index] || 0),
    }))
    .filter((item) => item.productId && item.quantity > 0);
}

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT o.*, u.name AS user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC",
    );
    res.render("orders", { orders: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      "SELECT o.*, u.name AS user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = $1",
      [id],
    );
    if (orderResult.rows.length === 0) return res.status(404).send("Not found");

    const itemsResult = await pool.query(
      "SELECT oi.*, p.name AS product_name, p.sku FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1",
      [id],
    );

    res.render("order", {
      order: orderResult.rows[0],
      items: itemsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.newForm = async (req, res) => {
  try {
    const { rows: users } = await pool.query(
      "SELECT id, name, email FROM users ORDER BY name",
    );
    const { rows: products } = await pool.query(
      "SELECT id, name, sku, selling_price FROM products ORDER BY name",
    );
    res.render("orderForm", { order: null, items: [], users, products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.create = async (req, res) => {
  const client = await pool.connect();
  try {
    const { user_id, status } = req.body;
    const items = normalizeItems(req.body);

    await client.query("BEGIN");
    const orderResult = await client.query(
      "INSERT INTO orders (user_id, status, total_amount) VALUES ($1, $2, $3) RETURNING id",
      [user_id || null, status || "pending", 0],
    );

    const orderId = orderResult.rows[0].id;
    let total = 0;

    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice;
      total += lineTotal;
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [orderId, item.productId, item.quantity, item.unitPrice],
      );
    }

    await client.query("UPDATE orders SET total_amount = $1 WHERE id = $2", [
      total,
      orderId,
    ]);

    await client.query("COMMIT");
    res.redirect("/orders/" + orderId);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).send("Database error");
  } finally {
    client.release();
  }
};

exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [
      id,
    ]);
    if (orderResult.rows.length === 0) return res.status(404).send("Not found");

    const { rows: items } = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [id],
    );
    const { rows: users } = await pool.query(
      "SELECT id, name, email FROM users ORDER BY name",
    );
    const { rows: products } = await pool.query(
      "SELECT id, name, sku, selling_price FROM products ORDER BY name",
    );

    res.render("orderForm", {
      order: orderResult.rows[0],
      items,
      users,
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.update = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { user_id, status } = req.body;
    const items = normalizeItems(req.body);

    await client.query("BEGIN");
    await client.query("UPDATE orders SET user_id=$1, status=$2 WHERE id=$3", [
      user_id || null,
      status || "pending",
      id,
    ]);

    await client.query("DELETE FROM order_items WHERE order_id = $1", [id]);

    let total = 0;
    for (const item of items) {
      const lineTotal = item.quantity * item.unitPrice;
      total += lineTotal;
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [id, item.productId, item.quantity, item.unitPrice],
      );
    }

    await client.query("UPDATE orders SET total_amount = $1 WHERE id = $2", [
      total,
      id,
    ]);

    await client.query("COMMIT");
    res.redirect("/orders/" + id);
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
    await pool.query("DELETE FROM orders WHERE id = $1", [id]);
    res.redirect("/orders");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
