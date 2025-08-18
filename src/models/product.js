const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema({
  minQuantity: { type: Number, required: true },
  maxQuantity: { type: Number, default: null },
  discountPercent: { type: Number, required: true },
});

const descriptionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  text: { type: String, required: true },
});

const fileSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  url: { type: String, required: true },
});

const tabsSchema = new mongoose.Schema({
  description: [descriptionSchema],
  certificate: [fileSchema],
  hplc: [fileSchema],
  mass: [fileSchema],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    productImage: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String },
    contents: { type: String },
    form: { type: String },
    purity: { type: String },
    sku: { type: String },
    stock: { type: Number },
    freeShippingOn: { type: Number },
    discounts: [discountSchema],
    tabs: tabsSchema, // <-- document with array fields inside
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
