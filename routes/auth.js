const express = require("express");
const UserModel = require("../models/user");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");

let refresh_token_list = {};

router.post("/signup", async (req, res) => {
    const { email, name, password, confirmPassword } = req.body;
    if (!email || !name || !password || !confirmPassword) {
        return res.status(400).send({ message: "All fields are required." });
    }
    if (password !== confirmPassword) {
        return res.status(400).send({ message: "Passwords do not match." });
    }

    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser !== null) {
        return res.status(400).send({ message: "Email already in use." });
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
        return res
            .status(201)
            .send({ message: "User created with id: " + savedUser.id });
    } catch (err) {
        return res.status(501).send(err.message);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: "All fields are required." });
    }
    const findUser = await UserModel.findOne({ email: email });
    if (findUser === null) {
        return res.status(400).send({ message: "User does not exist." });
    }

    const checkPassword = await bcrypt.compare(password, findUser.password);
    if (!checkPassword) {
        return res.status(400).send({ message: "Incorrect password." });
    }

    const { id, name, ads, createdAt } = findUser;
    const data = { id, name, email, ads, createdAt };
    const access_token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME });
    const refresh_token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME });
    refresh_token_list[id] = refresh_token;
    return res.status(200).send({ access_token, refresh_token, data });
});

router.post("/token", async (req, res) => {
    const userId = req.body.data.id;
    const token = req.body.refresh_token;
    if (!token) {
        return res.send(401).send({ message: "Please include refresh token" });
    } else if (refresh_token_list[userId] !== token) {
        return res.send(401).send({ message: "Invalid token. Please login again to generate a new one" });
    }

    try {
        const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        delete payload.exp;
        const access_token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
        return res.status(200).send({ access_token });
    } catch(error) {
        return res.status(401).send({ message: error.message });
    }
});

module.exports = router;
