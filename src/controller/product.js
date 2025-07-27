const Product = require(`${__models}/product`);
const { responseHandler } = require(`${__utils}/responseHandler`)
const fs = require("fs");
const path = require("path");
const PRODUCTS_FILE = path.join(__dirname, "../data/products.json");

exports.addProduct = async (req, res) => {
    try {
        const newProduct = req.body;

        if (!newProduct || !newProduct.id) {
            return responseHandler.validationError(res, "Product data with unique 'id' is required.");
        }

        const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        const products = JSON.parse(data);

        const alreadyExists = products.find(p => p.id === newProduct.id);
        if (alreadyExists) {
            return responseHandler.validationError(res, "Product with this ID already exists.");
        }

        products.push(newProduct);

        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        return responseHandler.success(res, newProduct, "Product added successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return responseHandler.validationError(res, "id is required.");
        }

        const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        let products = JSON.parse(data);

        const productIndex = products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            return responseHandler.notFound(res, "Product not found.");
        }

        const deletedProduct = products.splice(productIndex, 1)[0];

        fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
        return responseHandler.success(res, deletedProduct, "Product deleted successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        const products = JSON.parse(data);

        return responseHandler.success(res, products, "Product list retrieved successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return responseHandler.validationError(res, "id is required.");
        }

        const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        const products = JSON.parse(data);

        const product = products.find(p => p.id === id);

        if (!product) {
            return responseHandler.notFound(res, "Product not found.");
        }

        return responseHandler.success(res, product, "Product retrieved successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};
