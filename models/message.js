const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  author: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "Member",
  },
  timestamp: { type: Date, required: true },
});

MessageSchema.virtual("timestamp_display").get(function () {
  return this.timestamp.toDateString();
});

module.exports = mongoose.model("Message", MessageSchema);
