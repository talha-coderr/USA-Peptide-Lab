const { isAdmin } = require(`${__middelwares}/user`)
const passport = require('passport');
// const { uploadCv } = require(`${__utils}/file-uploader`)

module.exports = (router, controller) => {

    router.use(passport.initialize());

    router.post('/helloWorld', isAdmin, controller.helloWorld);

}
