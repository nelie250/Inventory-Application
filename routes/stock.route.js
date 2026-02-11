const { Router } = require("express");
const router = Router();
const stockController = require("../controllers/stock.controller");
const ensureAuth = require("../middleware/auth");
const requireAdminSecret = require("../middleware/adminSecret");

router.get("/", stockController.list);
router.get("/new", ensureAuth, stockController.newForm);
router.post("/", ensureAuth, stockController.create);
router.get("/:id", stockController.view);
router.post(
  "/:id/delete",
  ensureAuth,
  requireAdminSecret,
  stockController.delete,
);

module.exports = router;
