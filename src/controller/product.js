const Product = require(`${__models}/product`);
const { responseHandler } = require(`${__utils}/responseHandler`);
const {
  connectToDatabase,
  disconnectFromDatabase,
  startIdleTimer,
} = require(`${__config}/dbConn`);

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
    await connectToDatabase();
    await connectToDatabase();

    const { id } = req.params;

    let product = await Product.findById(id);
    if (!product || product.isDeleted) {
      return responseHandler.validationError(res, "Product not found");
    }

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

    // Parse discounts if provided
    let parsedDiscounts = product.discounts;
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

    // Tabs (merge with existing)
    let tabs = product.tabs || {
      description: [],
      certificate: [],
      hplc: [],
      mass: [],
    };

    if (description) {
      tabs.description.push({ text: description });
    }

    if (req.files && req.files.certificate && req.files.certificate[0]) {
      tabs.certificate.push({
        url: baseUrl + req.files.certificate[0].filename,
      });
    }

    if (req.files && req.files.hplc && req.files.hplc[0]) {
      tabs.hplc.push({
        url: baseUrl + req.files.hplc[0].filename,
      });
    }

    if (
      req.files &&
      req.files.massSpectrometry &&
      req.files.massSpectrometry[0]
    ) {
      tabs.mass.push({
        url: baseUrl + req.files.massSpectrometry[0].filename,
      });
    }

    // Update all fields (only if provided)
    product.name = name || product.name;
    product.price = price || product.price;
    product.size = size || product.size;
    product.contents = contents || product.contents;
    product.form = form || product.form;
    product.purity = purity || product.purity;
    product.sku = sku || product.sku;
    product.stock = stock || product.stock;
    product.freeShippingOn = freeShippingOn || product.freeShippingOn;
    product.discounts = parsedDiscounts;
    product.tabs = tabs;

    // If new image uploaded, update productImage
    if (req.files && req.files.file && req.files.file[0]) {
      product.productImage = `${baseUrl}${req.files.file[0].filename}`;
    }

    await product.save();

    return responseHandler.success(
      res,
      product,
      "Product updated successfully"
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    await connectToDatabase();

    const products = await Product.find({ isDeleted: false });

    return responseHandler.success(
      res,
      products,
      "Products fetched successfully"
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};

exports.getProductById = async (req, res) => {
  try {
    await connectToDatabase();

    const { id } = req.params;

    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) {
      return responseHandler.validationError(res, "Product not found");
    }

    return responseHandler.success(
      res,
      product,
      "Product fetched successfully"
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await connectToDatabase();

    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product || product.isDeleted) {
      return responseHandler.validationError(res, "Product not found");
    }

    product.isDeleted = true;
    await product.save();

    return responseHandler.success(
      res,
      product,
      "Product deleted successfully"
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
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
