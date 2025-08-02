const Product = require(`${__models}/product`);
const { responseHandler } = require(`${__utils}/responseHandler`)
const { connectToDatabase, disconnectFromDatabase, startIdleTimer } = require(`${__config}/dbConn`)

exports.addProduct = async (req, res) => {
    try {
        await connectToDatabase()
        const productData = req.body;

        if (!productData || Object.keys(productData).length === 0) {
            return responseHandler.validationError(res, "Product data is required.");
        }

        const product = new Product(productData);
        const savedProduct = await product.save();

        return responseHandler.success(res, savedProduct, "Product added successfully.");
    } catch (error) {
        console.error("Error adding product:", error);
        return responseHandler.error(res, error.message);
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        await connectToDatabase();

        const products = await Product.find({}, 'name productImage price');

        return responseHandler.success(res, products, "Products retrieved successfully.");
    } catch (error) {
        console.error("Error retrieving products:", error);
        return responseHandler.error(res, error.message);
    }
};

exports.getProductById = async (req, res) => {
    try {
        await connectToDatabase();

        const productId = req.params.id;
        
        const product = await Product.findById(productId);

        if (!product) {
            return responseHandler.notFound(res, "Product not found.");
        }

        return responseHandler.success(res, product, "Product retrieved successfully.");
    } catch (error) {
        console.error("Error retrieving product:", error);
        return responseHandler.error(res, error.message);
    }
};
