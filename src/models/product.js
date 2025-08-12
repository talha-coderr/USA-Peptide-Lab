const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
    minQuantity: { type: Number, required: true },
    maxQuantity: { type: Number, default: null },
    discountPercent: { type: Number, required: true },
});

const tabSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    productImage: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String },
    contents: { type: String },
    form: { type: String },
    purity: { type: String },
    sku: { type: String },
    freeShippingOn: { type: Number },
    discounts: [discountSchema],
    tabs: [tabSchema],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
