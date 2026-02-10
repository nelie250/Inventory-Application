const { Router } = require("express");
const router = Router();
const inventoryController = require("../controllers/inventory.controller");
const ensureAuth = require("../middleware/auth");

router.get("/", inventoryController.list);
router.get("/new", ensureAuth, inventoryController.newForm);
router.post("/", ensureAuth, inventoryController.create);
router.get("/:id", inventoryController.view);
router.get("/:id/edit", ensureAuth, inventoryController.editForm);
router.post("/:id", ensureAuth, inventoryController.update);
router.post("/:id/delete", ensureAuth, inventoryController.delete);

module.exports = router;
