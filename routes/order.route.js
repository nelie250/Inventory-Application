const { Router } = require("express");
const router = Router();
const ordersController = require("../controllers/orders.controller");
const ensureAuth = require("../middleware/auth");
const requireAdminSecret = require("../middleware/adminSecret");

router.get("/", ordersController.list);
router.get("/new", ensureAuth, ordersController.newForm);
router.post("/", ensureAuth, ordersController.create);
router.get("/:id", ordersController.view);
router.get("/:id/edit", ensureAuth, ordersController.editForm);
router.post("/:id", ensureAuth, requireAdminSecret, ordersController.update);
router.post(
  "/:id/delete",
  ensureAuth,
  requireAdminSecret,
  ordersController.delete,
);

module.exports = router;
