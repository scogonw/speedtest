import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
    lat: Number,
    long: Number,
    accuracy: Number,
    city: String
});

export const Location = mongoose.model('Location', locationSchema);