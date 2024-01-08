const express = require("express");
const router = express.Router();

const member_controller = require("../controllers/memberController");

router.get("/sign-up", member_controller.sign_up_get);

router.post("/sign-up", member_controller.sing_up_post);

router.get("/log-in", member_controller.log_in_get);

router.post("/log-in", member_controller.log_in_post);

router.get("/log-out", member_controller.log_out_get);

router.get("/verify", member_controller.verify_member_get);
router.post("/verify", member_controller.verify_member_post);

module.exports = router;
