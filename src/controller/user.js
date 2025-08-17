const User = require(`${__models}/users`);
const { responseHandler } = require(`${__utils}/responseHandler`);
const {
  connectToDatabase,
  disconnectFromDatabase,
  startIdleTimer,
} = require(`${__config}/dbConn`);
const bcrypt = require("bcrypt");
const {
  generateTokens,
  verifyToken,
  tokenPayload,
} = require(`${__utils}/helper.js`);
const { sendSignUpLinkEmail } = require(`${__utils}/sendEmailTemp.js`);
const crypto = require("crypto");
const SignupToken = require(`${__models}/signupTokenModel`);

exports.helloWorld = async (req, res) => {
  try {
    await connectToDatabase();
    return responseHandler.success(res, "Hello From User Route");
  } catch (error) {
    console.log(error);
    return responseHandler.error(res, error);
  }
};

exports.sendSignupLink = async (req, res) => {
  try {
    const { email } = req.body;

    await connectToDatabase();

    // Check if already registered
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (existingUser) {
      return responseHandler.validationError(
        res,
        "Email already registered. Please log in."
      );
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");

    // Save token in DB with expiry
    await SignupToken.deleteMany({ email }); // Remove old tokens
    await SignupToken.create({
      email,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    // Signup link
    const signupLink = `https://usa-peptides.vercel.app/complete-signup${token}/${email}`;

    await sendSignUpLinkEmail(email, signupLink);

    return responseHandler.success(
      res,
      null,
      "Signup link sent to your email. Please use the link to set your password and complete your registration."
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};

exports.completeSignup = async (req, res) => {
  try {
    const { email, token } = req.params;
    const { password } = req.body;

    await connectToDatabase();

    // Find token in DB
    const tokenData = await SignupToken.findOne({ email, token });
    if (!tokenData) {
      return responseHandler.validationError(res, "Invalid or expired token.");
    }

    // Check expiry
    if (new Date() > tokenData.expiresAt) {
      await SignupToken.deleteOne({ _id: tokenData._id });
      return responseHandler.validationError(
        res,
        "Token expired. Please request a new signup link."
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      fullName: "",
      username: email.split("@")[0],
      email,
      password: hashedPassword,
      isActive: true,
      isDeleted: false,
    });
    const savedUser = await user.save();

    // Delete token after signup
    await SignupToken.deleteOne({ _id: tokenData._id });

    return responseHandler.success(
      res,
      savedUser,
      "Signup completed successfully."
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};

exports.accountDetails = async (req, res) => {
  try {
    await connectToDatabase();

    const userId = req.user._id;
    const {
      firstName,
      lastName,
      displayName,
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = req.body;

    // Check name fields
    if (!firstName || !lastName) {
      return responseHandler.validationError(
        res,
        "First and last name are required."
      );
    }

    // Check display name
    if (!displayName) {
      return responseHandler.validationError(res, "Display name is required.");
    }
    const existingUsername = await User.findOne({
      username: displayName,
      _id: { $ne: userId }, // Ignore the current user's own username
      isDeleted: false,
    });
    if (existingUsername) {
      return responseHandler.validationError(
        res,
        "Display name already exists. Please choose a different one."
      );
    }

    // Password change validations
    const passwordFields = [currentPassword, newPassword, confirmNewPassword];
    const anyPasswordProvided = passwordFields.some(
      (field) => field && field.trim() !== ""
    );
    const allPasswordProvided = passwordFields.every(
      (field) => field && field.trim() !== ""
    );

    if (anyPasswordProvided && !allPasswordProvided) {
      return responseHandler.validationError(
        res,
        "Please fill out all password fields."
      );
    }

    let updatedData = {
      fullName: `${firstName} ${lastName}`,
      username: displayName,
    };

    if (allPasswordProvided) {
      // Verify current password
      const user = await User.findById(userId);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return responseHandler.validationError(
          res,
          "Current password is incorrect."
        );
      }

      // Match new password & confirm password
      if (newPassword !== confirmNewPassword) {
        return responseHandler.validationError(
          res,
          "New password and confirm password do not match."
        );
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      updatedData.password = await bcrypt.hash(newPassword, salt);
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    return responseHandler.success(
      res,
      updatedUser,
      "Account details updated successfully."
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies["refreshToken"];
  if (!refreshToken) {
    return responseHandler.unauthorized(res, {}, "Refresh token is missing");
  }

  try {
    const decoded = await verifyToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return responseHandler.unauthorized(res, {}, "Invalid refresh token");
    }

    // Generate new access token
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user
    );

    // Update and save new refresh token
    user.refreshToken = newRefreshToken;
    await user.save();

    responseHandler.success(res, {}, "Set new refresh token successfully");
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

// ===================================
// exports.login = async (req, res) => {
//     try {
//         await connectToDatabase();
//         const { email, password } = req.body;

//         // 1. Check user
//         const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
//         if (!user) return responseHandler.validationError(res, "Invalid Email");
//         if (!user.isActive) return responseHandler.validationError(res, "Account is not active");

//         // 2. Check password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return responseHandler.validationError(res, "Your password is incorrect");

//         // 3. Token payload
//         const payload = await tokenPayload(user);

//         // 4. Generate tokens & set cookies
//         const { accessToken, refreshToken } = await generateTokens(payload, res, user);

//         return responseHandler.success(res, { user, accessToken, refreshToken }, "Logged in successfully");
//     } catch (error) {
//         console.error(error);
//         return responseHandler.error(res, error);
//     }
// };

exports.login = async (req, res) => {
  try {
    await connectToDatabase();
    const { email, password } = req.body;

    // 1. Check user
    const user = await User.findOne({
      email: email.toLowerCase(),
      isDeleted: false,
    });
    if (!user) return responseHandler.validationError(res, "Invalid Email");
    if (!user.isActive)
      return responseHandler.validationError(res, "Account is not active");

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return responseHandler.validationError(res, "Your password is incorrect");

    // 3. Token payload
    const payload = await tokenPayload(user);

    // 4. Generate tokens & set cookies
    const { accessToken, refreshToken } = await generateTokens(
      payload,
      res,
      user
    );

    // 5. Send merged response
    return responseHandler.success(
      res,
      {
        ...user.toObject(),
        accessToken,
        refreshToken,
      },
      "Logged in successfully"
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};
exports.getAllUsers = async (req, res) => {
  try {
    await connectToDatabase();

    // Fetch all non-deleted users
    const users = await User.find({ isDeleted: false }).select(
      "-password -__v"
    );
    // excludes password & version key

    return responseHandler.success(res, users, "Users fetched successfully");
  } catch (error) {
    console.error(error);
    return responseHandler.error(res, error);
  }
};

exports.logout = async (req, res) => {
  try {
    if (!req.user) {
      return responseHandler.validationError(res, "No user is logged in.");
    }

    // Remove refresh token from DB
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    // Clear cookies
    res.clearCookie("jwt", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    return responseHandler.success(res, null, "Successfully logged out.");
  } catch (error) {
    console.error(error);
    return responseHandler.error(
      res,
      "An error occurred during logout. Please try again."
    );
  }
};
