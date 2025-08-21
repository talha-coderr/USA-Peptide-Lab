const { isAdmin } = require(`${__middelwares}/user`);
const passport = require("passport");
const { upload, uploadFields } = require(`${__utils}/file-uploader`);

module.exports = (router, controller) => {
  router.use(passport.initialize());
  router.post(
    "/addProduct",
    uploadFields,
    // passport.authenticate("jwt", { session: false }),
    // isAdmin,
    controller.createProduct
  );
  router.put(
    "/updateProduct/:id",
    uploadFields,
    // passport.authenticate("jwt", { session: false }),
    // isAdmin,
    controller.updateProduct
  );
  router.get("/getAllProducts", controller.getAllProducts);
  router.get("/getProductById/:id", controller.getProductById);
  router.delete("/deleteProduct/:id", controller.deleteProduct);
  router.get("/productSummary", controller.getProductSummary);
  router.patch("/updatePriceStock/:id", controller.updatePriceAndStock);
};
