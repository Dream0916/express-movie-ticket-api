const { Router } = require("express");
const userController = require("../controllers/userController");
const { _, auth } = require('../middlewares');

const router = Router({ strict: true });

router.post("/signup", userController.signup);

router.post("/signin", userController.signin);

router.post("/otpverify", userController.otpverify);

router.post("/changepassword", auth, userController.changepassword);

router.post("/verifypassword", auth, userController.verifypassword);

module.exports = router;