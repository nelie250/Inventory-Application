const pool = require("../db");

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM suppliers ORDER BY name");
    res.render("suppliers", { suppliers: rows });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;
    const supplierResult = await pool.query(
      "SELECT * FROM suppliers WHERE id = $1",
      [id],
    );
    if (supplierResult.rows.length === 0)
      return res.status(404).send("Not found");

    const productsResult = await pool.query(
      "SELECT id, sku, name FROM products WHERE supplier_id = $1 ORDER BY name",
      [id],
    );

    res.render("supplier", {
      supplier: supplierResult.rows[0],
      products: productsResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.newForm = (req, res) => {
  res.render("supplierForm", { supplier: null });
};

exports.create = async (req, res) => {
  try {
    const { name, contact_name, contact_email, phone, address } = req.body;
    await pool.query(
      "INSERT INTO suppliers (name, contact_name, contact_email, phone, address) VALUES ($1, $2, $3, $4, $5)",
      [
        name,
        contact_name || null,
        contact_email || null,
        phone || null,
        address || null,
      ],
    );
    res.redirect("/suppliers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query("SELECT * FROM suppliers WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("supplierForm", { supplier: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact_name, contact_email, phone, address } = req.body;
    await pool.query(
      "UPDATE suppliers SET name=$1, contact_name=$2, contact_email=$3, phone=$4, address=$5 WHERE id=$6",
      [
        name,
        contact_name || null,
        contact_email || null,
        phone || null,
        address || null,
        id,
      ],
    );
    res.redirect("/suppliers/" + id);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM suppliers WHERE id = $1", [id]);
    res.redirect("/suppliers");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};
