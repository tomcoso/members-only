const Member = require("../models/member");
const MembershipStatus = require("../models/membershipStatus");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const passport = require("passport");

const debug = require("debug")("members-only:member-controller");
require("dotenv").config();

exports.sign_up_get = asyncHandler(async (req, res, next) => {
  res.render("sign_up", {
    title: "Become a Member",
    member: null,
    errors: null,
  });
});

exports.sing_up_post = [
  body("username")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Username must be at least 2 characters long.")
    .escape()
    .custom(async (val) => {
      const member = await Member.findOne({ username: val }).exec();
      if (member) {
        throw new Error("Username is already in use. Please pick another one.");
      } else return true;
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .escape(),
  body("first_name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long")
    .escape(),
  body("last_name")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long")
    .escape(),
  body("password_confirmation")
    .custom((val, { req }) => {
      return val === req.body.password;
    })
    .withMessage("Passwords don't match."),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const nonMemberStatus = await MembershipStatus.findOne({
      access: 0,
    }).exec();

    const member = new Member({
      username: req.body.username,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      membership_status: nonMemberStatus._id,
      password: req.body.password,
    });

    if (!errors.isEmpty()) {
      res.render("sign_up", {
        title: "Become a Member",
        member: member,
        errors: errors.array(),
      });
      return;
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) {
          throw new Error("Error hashing password");
        }
        member.password = hashedPassword;
        req.body.password = hashedPassword;
        await member.save();

        // res.redirect("/");
      });
    }
  }),
  passport.authenticate("local", { successRedirect: "/" }),
];

exports.log_in_get = asyncHandler((req, res, next) => {
  const errorMsg = req.flash("error");
  debug(errorMsg);
  res.render("log_in", {
    title: "Members Only: Log In",
    error: errorMsg[0],
  });
});

exports.log_in_post = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/member/log-in",
  failureFlash: true,
});

exports.log_out_get = asyncHandler((req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

exports.verify_member_get = (req, res, next) => {
  if (!req.user) {
    res.redirect("/member/log-in");
    return;
  }

  res.render("verify_member", {
    title: "Members Only: Verify",
    errors: undefined,
  });
};
exports.verify_member_post = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.redirect("/member/log-in");
    return;
  }

  const memberStatus = req.user.membership_status;

  // FOR FULL MEMBERS
  if (
    memberStatus.access === 0 &&
    req.body.secret === process.env.ACCESS_1_SECRET
  ) {
    debug("making full member");
    const fullMemberStatus = await MembershipStatus.findOne({
      access: 1,
    }).exec();
    debug(fullMemberStatus);

    const updatedMember = new Member({
      _id: req.user._id,
      username: req.user.username,
      password: req.user.password,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      membership_status: fullMemberStatus._id.toString(),
    });

    await Member.findByIdAndUpdate(updatedMember._id, updatedMember, {});
    debug("done");

    res.redirect("/");
    return;
  }
  // FOR ADMINS
  else if (
    memberStatus.access === 1 &&
    req.body.secret === process.env.ACCESS_2_SECRET
  ) {
    debug("making admin");
    const adminMemberStatus = await MembershipStatus.findOne({
      access: 2,
    }).exec();
    const updatedMember = new Member({
      _id: req.user._id,
      username: req.user.username,
      password: req.user.password,
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      membership_status: adminMemberStatus._id.toString(),
    });
    await Member.findByIdAndUpdate(updatedMember._id, updatedMember, {});

    res.redirect("/");
    return;
  } else {
    res.render("verify_member", {
      title: "Members Only: Verify",
      errors: [{ msg: "We don't know this secret." }],
    });
  }
});
