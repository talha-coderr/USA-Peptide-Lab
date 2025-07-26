const passport = require('passport');
const { responseHandler } = require(`${__utils}/responseHandler`)
passport.serializeUser((user, done) => {
    done(null, user);
})
passport.deserializeUser(function (user, done) {
    done(null, user);
});

exports.isAuthorized = (roles) => (req, res, next) => {
    if (!req.user) {
        return responseHandler.unauthorized(res, "Unauthorized access. Please log in.");
    }
    if (!roles.includes(req.user.role)) {
        return responseHandler.unauthorized(res, "Access denied. Insufficient privileges.");
    }
    return next();
};

