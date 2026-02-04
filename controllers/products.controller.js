const pool = require("../db");

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.id",
    );
    res.render("products", { products: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1",
      [id],
    );
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("product", { product: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.newForm = async (req, res) => {
  try {
    const { rows: categories } = await pool.query(
      "SELECT id, name FROM categories ORDER BY name",
    );
    res.render("productForm", { product: null, categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.create = async (req, res) => {
  try {
    const { sku, name, description, category_id, price, cost } = req.body;
    await pool.query(
      "INSERT INTO products (sku, name, description, category_id, price, cost, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW())",
      [
        sku,
        name,
        description || null,
        category_id || null,
        price || 0,
        cost || 0,
      ],
    );
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: categories } = await pool.query(
      "SELECT id, name FROM categories ORDER BY name",
    );
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("productForm", { product: rows[0], categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, name, description, category_id, price, cost } = req.body;
    await pool.query(
      "UPDATE products SET sku=$1,name=$2,description=$3,category_id=$4,price=$5,cost=$6 WHERE id=$7",
      [
        sku,
        name,
        description || null,
        category_id || null,
        price || 0,
        cost || 0,
        id,
      ],
    );
    res.redirect("/products/" + id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
    res.redirect("/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
