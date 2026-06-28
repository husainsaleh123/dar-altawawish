import nodemailer from 'nodemailer';

function getEmailConfig() {
  const user = process.env.EMAIL_USER
    || process.env.GMAIL_USER
    || process.env.CONTACT_EMAIL_USER
    || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS
    || process.env.GMAIL_APP_PASSWORD
    || process.env.CONTACT_EMAIL_PASS
    || process.env.SMTP_PASS;
  const service = process.env.EMAIL_SERVICE
    || process.env.CONTACT_EMAIL_SERVICE
    || 'gmail';
  const from = process.env.EMAIL_FROM || user;
  const normalizedService = String(service || 'gmail').trim();
  const normalizedPass = String(pass || '').trim();

  return {
    user: String(user || '').trim(),
    pass: normalizedService.toLowerCase() === 'gmail'
      ? normalizedPass.replace(/\s+/g, '')
      : normalizedPass,
    service: normalizedService,
    from: String(from || '').trim()
  };
}

function requireEmailConfig() {
  const config = getEmailConfig();

  if (!config.user || !config.pass) {
    throw new Error('Email service is not configured. Set EMAIL_USER and EMAIL_PASS in .env, then restart the server.');
  }

  return config;
}

function createTransporter() {
  const config = requireEmailConfig();

  return nodemailer.createTransport({
    service: config.service,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendEmail({ to, replyTo, subject, text, html }) {
  const config = requireEmailConfig();
  const transporter = createTransporter();

  try {
    return await transporter.sendMail({
      from: config.from,
      to,
      replyTo,
      subject,
      text,
      html
    });
  } catch (error) {
    throw normalizeEmailError(error);
  }
}

export async function sendVerificationEmail({ to, name, verificationUrl }) {
  const safeName = String(name || 'there').trim();
  const safeUrl = String(verificationUrl || '').trim();

  if (!to || !safeUrl) {
    throw new Error('Verification email requires a recipient and verification URL.');
  }

  return sendEmail({
    to,
    subject: 'Verify your Dar Altawawish email',
    text: [
      `Hi ${safeName},`,
      '',
      'Please verify your email address to finish setting up your Dar Altawawish account:',
      safeUrl,
      '',
      'If you did not create this account, you can ignore this email.'
    ].join('\n'),
    html: [
      `<p>Hi ${escapeHtml(safeName)},</p>`,
      '<p>Please verify your email address to finish setting up your Dar Altawawish account.</p>',
      `<p><a href="${escapeHtml(safeUrl)}">Verify email address</a></p>`,
      '<p>If you did not create this account, you can ignore this email.</p>'
    ].join('')
  });
}

export async function sendRegistrationApprovalEmail({ to, name, approvalUrl }) {
  const safeName = String(name || 'there').trim();
  const safeUrl = String(approvalUrl || '').trim();

  if (!to || !safeUrl) {
    throw new Error('Registration approval email requires a recipient and approval URL.');
  }

  return sendEmail({
    to,
    subject: 'Approve your Dar Altawawish registration',
    text: [
      `Hi ${safeName},`,
      '',
      'A Dar Altawawish account registration was requested using this email address.',
      'Approve the registration here:',
      safeUrl,
      '',
      'If you did not request this account, ignore this email and no account will be created.'
    ].join('\n'),
    html: [
      `<p>Hi ${escapeHtml(safeName)},</p>`,
      '<p>A Dar Altawawish account registration was requested using this email address.</p>',
      '<p>No account will be created unless you approve it.</p>',
      `<p><a href="${escapeHtml(safeUrl)}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#1c0094;color:#ffffff;text-decoration:none;font-weight:700;">Yes, approve</a></p>`,
      '<p>If you did not request this account, ignore this email and no account will be created.</p>'
    ].join('')
  });
}

export async function sendRegistrationCodeEmail({ to, name, code }) {
  const safeName = String(name || 'there').trim();
  const safeCode = String(code || '').trim();

  if (!to || !/^\d{4}$/.test(safeCode)) {
    throw new Error('Registration verification email requires a recipient and a 4-digit code.');
  }

  return sendEmail({
    to,
    subject: 'Your Dar Altawawish verification code',
    text: [
      `Hi ${safeName},`,
      '',
      `Your Dar Altawawish verification code is: ${safeCode}`,
      '',
      'This code expires in 10 minutes. Do not share it with anyone.',
      'If you did not request this account, you can ignore this email.'
    ].join('\n'),
    html: [
      `<p>Hi ${escapeHtml(safeName)},</p>`,
      '<p>Enter this code to finish creating your Dar Altawawish account:</p>',
      `<p style="margin:24px 0;font-size:32px;font-weight:800;letter-spacing:10px;color:#1c0094;">${escapeHtml(safeCode)}</p>`,
      '<p>This code expires in 10 minutes. Do not share it with anyone.</p>',
      '<p>If you did not request this account, you can ignore this email.</p>'
    ].join('')
  });
}

export async function sendPasswordResetCodeEmail({ to, name, code }) {
  const safeName = String(name || 'there').trim();
  const safeCode = String(code || '').trim();

  if (!to || !/^\d{4}$/.test(safeCode)) {
    throw new Error('Password reset email requires a recipient and a 4-digit code.');
  }

  return sendEmail({
    to,
    subject: 'Your Dar Altawawish password reset code',
    text: [
      `Hi ${safeName},`,
      '',
      `Your password reset code is: ${safeCode}`,
      '',
      'This code expires in 10 minutes. Do not share it with anyone.',
      'If you did not request a password reset, you can ignore this email.'
    ].join('\n'),
    html: [
      `<p>Hi ${escapeHtml(safeName)},</p>`,
      '<p>Enter this code to reset your Dar Altawawish password:</p>',
      `<p style="margin:24px 0;font-size:32px;font-weight:800;letter-spacing:10px;color:#1c0094;">${escapeHtml(safeCode)}</p>`,
      '<p>This code expires in 10 minutes. Do not share it with anyone.</p>',
      '<p>If you did not request a password reset, you can ignore this email.</p>'
    ].join('')
  });
}

export function isEmailServiceConfigured() {
  const config = getEmailConfig();
  return Boolean(config.user && config.pass);
}

function normalizeEmailError(error) {
  const message = String(error?.message || '');
  const response = String(error?.response || '');
  const combined = `${message} ${response}`.toLowerCase();

  if (
    error?.code === 'EAUTH'
    || combined.includes('application-specific password')
    || combined.includes('invalid login')
    || combined.includes('invalidsecondfactor')
  ) {
    return new Error('Email could not be sent. Gmail requires an App Password for this sender account. Please update the Gmail App Password in .env and restart the server.');
  }

  return new Error('Email could not be sent. Please check the email service settings and try again.');
}
