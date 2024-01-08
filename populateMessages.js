#! /usr/bin/env node

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const Message = require("./models/message");
const Member = require("./models/member");

main();

async function main() {
  console.log("satrting");
  await mongoose.connect(process.argv.slice(2)[0]);
  console.log("mongo connected, now creating models");
  const author = await Member.findOne({ username: "tomcoso" }).exec();
  console.log(author);
  const message = new Message({
    title: "Secret Message",
    message: "Meet at the place. Sat 8pm",
    author: author._id,
    timestamp: new Date(),
  });
  try {
    await message.save();
  } catch (err) {
    console.error(err);
  }
  console.log("success");
  mongoose.connection.close();
  console.log("connection closed");
}
