const { Router } = require("express");
const router = Router();
const suppliersController = require("../controllers/suppliers.controller");
const ensureAuth = require("../middleware/auth");

router.get("/", suppliersController.list);
router.get("/new", ensureAuth, suppliersController.newForm);
router.post("/", ensureAuth, suppliersController.create);
router.get("/:id", suppliersController.view);
router.get("/:id/edit", ensureAuth, suppliersController.editForm);
router.post("/:id", ensureAuth, suppliersController.update);
router.post("/:id/delete", ensureAuth, suppliersController.delete);

module.exports = router;
