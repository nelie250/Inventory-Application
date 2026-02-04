const { Router } = require("express");
const userController = require("../controllers/user.controller");

const router = Router();

router
  .route("/signup")
  .get(userController.getSignupForm)
  .post(userController.createUser);

router
  .route("/login")
  .get(userController.getLoginForm)
  .post(userController.loginUser);

router.get("/logout", userController.logoutUser);

module.exports = router;
