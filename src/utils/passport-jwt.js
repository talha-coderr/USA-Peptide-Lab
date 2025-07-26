const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require(`${__models}/users`);
const { connectToDatabase, disconnectFromDatabase, startIdleTimer } = require(`${__config}/dbConn`)

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    return token;
};

const opts = {
    jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
    secretOrKey: process.env.JWT_SECRET, // Use environment variable for security
};

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
    try {
        await connectToDatabase();
        const user = await User.findById(jwtPayload.id);
        startIdleTimer();
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));
exports.isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return responseHandler.unauthenticate(res,[], "Session Expired, please login first.");
    }
    next();
};

