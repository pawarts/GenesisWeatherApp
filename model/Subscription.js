const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema({
    email: { type: String, required: true },
    city: { type: String, required: true },
    frequency: { type: String, enum: ["daily", "hourly"], required: true },
    token: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
