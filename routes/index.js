var express = require("express");
var router = express.Router();

const message_controller = require("../controllers/messageController");

var debug = require("debug")("members-only:index-route");

/* GET home page. */
router.get("/", message_controller.message_get);

router.get("/create", message_controller.message_create_get);

router.post("/create", message_controller.message_create_post);

router.post("/delete", message_controller.message_delete_post);

module.exports = router;
