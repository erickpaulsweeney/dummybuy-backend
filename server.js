require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const morgan = require("morgan");

const DB_URI =
    "mongodb+srv://erick_paul:test1234@cluster0.bhdvtow.mongodb.net/?retryWrites=true&w=majority";

mongoose
    .connect(DB_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log(err));

const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/categories");
const adsRouter = require("./routes/ads");

const app = express();

app.use(cors());
app.use(express.static('uploads'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(morgan("dev"));

app.use("/auth", authRouter);
app.use(authenticateRequest);
app.use("/category", categoryRouter);
app.use("/ads", adsRouter);

app.listen(8000);

function authenticateRequest(req, res, next) {
    const authHeaderInfo = req.headers["authorization"];
    if (authHeaderInfo === undefined) {
        return res.status(401).send({ message: "No token provided" });
    }

    const token = authHeaderInfo.split(" ")[1];
    if (token === undefined) {
        return res.status(401).send({ message: "Proper token not provided" });
    }

    try {
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userInfo = payload;
        next();
    } catch (error) {
        return res.status(403).send({ message: error.message });
    }
}
