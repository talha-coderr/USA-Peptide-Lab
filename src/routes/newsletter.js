const passport = require("passport");

module.exports = (router, controller) => {
  router.post("/newsletter", controller.subscribeNewsletter);
};
