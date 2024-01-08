const Message = require("../models/message");
const MembershipStatus = require("../models/membershipStatus");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

const debug = require("debug")("members-only:message-controller");

exports.message_get = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.membership_status.access >= 1) {
    var allMessages = await Message.find({})
      .populate("author")
      .sort({ timestamp: -1 });
  } else {
    var allMessages = await Message.find({}, "title message timestamp").sort({
      timestamp: -1,
    });
  }

  debug(allMessages ? "Messages: " + allMessages.length : "No messages");

  res.render("index", {
    title: "Members Only Message Board",
    messages: allMessages,
  });
});

exports.message_create_get = asyncHandler((req, res, next) => {
  if (!req.user) {
    res.redirect("/member/log-in");
    return;
  }
  res.render("create_message", {
    title: "Members Only: Create message",
    message: undefined,
    errors: undefined,
  });
});

exports.message_create_post = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 30 })
    .withMessage("Title must be between 5 and 30 characters.")
    .escape(),
  body("message")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!req.user) {
      res.redirect("/login");
      console.error("User not authenticated");
      return;
    }

    const message = new Message({
      title: req.body.title,
      message: req.body.message,
      author: req.user._id,
      timestamp: new Date(),
    });

    if (!errors.isEmpty()) {
      res.render("create_message", {
        title: "Members Only: Create message",
        message: message,
        errors: errors.array(),
      });
      return;
    }
    await message.save();
    res.redirect("/");
  }),
];

exports.message_delete_post = asyncHandler(async (req, res, next) => {
  if (!req.user || req.user.membership_status.access < 2) {
    res.redirect("/");
    return;
  }
  await Message.findByIdAndDelete(req.body.messageid);
  res.redirect("/");
});
