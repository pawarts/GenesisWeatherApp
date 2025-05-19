const express = require("express");
const { getWeather } = require("./modules/weatherService");
const app = express();
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "memenews2004@gmail.com",
        pass: "lrrabkotxwbpeifd",
    },
});

const Subscription = require("./model/Subscription");

const PORT = 5000;

app.use(
    cors({
        origin: "*",
    })
);

app.use(express.json());

mongoose
    .connect("mongodb://localhost:27017/weatherDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

app.get("/weather", async (req, res) => {
    const params = req.query;
    const { city } = params;

    if (!city) return res.status(400).send("City is required");

    const weatherData = await getWeather(city);

    if (weatherData.status === 404) {
        return res.status(404).send("City not found");
    }

    res.json(weatherData);
});

app.post("/subscribe", async (req, res) => {
    const { email, city, frequency } = req.body;

    if (!email || !city || !frequency) {
        return res.status(400).json({ message: "Missing fields." });
    }

    /*   const existing = await Subscription.findOne({ email });
    if (existing) {
        return res.status(409).json({ message: "Email already subscribed." });
    } */

    const token = uuidv4();

    const sub = new Subscription({ email, city, frequency, token });
    await sub.save();

    const confirmUrl = `http://localhost:5000/confirm/${token}`;

    let mailOptions = {
        from: '"Meme News" <memenews2004@gmail.com>',
        to: email,
        subject: "Test Email",
        text: "Hello from Outlook SMTP!",
        html: `<a href="${confirmUrl}">Confirm Subscription</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).json({ message: "Error sending email." });
        } else {
            console.log("Message sent: %s", info.messageId);
            res.status(200).json({
                message: "Subscription created. Check your email.",
            });
        }
    });
});

app.get("/confirm/:token", (req, res) => {
    const { token } = req.params;

    if (token.length !== 36) {
        return res.status(400).send("Invalid token");
    }

    Subscription.findOneAndUpdate({ token }, { confirmed: true }, { new: true })
        .then((subscription) => {
            if (!subscription) {
                return res.status(404).send("Token not found");
            }
            res.send("Subscription confirmed");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Server error");
        });
});

app.get("/unsubscribe/:token", (req, res) => {
    const { token } = req.params;

    if (token.length !== 36) {
        return res.status(400).send("Invalid token");
    }

    Subscription.findOneAndDelete({ token })
        .then((subscription) => {
            if (!subscription) {
                return res.status(404).send("Token not found");
            }
            res.send("Unsubscribed successfully");
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("Server error");
        });
})
