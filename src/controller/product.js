const Product = require(`${__models}/product`);
const { responseHandler } = require(`${__utils}/responseHandler`);
const {
  connectToDatabase,
  disconnectFromDatabase,
  startIdleTimer,
} = require(`${__config}/dbConn`);
const fs = require("fs");
const path = require("path");

// exports.createProduct = async (req, res) => {
//   try {
//     await connectToDatabase();

//     const {
//       name,
//       price,
//       size,
//       contents,
//       form,
//       purity,
//       sku,
//       freeShippingOn,
//       discounts,
//       tabs,
//     } = req.body;

//     if (!name || !price) {
//       return responseHandler.validationError(
//         res,
//         "Product name and price are required"
//       );
//     }

//     if (!req.file) {
//       return responseHandler.validationError(res, "Product image is required");
//     }

//     let parsedDiscounts = [];
//     let parsedTabs = [];

//     if (discounts) {
//       parsedDiscounts = JSON.parse(discounts);
//     }

//     if (tabs) {
//       parsedTabs = JSON.parse(tabs);
//     }

//     const product = await Product.create({
//       name,
//       productImage: req.file.filename,
//       price,
//       size,
//       contents,
//       form,
//       purity,
//       sku,
//       freeShippingOn,
//       discounts: parsedDiscounts,
//       tabs: parsedTabs,
//     });

//     return responseHandler.success(
//       res,
//       product,
//       "Product created successfully"
//     );
//   } catch (error) {
//     console.error(error);
//     return responseHandler.error(res, error);
//   }
// };

exports.createProduct = async (req, res) => {
  try {
    await connectToDatabase();

    const {
      name,
      price,
      size,
      contents,
      form,
      purity,
      sku,
      stock,
      freeShippingOn,
      discounts,
      description,
    } = req.body;

    if (!name || !price) {
      return responseHandler.validationError(
        res,
        "Product name and price are required"
      );
    }

    if (!req.files || !req.files.file || !req.files.file[0]) {
      return responseHandler.validationError(res, "Product image is required");
    }
    let parsedDiscounts = [];
    if (discounts) {
      try {
        parsedDiscounts = JSON.parse(discounts).map((discount) => ({
          minQuantity: parseInt(discount.minQuantity),
          maxQuantity: parseInt(discount.maxQuantity),
          discountPercent: parseFloat(discount.discountPercent),
        }));
      } catch (error) {
        return responseHandler.validationError(res, "Invalid discounts format");
      }
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    const tabs = {
      description: [],
      certificate: [],
      hplc: [],
      mass: [],
    };

    if (description) {
      tabs.description.push({ text: description });
    }

    if (req.files.certificate && req.files.certificate[0]) {
      tabs.certificate.push({
        url: baseUrl + req.files.certificate[0].filename,
      });
    }

    if (req.files.hplc && req.files.hplc[0]) {
      tabs.hplc.push({
        url: baseUrl + req.files.hplc[0].filename,
      });
    }

    if (req.files.massSpectrometry && req.files.massSpectrometry[0]) {
      tabs.mass.push({
        url: baseUrl + req.files.massSpectrometry[0].filename,
      });
    }
    const productData = {
      name,
      productImage: `${baseUrl}${req.files.file[0].filename}`,
      price,
      size,
      contents,
      form,
      purity,
      sku,
      stock,
      freeShippingOn,
      discounts: parsedDiscounts,
      tabs,
    };

    const product = await Product.create(productData);

    return responseHandler.success(
      res,
      product,
      "Product created successfully"
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stock } = req.body;

    // Product find karo
    let product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Agar new image upload hui hai to purani delete karo
    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(
          __dirname,
          "../uploads/products",
          product.image
        );
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
    if (stock) product.stock = stock;

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: {
        deletedProduct: {
          id: deletedProduct._id,
          name: deletedProduct.name,
          sku: deletedProduct.sku,
        },
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};
exports.getProductSummary = async (req, res) => {
  try {
    const products = await Product.find({}, "name price size stock discounts") // only select required fields
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product summary",
      error: error.message,
    });
  }
};

exports.updatePriceAndStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock } = req.body;
    if (price == null && stock == null) {
      return res.status(400).json({
        success: false,
        message: "Please provide price or stock to update",
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(price != null && { price }),
          ...(stock != null && { stock }),
        },
      },
      { new: true, runValidators: true }
    ).select("name price size stock discounts");

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};
