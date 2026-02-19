import nodemailer from 'nodemailer';

function isValidEmail(email = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function sendContactMessage(req, res) {
  try {
    const { name = '', email = '', company = '', subject = '', message = '' } = req.body;

    // Only starred fields are mandatory.
    if (!name.trim() || !email.trim() || !message.trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const toEmail = process.env.CONTACT_EMAIL_TO || process.env.EMAIL_TO || 'dar.altawawish@gmail.com';
    const smtpUser = process.env.CONTACT_EMAIL_USER || process.env.EMAIL_USER || process.env.SMTP_USER;
    const smtpPass = process.env.CONTACT_EMAIL_PASS || process.env.EMAIL_PASS || process.env.SMTP_PASS;
    const smtpService = process.env.CONTACT_EMAIL_SERVICE || process.env.EMAIL_SERVICE || 'gmail';

    if (!smtpUser || !smtpPass) {
      return res.status(500).json({
        error: 'Email service is not configured on the server. Set CONTACT_EMAIL_USER and CONTACT_EMAIL_PASS in .env, then restart the server.'
      });
    }

    const transporter = nodemailer.createTransport({
      service: smtpService,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    await transporter.sendMail({
      from: smtpUser,
      to: toEmail,
      replyTo: email,
      subject: `Contact Form: ${subject.trim() || 'New Inquiry'}`,
      text: [
        `Name: ${name.trim()}`,
        `Email: ${email.trim()}`,
        `Company: ${company.trim() || 'N/A'}`,
        `Subject: ${subject.trim() || 'N/A'}`,
        '',
        'Message:',
        message.trim()
      ].join('\n')
    });

    return res.status(200).json({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    return res.status(500).json({
      error: `Failed to send message. ${error?.message || 'Please try again.'}`
    });
  }
}
