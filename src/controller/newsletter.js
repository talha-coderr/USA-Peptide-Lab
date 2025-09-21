const Newsletter = require(`${__models}/newsletter`);
const { responseHandler } = require(`${__utils}/responseHandler`);
const sendEmail = require(`${__utils}/sendEmail`);
const { connectToDatabase } = require(`${__config}/dbConn`);

exports.subscribeNewsletter = async (req, res) => {
  try {
    await connectToDatabase();
    const { name, email, phoneNumber, textMe } = req.body;

    if (!name || !email) {
      return responseHandler.validationError(res, "Name and Email required");
    }
    const existingUser = await Newsletter.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return responseHandler.validationError(
        res,
        "You are already subscribed to our newsletter."
      );
    }

    // Save new subscription
    const subscription = new Newsletter({
      name,
      email: email.toLowerCase(),
      phoneNumber,
      textMe: textMe || false,
    });
    await subscription.save();

    // Email Template
    const mailOptions = {
      to: email,
      subject: "Welcome to Core Peptides Newsletter 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <a href="http://localhost:3000/user" target="_blank">
            <img src="http://localhost:5000/newsletter-discount.jpg" alt="Discount Banner" style="width:100%; max-width:600px; border-radius:8px;" />
          </a>
          <h2>Hey ${name},</h2>
          <p>Thank you for joining <strong>Core Peptides</strong>! We're glad you're here.</p>
          <p>Enjoy <strong>10% off</strong> your first order using this code at checkout:</p>
          <h3 style="background:#f3f3f3; padding:10px; display:inline-block; border-radius:5px;">PEP10</h3>
          <br/><br/>
          <a href="http://localhost:3000/user" 
             style="background:#e6007e; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px; font-weight:bold;">
             Start Shopping
          </a>
          <p style="margin-top:20px;">Offer is only valid for the next <strong>48 hours</strong>, so act fast...</p>
          
          <hr/>
          <h3>Learn More in our Blog Articles</h3>
          <a href="http://localhost:3000/user/blog" style="color:#e6007e; font-weight:bold; text-decoration:none;">Visit Blog →</a>
          
          <br/><br/>
          <footer style="margin-top:30px; text-align:center; font-size:12px; color:#888;">
            <img src="http://localhost:5000/footer-logo.png" alt="Logo" width="60" />
            <p>5401 S Kirkman Rd, Suite 310, Orlando, United States, 32819</p>
            <a href="http://localhost:3000/user" style="color:#e6007e;">Unsubscribe</a>
          </footer>
        </div>
      `,
    };

    await sendEmail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Subscribed successfully. Confirmation email sent.",
      data: subscription,
    });
  } catch (error) {
    return responseHandler.error(res, error);
  }
};
