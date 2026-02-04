const { Router } = require("express");
const router = Router();
const productsController = require("../controllers/products.controller");
const ensureAuth = require("../middleware/auth");

router.get("/", productsController.list);
router.get("/new", ensureAuth, productsController.newForm);
router.post("/", ensureAuth, productsController.create);
router.get("/:id", productsController.view);
router.get("/:id/edit", ensureAuth, productsController.editForm);
router.post("/:id", ensureAuth, productsController.update);
router.post("/:id/delete", ensureAuth, productsController.delete);

module.exports = router;
