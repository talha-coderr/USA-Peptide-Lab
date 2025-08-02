const { isAdmin } = require(`${__middelwares}/user`)
const passport = require('passport');

module.exports = (router, controller) => {

    router.use(passport.initialize());
    router.post('/addProduct', passport.authenticate('jwt', { session: false }), isAdmin, controller.addProduct);
    router.get('/getAllProducts', controller.getAllProducts);
    router.get('/getProductById/:id', controller.getProductById);
    // router.get('/getAllProducts', controller.getAllProducts);
    // router.delete('/deleteProduct/:id', controller.deleteProduct);
}