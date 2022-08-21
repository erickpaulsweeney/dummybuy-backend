const express = require("express");
const router = express.Router();
const CategoryModel = require("../models/category");

router.get("/", async (req, res) => {
    const list = await CategoryModel.find({ active: true }, { name: 1 });
    return res.status(200).send(list);
})

router.post("/create", async (req, res) => {
    const { name } = req.body;
    const existingCategory = await CategoryModel.findOne({ name: name });
    if (existingCategory !== null) {
        if (existingCategory.active === false) {
            try {
                await CategoryModel.findByIdAndUpdate(existingCategory.id, { active: true });
                return res.status(200).send({ message: "Category created with id: " + existingCategory.id});
            } catch (err) {
                return res.status(501).send(err.message);
            }
        }
        return res.status(400).send({ message: "Category already exists."});
    }

    const newCategory = new CategoryModel({ name: name });

    try {
        const savedCategory = await newCategory.save();
        return res
            .status(201)
            .send({ message: "Category created with id: " + savedCategory.id});
    } catch (err) {
        return res.status(501).send(err.message);
    }
});

router.post("/:id/delete", async (req, res) => {
    const id = req.params.id;
    const existingCategory = await CategoryModel.findById(id);
    if (existingCategory === null || !existingCategory.active) {
        return res.status(400).send({ message: "Category does not exist."});
    }

    try {
        await CategoryModel.findByIdAndUpdate(id, { active: false });
        return res.status(200).send({ message: "Category successfully deleted."});
    } catch (err) {
        return res.status(501).send(err.message);
    }
});

module.exports = router;
