const passport = require("passport");

module.exports = (router, controller) => {
  router.post("/contact", controller.contactUs);
};
