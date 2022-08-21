const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        unique: true,
    },
    active: {
        type: Boolean,
        require: true,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const CategoryModel = mongoose.model("Category", categorySchema);
module.exports = CategoryModel;
