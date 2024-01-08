const createError = require("http-errors");
const express = require("express");
const path = require("path");
var debug = require("debug")("members-only:middleware");

const passport = require("passport");
const session = require("express-session");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");
const bcrypt = require("bcryptjs");
const Member = require("./models/member");

const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();

const indexRouter = require("./routes/index");
const memberRouter = require("./routes/member");

const app = express();

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const mongoDb = process.env.MONGO_DB;

main().catch((err) => debug(`Cannot connect to database: ${err}`));
async function main() {
  await mongoose.connect(mongoDb);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const member = await Member.findOne({ username: username });
      if (!member) {
        return done(null, false, { message: "Incorrect Username" });
      }
      const match = await bcrypt.compare(password, member.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, member);
    } catch (err) {
      done(err);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await Member.findById(id).populate("membership_status").exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.use(
  session({
    secret: "Jnfe92bNjd*&£bJe02",
    resave: false,
    saveUninitialized: true,
  })
);
// app.use(cookieParser("Jnfe92bNjd*&£bJe02"));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(compression());
app.use(helmet());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  // debug(req.session);
  res.locals.currentMember = req.user;
  next();
});

app.use("/", indexRouter);
app.use("/member", memberRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
