const express = require('express');
const userController = require(`${__controller}/user`);

const router = express.Router();
require(`${__routes}/user`)(router, userController);
require(`${__routes}/admin-users`)(router, userController);

module.exports = router;
