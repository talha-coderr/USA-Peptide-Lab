const { isAdmin } = require(`${__middelwares}/user`)
const passport = require('passport');

module.exports = (router, controller) => {

    router.use(passport.initialize());

    router.post('/helloWorld', isAdmin, controller.helloWorld);

}
