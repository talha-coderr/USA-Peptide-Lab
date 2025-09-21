const jwt = require('jsonwebtoken');

const generateTokens = async (payload, res, user) => {
    // Sign the token with the payload, secret, and expiration time from environment variables
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_TOKEN_EXP
    });
    // Refresh token
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXP
    });
    // Store the refresh token in the user's database record (if applicable)
    user.refreshToken = refreshToken;
    await user.save();

    const isProd = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stagging';

    // Set cookies for access and refresh tokens
    res.cookie('jwt', accessToken, {
        httpOnly: true, // ✅ JS se access nahi
        secure: isProd, // ✅ Prod me HTTPS required
        sameSite: isProd ? 'none' : 'lax', // ✅ Cross-site cookie ke liye none
        maxAge: 2 * 60 * 60 * 1000 // 2 hours
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    return { accessToken, refreshToken };

};

const verifyToken = async (refreshToken) => {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
}
const tokenPayload = async (user) => {
    // console.log("Token Payload User===>", user)
    return {
        id:user?._id,
        email:user?.email,
        role:user?.role,
        name:user?.fullName,
    }
}

module.exports = { generateTokens, verifyToken, tokenPayload };
