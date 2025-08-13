const sendEmail = require('./sendEmail');

const sendSignUpLinkEmail = async (email, signupLink) => {
    const subject = "Complete Your Signup";
    const html = `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px;">
            <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <h2 style="color: #333333;">Welcome!</h2>
                <p style="font-size: 16px; color: #555555;">Thank you for signing up.</p>
                <p style="font-size: 16px; color: #555555;">Click the button below to complete your signup:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${signupLink}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-size: 16px;">Complete Signup</a>
                </div>
                <p style="font-size: 14px; color: #999999;">This link will expire in 1 hour.</p>
                <p style="font-size: 14px; color: #999999;">If you didn’t request this, you can ignore this email.</p>
            </div>
        </div>
    `;
    await sendEmail({ to: email, subject, html });
};


module.exports = {
    sendSignUpLinkEmail,
};
