const mongoose = require("mongoose");

const priceSpecSchema = new mongoose.Schema({
    Quantity: String,
    Discount: String,
    Price: String
}, { _id: false });

const descriptionBlockSchema = new mongoose.Schema({
    h2: String,
    h3: String,
    p: String,
    references: [String]
}, { _id: false });

const relatedProductSchema = new mongoose.Schema({
    url: String,
    name: String,
    image: String,
    price: String
}, { _id: false });

const productSchema = new mongoose.Schema({
    url: String,
    name: String,
    primary_image: String,
    display_price: String,
    display_specs: [String],
    price_specs: [priceSpecSchema],
    description: [descriptionBlockSchema],
    certificate_of_analysis: String,
    high_performance_liquid_chromatography: String,
    mass_spectrometry: String,
    related_products: [relatedProductSchema]
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
