const nodemailer = require("nodemailer");

async function sendResetEmail(to, name, tempPassword) {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Flex Password Reset Request",
        text: `Dear ${name},
    
    We received a request to reset your password for Flex. Here is your temporary password:
    
    🔑 ${tempPassword}
    
    Please do not share this password with anyone. For security reasons, we strongly recommend resetting it immediately after logging in.
    
    If you did not request this reset, please ignore this email.
    
    Best regards,  
    Flex Support Team`
    };
    
    await transporter.sendMail(mailOptions);
}

module.exports = sendResetEmail;