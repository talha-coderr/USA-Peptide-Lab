const passport = require('passport');
const { isAuthorized } = require(`${__middelwares}/passport`)
const { isAdmin } = require(`${__middelwares}/user`)
require('../middelwares/passport');


module.exports = (router, controller) => {

    router.use(passport.initialize());

    router.post('/helloWorld', controller.helloWorld);
}

