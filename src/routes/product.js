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
  router.get("/productList", controller.getAllProducts);
  router.get("/productSummary", controller.getProductSummary);

  router.delete("/deleteProduct/:id", controller.deleteProduct);
  router.patch("/updatePriceStock/:id", controller.updatePriceAndStock);

  router.put(
    "/updateProduct/:id",
    upload.single("file"),
    // passport.authenticate("jwt", { session: false }),
    // isAdmin,
    controller.updateProduct
  );
};
