const { Router } = require("express");
const router = Router();
const categoriesController = require("../controllers/categories.controller");
const dashboardController = require("../controllers/dashboard.controller");
const ensureAuth = require("../middleware/auth");

router.get("/", (req, res) => res.render("index"));
router.get("/dashboard", dashboardController.getDashboard);
router.get("/categories", categoriesController.list);
router.get("/categories/new", ensureAuth, categoriesController.newForm);
router.post("/categories", ensureAuth, categoriesController.create);
router.get("/categories/:id", categoriesController.view);
router.get("/categories/:id/edit", ensureAuth, categoriesController.editForm);
router.post("/categories/:id", ensureAuth, categoriesController.update);
router.post("/categories/:id/delete", ensureAuth, categoriesController.delete);

module.exports = router;
