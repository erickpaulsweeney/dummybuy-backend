const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const DB_URI = "mongodb+srv://erick_paul:test1234@cluster0.bhdvtow.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
.then(() => console.log("Connected to DB"))
.catch(err => console.log(err));

const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/categories");
const adsRouter = require("./routes/ads");

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/category', categoryRouter);
app.use('/ads', adsRouter);

app.listen(8000);