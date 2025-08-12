const { isAdmin } = require(`${__middelwares}/user`)
const passport = require('passport');
const { upload } = require(`${__utils}/file-uploader`)

module.exports = (router, controller) => {

    router.use(passport.initialize());
    router.post('/addProduct', upload.single("productImage"), passport.authenticate('jwt', { session: false }), isAdmin, controller.createProduct);
    router.put(
        "/updateProduct/:id",
        upload.single("productImage"),
        passport.authenticate("jwt", { session: false }),
        isAdmin,
        controller.updateProduct
    );
}