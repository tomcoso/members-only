const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MembershipStatusSchema = new Schema({
  name: { type: String, required: true },
  access: { type: Number, required: true },
});

module.exports = mongoose.model("MembershipStatus", MembershipStatusSchema);
