const pool = require("../db");

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT i.*, p.name AS product_name, p.sku, p.unit FROM inventory i JOIN products p ON i.product_id = p.id ORDER BY p.name, i.location",
    );
    res.render("inventory", { inventory: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT i.*, p.name AS product_name, p.sku, p.unit FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.id = $1",
      [id],
    );
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("inventoryItem", { item: rows[0] });
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
    res.render("inventoryForm", { item: null, products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.create = async (req, res) => {
  try {
    const { product_id, location, quantity, reorder_level } = req.body;
    await pool.query(
      "INSERT INTO inventory (product_id, location, quantity, reorder_level) VALUES ($1, $2, $3, $4)",
      [product_id, location, quantity || 0, reorder_level || 0],
    );
    res.redirect("/inventory");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: products } = await pool.query(
      "SELECT id, name, sku FROM products ORDER BY name",
    );
    const { rows } = await pool.query("SELECT * FROM inventory WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("inventoryForm", { item: rows[0], products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, location, quantity, reorder_level } = req.body;
    await pool.query(
      "UPDATE inventory SET product_id=$1, location=$2, quantity=$3, reorder_level=$4, updated_at=NOW() WHERE id=$5",
      [product_id, location, quantity || 0, reorder_level || 0, id],
    );
    res.redirect("/inventory/" + id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM inventory WHERE id = $1", [id]);
    res.redirect("/inventory");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
