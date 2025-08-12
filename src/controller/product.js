const Product = require(`${__models}/product`);
const { responseHandler } = require(`${__utils}/responseHandler`)
const { connectToDatabase, disconnectFromDatabase, startIdleTimer } = require(`${__config}/dbConn`)

exports.createProduct = async (req, res) => {
    try {
        await connectToDatabase();

        const { name, price, size, contents, form, purity, sku, freeShippingOn, discounts, tabs } = req.body;

        if (!name || !price) {
            return responseHandler.validationError(res, "Product name and price are required");
        }

        if (!req.file) {
            return responseHandler.validationError(res, "Product image is required");
        }

        let parsedDiscounts = [];
        let parsedTabs = [];

        if (discounts) {
            parsedDiscounts = JSON.parse(discounts);
        }

        if (tabs) {
            parsedTabs = JSON.parse(tabs);
        }

        const product = await Product.create({
            name,
            productImage: req.file.filename,
            price,
            size,
            contents,
            form,
            purity,
            sku,
            freeShippingOn,
            discounts: parsedDiscounts,
            tabs: parsedTabs
        });

        return responseHandler.success(res, product, "Product created successfully");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

// controllers/productController.js
const fs = require("fs");
const path = require("path");

exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, description } = req.body;

        // Product find karo
        let product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Agar new image upload hui hai to purani delete karo
        if (req.file) {
            if (product.image) {
                const oldImagePath = path.join(__dirname, "../uploads/products", product.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            product.image = req.file.filename;
        }

        // Update fields
        if (name) product.name = name;
        if (price) product.price = price;
        if (description) product.description = description;

        await product.save();

        res.json({ success: true, message: "Product updated successfully", data: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

