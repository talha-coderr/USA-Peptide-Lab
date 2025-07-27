const sendEmail = require('./sendEmail');
const OTP = require(`${__models}/otpModel`)
const { connectToDatabase, disconnectFromDatabase, startIdleTimer } = require(`${__config}/dbConn`)

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email) => {
    await connectToDatabase();
    const otp = generateOTP();
    const subject = "Password Reset OTP";
    const text = `Your OTP for password reset is: ${otp}`;
    const html = `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`;

    await OTP.deleteMany({ email });

    await sendEmail({ to: email, subject, text, html });
    await OTP.create({ email, otp, createdAt: new Date() });
};


























module.exports = {
    sendSignUpEmail,
    sendOTPEmail,
    sendAnnouncementsEmail,
    sendWhatsAppMessageToAll,
    sendAddUserEmail,
    sendPasswordChangeEmail,
    sendUpdateUserDetailsEmail,
    sendDeleteUserEmail,
    sendCourseEnrollmentEmail,
    sendAccessRevocationEmail,
    sendAccessRestorationEmail,
    sendExamReminderEmail,
    sendPassedExamEmail,
    sendAssignmentGradeEmail,
    sendExamEmail,
    sendCertificateEmail,
    sendCourseDeletionEmail,
    sendInactivityGreetingEmail,
    sendInactivityWarning1Email,
    sendInactivityWarning2Email,
    sendEnrollmentRemovedEmail,
};
