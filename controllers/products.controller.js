const pool = require("../db");

exports.list = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT p.*, c.name AS category, s.name AS supplier, COALESCE(SUM(i.quantity), 0) AS stock FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN suppliers s ON p.supplier_id = s.id LEFT JOIN inventory i ON p.id = i.product_id GROUP BY p.id, c.name, s.name ORDER BY p.created_at DESC, p.id DESC",
    );
    const created = req.query.created === "1";
    const newId = req.query.newId ? Number(req.query.newId) : null;
    const message = created ? "Product added successfully." : null;
    res.render("products", { products: rows, message, newId });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      "SELECT p.*, c.name AS category, s.name AS supplier, COALESCE(SUM(i.quantity), 0) AS stock FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN suppliers s ON p.supplier_id = s.id LEFT JOIN inventory i ON p.id = i.product_id WHERE p.id = $1 GROUP BY p.id, c.name, s.name",
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
    const { rows: suppliers } = await pool.query(
      "SELECT id, name FROM suppliers ORDER BY name",
    );
    res.render("productForm", { product: null, categories, suppliers });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.create = async (req, res) => {
  const {
    sku,
    name,
    description,
    category_id,
    supplier_id,
    unit,
    selling_price,
    cost_price,
    min_stock_level,
  } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO products (sku, name, description, category_id, supplier_id, unit, selling_price, cost_price, min_stock_level, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()) RETURNING id",
      [
        sku,
        name,
        description || null,
        category_id || null,
        supplier_id || null,
        unit || "piece",
        selling_price || 0,
        cost_price || 0,
        min_stock_level || 0,
      ],
    );
    const newId = rows[0]?.id;
    res.redirect(`/products?created=1${newId ? `&newId=${newId}` : ""}`);
  } catch (err) {
    let error = err;
    if (
      err.code === "42703" &&
      (err.column === "description" || /description/i.test(err.message || ""))
    ) {
      try {
        const { rows } = await pool.query(
          "INSERT INTO products (sku, name, category_id, supplier_id, unit, selling_price, cost_price, min_stock_level, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW()) RETURNING id",
          [
            sku,
            name,
            category_id || null,
            supplier_id || null,
            unit || "piece",
            selling_price || 0,
            cost_price || 0,
            min_stock_level || 0,
          ],
        );
        const newId = rows[0]?.id;
        return res.redirect(`/products?created=1${newId ? `&newId=${newId}` : ""}`);
      } catch (retryErr) {
        error = retryErr;
      }
    }
    console.error(error);
    let message = "Database error. Please try again.";
    if (error.code === "23505") {
      message = "SKU already exists. Please use a unique SKU.";
    } else if (error.code === "23514") {
      message = "Invalid unit or pricing. Please check the form values.";
    } else if (error.code === "23503") {
      message = "Invalid category or supplier. Please reselect.";
    }
    try {
      const { rows: categories } = await pool.query(
        "SELECT id, name FROM categories ORDER BY name",
      );
      const { rows: suppliers } = await pool.query(
        "SELECT id, name FROM suppliers ORDER BY name",
      );
      const product = {
        sku,
        name,
        description,
        category_id: category_id || null,
        supplier_id: supplier_id || null,
        unit: unit || "piece",
        selling_price: selling_price || 0,
        cost_price: cost_price || 0,
        min_stock_level: min_stock_level || 0,
      };
      res.status(400).render("productForm", {
        product,
        categories,
        suppliers,
        message,
      });
    } catch (loadErr) {
      console.error(loadErr);
      res.status(500).send("Database error");
    }
  }
};

exports.editForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: categories } = await pool.query(
      "SELECT id, name FROM categories ORDER BY name",
    );
    const { rows: suppliers } = await pool.query(
      "SELECT id, name FROM suppliers ORDER BY name",
    );
    const { rows } = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) return res.status(404).send("Not found");
    res.render("productForm", { product: rows[0], categories, suppliers });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const {
    sku,
    name,
    description,
    category_id,
    supplier_id,
    unit,
    selling_price,
    cost_price,
    min_stock_level,
  } = req.body;
  try {
    await pool.query(
      "UPDATE products SET sku=$1,name=$2,description=$3,category_id=$4,supplier_id=$5,unit=$6,selling_price=$7,cost_price=$8,min_stock_level=$9 WHERE id=$10",
      [
        sku,
        name,
        description || null,
        category_id || null,
        supplier_id || null,
        unit || "piece",
        selling_price || 0,
        cost_price || 0,
        min_stock_level || 0,
        id,
      ],
    );
    res.redirect("/products/" + id);
  } catch (err) {
    if (
      err.code === "42703" &&
      (err.column === "description" || /description/i.test(err.message || ""))
    ) {
      try {
        await pool.query(
          "UPDATE products SET sku=$1,name=$2,category_id=$3,supplier_id=$4,unit=$5,selling_price=$6,cost_price=$7,min_stock_level=$8 WHERE id=$9",
          [
            sku,
            name,
            category_id || null,
            supplier_id || null,
            unit || "piece",
            selling_price || 0,
            cost_price || 0,
            min_stock_level || 0,
            id,
          ],
        );
        return res.redirect("/products/" + id);
      } catch (retryErr) {
        console.error(retryErr);
        return res.status(500).send("Database error");
      }
    }
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
