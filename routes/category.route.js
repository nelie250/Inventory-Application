const { Router } = require("express");
const router = Router();
const categoriesController = require("../controllers/categories.controller");
const dashboardController = require("../controllers/dashboard.controller");
const ensureAuth = require("../middleware/auth");
const requireAdminSecret = require("../middleware/adminSecret");
const pool = require("../db");

router.get("/", async (req, res) => {
  try {
    const { rows: categories } = await pool.query(
      "SELECT id, name, description FROM categories ORDER BY name",
    );
    const { rows: products } = await pool.query(
      "SELECT p.id, p.name, p.sku, p.selling_price, c.name AS category FROM products p LEFT JOIN categories c ON p.category_id = c.id ORDER BY p.created_at DESC, p.id DESC",
    );
    res.render("index", { categories, products });
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});
router.get("/dashboard", dashboardController.getDashboard);
router.get("/categories", categoriesController.list);
router.get("/categories/new", ensureAuth, categoriesController.newForm);
router.post("/categories", ensureAuth, categoriesController.create);
router.get("/categories/:id", categoriesController.view);
router.get("/categories/:id/edit", ensureAuth, categoriesController.editForm);
router.post(
  "/categories/:id",
  ensureAuth,
  requireAdminSecret,
  categoriesController.update,
);
router.post(
  "/categories/:id/delete",
  ensureAuth,
  requireAdminSecret,
  categoriesController.delete,
);

module.exports = router;
