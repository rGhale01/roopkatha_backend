const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: "customer" },
    image:String

});

// UserSchema.plugin(uniqueValidator, { message: "Email already in use." });

const User = mongoose.model("User", UserSchema, "users");
module.exports = User;