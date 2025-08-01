const passport = require('passport');
const { isAuthorized } = require(`${__middelwares}/passport`)
const { isAdmin } = require(`${__middelwares}/user`)
require('../middelwares/passport');


module.exports = (router, controller) => {

    router.use(passport.initialize());

    router.post('/helloWorld', controller.helloWorld);
    router.post('/registerUser', controller.registerUser);
    router.post('/login', controller.login);
    router.post('/logout', controller.logout);
    router.get('/getAllUsers', isAdmin, controller.getAllUsers);
    router.put('/updateUser/:id', isAdmin, controller.updateUser);
    router.delete('/deleteUser/:id', isAdmin, controller.deleteUser);
    router.get('/getUserById/:id', controller.getUserById);
}

