const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
    minQuantity: { type: Number, required: true },
    maxQuantity: { type: Number, default: null },
    discountPercent: { type: Number, required: true },
});

const tabSchema = new mongoose.Schema({
    title: { type: String },
    content: { type: String },
    image: { type: String },
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    productImage: { type: String },
    price: { type: Number, required: true },
    size: { type: String },
    contents: { type: String },
    form: { type: String },
    purity: { type: String },
    sku: { type: String },
    description: { type: String },
    freeShippingOn: { type: Number },
    discounts: [discountSchema],
    tabs: [tabSchema],
    isDeleted: { type: Boolean, default: false },
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
