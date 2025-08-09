const sendEmail = require('./sendEmail');

const sendSignUpLinkEmail = async (email, signupLink) => {
    const subject = "Complete Your Signup";
    const html = `
            <p>Hello,</p>
            <p>Click the link below to complete your signup:</p>
            <a href="${signupLink}">Complete Signup</a>
            <p>This link will expire in 1 hour.</p>
        `;
    await sendEmail({ to: email, subject, html });
};


module.exports = {
    sendSignUpLinkEmail,
};
