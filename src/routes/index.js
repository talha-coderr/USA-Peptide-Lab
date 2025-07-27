const express = require('express');
const userController = require(`${__controller}/user`);
const productController = require(`${__controller}/product`);

const router = express.Router();
require(`${__routes}/user`)(router, userController);
require(`${__routes}/product`)(router, productController);

module.exports = router;
