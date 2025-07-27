const { isAdmin } = require(`${__middelwares}/user`)
const passport = require('passport');

module.exports = (router, controller) => {

    router.use(passport.initialize());

    router.post('/addProduct', controller.addProduct);
    router.get('/getAllProducts', controller.getAllProducts);
    router.delete('/deleteProduct/:id', controller.deleteProduct);
    router.get('/getProductById/:id', controller.getProductById);

}
