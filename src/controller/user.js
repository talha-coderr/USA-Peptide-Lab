const User = require(`${__models}/users`);
const { responseHandler } = require(`${__utils}/responseHandler`);
const { connectToDatabase, disconnectFromDatabase, startIdleTimer } = require(`${__config}/dbConn`)
const bcrypt = require('bcrypt');
const { generateTokens, verifyToken, tokenPayload } = require(`${__utils}/helper.js`)

exports.helloWorld = async (req, res) => {
    try {
        await connectToDatabase();
        return responseHandler.success(res, "Hello From User Route")
    } catch (error) {
        console.log(error)
        return responseHandler.error(res, error);
    }
}

exports.registerUser = async (req, res) => {
    try {
        await connectToDatabase();

        const { firstName, lastName, displayName, email, password } = req.body;

        if (!firstName || !lastName || !displayName || !email || !password) {
            return responseHandler.validationError(res, "All fields are required.");
        }

        const existingUser = await User.findOne({ email: email, isDeleted: false });
        if (existingUser) {
            return responseHandler.validationError(res, "Email already Registered. Please login your account");
        }

        const existingUsername = await User.findOne({ username: displayName, isDeleted: false });
        if (existingUsername) {
            return responseHandler.validationError(res, "Username already exists. Please choose a different one.");
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const fullName = `${firstName} ${lastName}`;

        const user = new User({
            fullName,
            username: displayName,
            email,
            password: hashedPassword,
        });

        const savedUser = await user.save();

        return responseHandler.success(res, savedUser, "User registered successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.login = async (req, res) => {
    try {
        await connectToDatabase();
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return responseHandler.validationError(res, "Invalid Email");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return responseHandler.validationError(res, "Your password is incorrect");
        }

        const payload = await tokenPayload(user)
        await generateTokens(payload, res, user);

        req.session.user = user;

        return responseHandler.success(res, user, "LoggedIn Successfully");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        await connectToDatabase();

        const users = await User.find({ isDeleted: false });

        return responseHandler.success(res, users, "Users fetched successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.updateUser = async (req, res) => {
    try {
        await connectToDatabase();

        const userId = req.params.id;
        const { firstName, lastName, displayName, email, password } = req.body;

        const updateData = {};

        if (firstName && lastName) {
            updateData.fullName = `${firstName} ${lastName}`;
        }

        if (displayName) updateData.username = displayName;
        if (email) updateData.email = email;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, isDeleted: false },
            { $set: updateData },
            { new: true }
        );

        if (!updatedUser) {
            return responseHandler.notFound(res, "User not found or already deleted.");
        }

        return responseHandler.success(res, updatedUser, "User updated successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await connectToDatabase();

        const userId = req.params.id;

        const deletedUser = await User.findOneAndUpdate(
            { _id: userId, isDeleted: false },
            { $set: { isDeleted: true } },
            { new: true }
        );

        if (!deletedUser) {
            return responseHandler.notFound(res, "User not found or already deleted.");
        }

        return responseHandler.success(res, deletedUser, "User deleted successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.getUserById = async (req, res) => {
    try {
        await connectToDatabase();

        const userId = req.params.id;

        const user = await User.findOne({ _id: userId, isDeleted: false });

        if (!user) {
            return responseHandler.notFound(res, "User not found.");
        }

        return responseHandler.success(res, user, "User fetched successfully.");
    } catch (error) {
        console.error(error);
        return responseHandler.error(res, error);
    }
};

exports.logout = async (req, res) => {
    try {
        // Check if the user is logged in through the session
        if (req.session.user) {
            const userId = req.session.user._id;

            // Destroy the session and clear cookies
            req.session.destroy(async (err) => {
                if (err) {
                    return responseHandler.error(res, "Logout failed. Try again later.");
                }

                // Clear cookies for session, jwt, and refresh token
                res.clearCookie('connect.sid');
                res.clearCookie('jwt');
                res.clearCookie('refreshToken');

                // Find the user and clear the refresh token from their record
                try {
                    const user = await User.findById(userId);
                    if (user) {
                        user.refreshToken = null;
                        await user.save();
                    }

                    // Send a success response after the user is logged out and tokens are cleared
                    return responseHandler.success(res, null, "Successfully logged out.");
                } catch (userError) {
                    return responseHandler.error(res, "Logout failed. Please try again later.");
                }
            });
        } else {
            // If no user is logged in, return a validation error
            return responseHandler.validationError(res, "No user is logged in.");
        }
    } catch (error) {
        // Catch any other errors that occur during the logout process
        console.error(error);
        return responseHandler.error(res, "An error occurred during logout. Please try again.");
    }
};

exports.refreshToken = async (req, res) => {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
        return responseHandler.unauthorized(res, {}, "Refresh token is missing");
    }

    try {
        const decoded = await verifyToken(refreshToken)
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return responseHandler.unauthorized(res, {}, "Invalid refresh token");
        }

        // Generate new access token
        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

        // Update and save new refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        responseHandler.success(res, {}, "Set new refresh token successfully");
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};


