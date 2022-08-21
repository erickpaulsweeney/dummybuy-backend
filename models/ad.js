const mongoose = require("mongoose");

const adSchema = mongoose.Schema({
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
        require: true,
    },
    seller: {
        type: String,
        ref: "User",
        require: true,
    },
    category: {
        type: String,
        ref: "Category",
        require: true,
    },
    interestedBuyers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    buyer: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    closedAt: {
        type: Date,
    },
});

const AdModel = mongoose.model("Ad", adSchema);
module.exports = AdModel;
