const { Router } = require("express");
const router = Router();
const ordersController = require("../controllers/orders.controller");
const ensureAuth = require("../middleware/auth");

router.get("/", ordersController.list);
router.get("/new", ensureAuth, ordersController.newForm);
router.post("/", ensureAuth, ordersController.create);
router.get("/:id", ordersController.view);
router.get("/:id/edit", ensureAuth, ordersController.editForm);
router.post("/:id", ensureAuth, ordersController.update);
router.post("/:id/delete", ensureAuth, ordersController.delete);

module.exports = router;
