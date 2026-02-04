const pool = require("../db");

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY name");
    res.render("categories", { categories: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id],
    );
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("category", { category: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.newForm = (req, res) => {
  res.render("categoryForm", { category: null });
};

exports.create = async (req, res) => {
  try {
    const { name, description } = req.body;
    await pool.query(
      "INSERT INTO categories (name, description) VALUES ($1,$2)",
      [name, description || null],
    );
    res.redirect("/categories");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id],
    );
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("categoryForm", { category: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await pool.query(
      "UPDATE categories SET name=$1,description=$2 WHERE id=$3",
      [name, description || null, id],
    );
    res.redirect("/categories/" + id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: products } = await pool.query(
      "SELECT COUNT(*) AS cnt FROM products WHERE category_id = $1",
      [id],
    );
    if (Number(products[0].cnt) > 0) {
      return res
        .status(400)
        .send(
          "Cannot delete category with products. Reassign or remove products first.",
        );
    }
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    res.redirect("/categories");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

module.exports = exports;
