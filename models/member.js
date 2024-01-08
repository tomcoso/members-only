const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  membership_status: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: "MembershipStatus",
  },
});

MemberSchema.virtual("full_name").get(() => {
  return `${this.first_name} ${this.last_name}`;
});

module.exports = mongoose.model("Member", MemberSchema);
