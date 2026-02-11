const { Router } = require("express");
const router = Router();
const inventoryController = require("../controllers/inventory.controller");
const ensureAuth = require("../middleware/auth");
const requireAdminSecret = require("../middleware/adminSecret");

router.get("/", inventoryController.list);
router.get("/new", ensureAuth, inventoryController.newForm);
router.post("/", ensureAuth, inventoryController.create);
router.get("/:id", inventoryController.view);
router.get("/:id/edit", ensureAuth, inventoryController.editForm);
router.post("/:id", ensureAuth, requireAdminSecret, inventoryController.update);
router.post(
  "/:id/delete",
  ensureAuth,
  requireAdminSecret,
  inventoryController.delete,
);

module.exports = router;
