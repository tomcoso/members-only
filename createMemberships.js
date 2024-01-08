#! /usr/bin/env node

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const MembershipStatus = require("./models/membershipStatus");

main();

async function main() {
  console.log("satrting");
  await mongoose.connect(process.argv.slice(2)[0]);
  console.log("mongo connected, now creating models");
  const nonMember = new MembershipStatus({ name: "Non Member", access: 0 });
  const member = new MembershipStatus({ name: "Member", access: 1 });
  try {
    await nonMember.save();
    await member.save();
  } catch (err) {
    console.error(err);
  }
  console.log("success");
  mongoose.connection.close();
  console.log("connection closed");
}
