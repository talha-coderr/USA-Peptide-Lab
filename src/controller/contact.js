const Contact = require(`${__models}/contact`);
const { responseHandler } = require(`${__utils}/responseHandler`);
const { sendEmail } = require(`${__utils}/sendEmail`);

const {
  connectToDatabase,
  disconnectFromDatabase,
  startIdleTimer,
} = require(`${__config}/dbConn`);

exports.contactUs = async (req, res) => {
  try {
    await connectToDatabase();
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return responseHandler.validationError(res, "All Fields required");
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    const mailOptions = {
      to: "muhammadhuzaifa7012@gmail.com", // your email
      subject: `New Contact Us Message: ${subject}`,
      text: `You have a new message from ${name} (${email}):\n\n${message}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/> ${message}</p>
      `,
    };

    await sendEmail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Message sent successfully and saved in database",
      data: contact,
    });
  } catch (error) {
    return responseHandler.error(res, error);
  }
};
