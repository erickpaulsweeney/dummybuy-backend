const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    ads: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ad" }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
