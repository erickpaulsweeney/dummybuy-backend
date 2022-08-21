const express = require("express");
const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");
const router = express.Router();

router.post("/signup", async (req, res) => {
    const { email, name, password, confirmPassword } = req.body;
    if (!email || !name || !password || !confirmPassword) {
        return res.status(400).send({ message: "All fields are required."});
    }
    if (password !== confirmPassword) {
        return res.status(400).send({ message: "Passwords do not match."});
    }

    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser !== null) {
        return res.status(400).send({ message: "Email already in use."});
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
        name: name,
        email: email,
        password: hash,
    });

    try {
        const savedUser = await newUser.save();
        return res.status(201).send({ message: "User created with id: " + savedUser.id});
    } catch (err) {
        return res.status(501).send(err.message);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "All fields are required."});
    }
    const findUser = await UserModel.findOne({ email: email });
    if (findUser === null) {
        return res.status(400).send({ message: "User does not exist." });
    }

    const checkPassword = await bcrypt.compare(password, findUser.password);
    if (!checkPassword) {
        return res.status(400).send({ message: "Incorrect password."});
    }

    const { id, name, ads, createdAt } = findUser;
    const data = { id, name, email, ads, createdAt };
    return res.status(200).send(data);
});

module.exports = router;
