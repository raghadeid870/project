const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.SMTP_HOST) {
  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendMail(to, subject, text) {
  if (!transporter) {
    // وضع التطوير: بدون SMTP بنطبع الإيميل بالـ console
    console.log(`[MAIL-DEV] to=${to} | ${subject}\n${text}`);
    return;
  }
  await transporter.sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text });
}

module.exports = { sendMail };
