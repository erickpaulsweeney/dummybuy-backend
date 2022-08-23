const express = require("express");
const router = express.Router();
const AdModel = require("../models/ad");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, res, cb) {
        cb(null, "uploads");
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
    const list = await AdModel.find({}).populate("seller", "name");
    return res.status(200).send(list);
});

router.post("/", upload.single("image"), async (req, res) => {
    const { title, description, price, seller, category } = req.body;
    const image = req.file !== undefined ? "http://localhost:8000/" + req.file?.filename : "http://localhost:8000/1661239689386-default image.webp"
    console.log(req.body, req.file);
    if (!title || !description || !price || !seller || !category) {
        return res.status(400).send({ message: "All fields are required." });
    }

    const newAd = new AdModel({ 
        title,
        description,
        price,
        seller,
        category,
        image
    });

    try {
        const savedAd = await newAd.save();
        return res
            .status(201)
            .send({ message: "Ad created with id: " + savedAd.id });
    } catch (err) {
        return res.status(501).send(err.message);
    }
});

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    const foundAd = await AdModel.findById(
        id,
        "_id title description price seller category interestedBuyers createdAt closedAt buyer"
    )
        .populate("seller", "name")
        .populate("interestedBuyers", "name");
    if (foundAd === null) {
        return res.status(400).send({ message: "Ad does not exist." });
    }

    return res.status(200).send(foundAd);
});

router.delete("/:id", async (req, res) => {
    const id = req.params.id;
    const foundAd = await AdModel.findById(id);
    if (foundAd === null) {
        return res.status(400).send({ message: "Ad does not exist." });
    }

    try {
        await AdModel.findByIdAndDelete(id);
        return res.status(200).send({ message: "Ad successfully deleted." });
    } catch (err) {
        return res.status(501).send(err.message);
    }
});

router.post("/:id/buy", async (req, res) => {
    const id = req.params.id;
    const buyerId = req.userInfo.id;
    const foundAd = await AdModel.findById(id);
    if (foundAd === null) {
        return res.status(400).send({ message: "Ad does not exist." });
    }
    console.log(foundAd.seller, buyerId);
    if (foundAd.seller === buyerId) {
        return res
            .status(400)
            .send({ message: "You cannot buy your own product." });
    }

    try {
        let copy = JSON.parse(JSON.stringify(foundAd.interestedBuyers));
        copy.push(buyerId);
        await AdModel.findByIdAndUpdate(id, { interestedBuyers: copy });
        return res.status(200).send({ message: "Ad interest sent to seller." });
    } catch (err) {
        return res.status(501).send(err.message);
    }
});

router.post("/:id/close/:buyerId", async (req, res) => {
    const id = req.params.id;
    const buyerId = req.params.buyerId;
    const foundAd = await AdModel.findById(id);
    console.log(foundAd.seller, buyerId);
    if (foundAd === null) {
        return res.status(400).send({ message: "Ad does not exist." });
    }
    if (foundAd.seller === buyerId) {
        return res
            .status(400)
            .send({ message: "You cannot buy your own product." });
    }

    try {
        await AdModel.findByIdAndUpdate(id, {
            buyer: buyerId,
            closedAt: Date.now(),
        });
        return res.status(200).send({ message: "Ad closed to buyer." });
    } catch (err) {
        return res.status(501).send(err.message);
    }
});

module.exports = router;
