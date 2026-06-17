const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // your Gmail address
    pass: process.env.GMAIL_PASS   // Gmail App Password (not your real password)
  }
});

app.post('/contact', async (req, res) => {
  const { from_name, reply_to, subject, message } = req.body;

  // Basic validation
  if (!from_name || !reply_to || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields.' });
  }

  try {
    // Send both emails simultaneously
    await Promise.all([

      // ── EMAIL 1: Admin notification (to you) ──────────────────
      transporter.sendMail({
        from: `"EduAxis Website" <${process.env.GMAIL_USER}>`,
        replyTo: reply_to,
        to: process.env.GMAIL_USER,
        subject: `📩 New Inquiry: ${subject} — from ${from_name}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#000000;padding:28px 40px;text-align:center;">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">🚀 EduAxis</span>
            <p style="margin:6px 0 0;color:#a0a8b8;font-size:13px;letter-spacing:0.5px;">ADMIN NOTIFICATION</p>
          </td>
        </tr>

        <!-- Alert Banner -->
        <tr>
          <td style="background:#86f2e4;padding:14px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;font-weight:600;color:#004d47;letter-spacing:0.3px;">NEW CONTACT FORM SUBMISSION RECEIVED</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 24px;">
            <p style="margin:0 0 24px;font-size:15px;color:#45464d;line-height:1.6;">A new message has been submitted through the website contact form. Details are below.</p>

            <!-- Info Table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e3e5;border-radius:8px;overflow:hidden;">
              <tr style="background:#f7f8f9;">
                <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;letter-spacing:0.8px;width:120px;">Name</td>
                <td style="padding:14px 20px;font-size:14px;color:#191c1e;font-weight:600;">${from_name}</td>
              </tr>
              <tr style="border-top:1px solid #e0e3e5;">
                <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;letter-spacing:0.8px;">Email</td>
                <td style="padding:14px 20px;font-size:14px;"><a href="mailto:${reply_to}" style="color:#006a61;text-decoration:none;font-weight:500;">${reply_to}</a></td>
              </tr>
              <tr style="border-top:1px solid #e0e3e5;background:#f7f8f9;">
                <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;letter-spacing:0.8px;">Subject</td>
                <td style="padding:14px 20px;font-size:14px;color:#191c1e;">${subject}</td>
              </tr>
              <tr style="border-top:1px solid #e0e3e5;">
                <td style="padding:14px 20px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;letter-spacing:0.8px;vertical-align:top;">Message</td>
                <td style="padding:14px 20px;font-size:14px;color:#191c1e;line-height:1.7;white-space:pre-line;">${message}</td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
              <tr>
                <td>
                  <a href="mailto:${reply_to}?subject=Re: ${subject}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:8px;font-size:14px;font-weight:600;">Reply to ${from_name} →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f8f9;border-top:1px solid #e0e3e5;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#76777d;">This is an automated notification from your EduAxis website.</p>
            <p style="margin:6px 0 0;font-size:12px;color:#76777d;">© 2024 EduAxis. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
      }),

      // ── EMAIL 2: Confirmation to the user ────────────────────
      transporter.sendMail({
        from: `"EduAxis" <${process.env.GMAIL_USER}>`,
        to: reply_to,
        subject: `We received your message — EduAxis`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#000000;padding:36px 40px;text-align:center;">
            <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">🚀 EduAxis</span>
            <p style="margin:8px 0 0;color:#a0a8b8;font-size:13px;">Next-Gen School Management</p>
          </td>
        </tr>

        <!-- Hero message -->
        <tr>
          <td style="padding:40px 40px 8px;text-align:center;">
            <div style="width:56px;height:56px;background:#86f2e4;border-radius:50%;margin:0 auto 20px;text-align:center;font-size:26px;line-height:56px;">✓</div>
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#191c1e;letter-spacing:-0.3px;">Message received, ${from_name}!</h1>
            <p style="margin:0;font-size:15px;color:#45464d;line-height:1.7;max-width:420px;margin:0 auto;">Thank you for reaching out. Our team has received your message and will get back to you within <strong style="color:#191c1e;">24 hours</strong>.</p>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:28px 40px 0;"><div style="height:1px;background:#e0e3e5;"></div></td></tr>

        <!-- Summary of what they sent -->
        <tr>
          <td style="padding:24px 40px;">
            <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;letter-spacing:0.8px;">Your message summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e3e5;border-radius:8px;overflow:hidden;">
              <tr style="background:#f7f8f9;">
                <td style="padding:12px 18px;font-size:12px;font-weight:600;color:#76777d;width:90px;">Subject</td>
                <td style="padding:12px 18px;font-size:13px;color:#191c1e;">${subject}</td>
              </tr>
              <tr style="border-top:1px solid #e0e3e5;">
                <td style="padding:12px 18px;font-size:12px;font-weight:600;color:#76777d;vertical-align:top;">Message</td>
                <td style="padding:12px 18px;font-size:13px;color:#45464d;line-height:1.7;white-space:pre-line;">${message}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What happens next -->
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;letter-spacing:0.8px;">What happens next</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding:0 16px 16px 0;width:32px;">
                  <div style="width:28px;height:28px;background:#dae2fd;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:700;color:#3f465c;">1</div>
                </td>
                <td style="padding-bottom:16px;vertical-align:top;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#191c1e;">Our team reviews your inquiry</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#45464d;">We read every message personally and route it to the right person.</p>
                </td>
              </tr>
              <tr>
                <td style="vertical-align:top;padding:0 16px 16px 0;">
                  <div style="width:28px;height:28px;background:#86f2e4;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:700;color:#004d47;">2</div>
                </td>
                <td style="padding-bottom:16px;vertical-align:top;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#191c1e;">You hear back within 24 hours</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#45464d;">We'll reply directly to <a href="mailto:${reply_to}" style="color:#006a61;text-decoration:none;">${reply_to}</a>.</p>
                </td>
              </tr>
              <tr>
                <td style="vertical-align:top;padding:0 16px 0 0;">
                  <div style="width:28px;height:28px;background:#e2dfff;border-radius:50%;text-align:center;line-height:28px;font-size:12px;font-weight:700;color:#3323cc;">3</div>
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0;font-size:14px;font-weight:600;color:#191c1e;">We get your school set up</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#45464d;">If you're ready to onboard, we'll schedule a personalised demo.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 40px;text-align:center;">
            <div style="background:#f7f8f9;border-radius:10px;padding:24px;">
              <p style="margin:0 0 16px;font-size:14px;color:#45464d;">Want early access while you wait?</p>
              <a href="#waitlist" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:600;">Join the Waitlist →</a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f8f9;border-top:1px solid #e0e3e5;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#76777d;">You're receiving this because you contacted us at <strong>rocketlaunch.com</strong></p>
            <p style="margin:6px 0 0;font-size:12px;color:#76777d;">© 2024 EduAxis. All rights reserved.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
  })

]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({ ok: false, error: 'Failed to send email.' });
  }
});

app.post('/waitlist', async (req, res) => {
  const { name, institution, email, role } = req.body;

  if (!name || !institution || !email) {
    return res.status(400).json({ ok: false, error: 'Missing required fields.' });
  }

  try {
    await Promise.all([
      transporter.sendMail({
        from: `"EduAxis Waitlist" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `📝 New Waitlist Signup: ${name}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#000000;padding:28px 40px;text-align:center;">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">🚀 EduAxis</span>
            <p style="margin:6px 0 0;color:#a0a8b8;font-size:13px;letter-spacing:0.5px;">NEW WAITLIST REGISTRATION</p>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px 24px;">
            <p style="margin:0 0 24px;font-size:15px;color:#45464d;line-height:1.6;">A new waitlist submission has arrived. Details are below.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e3e5;border-radius:8px;overflow:hidden;">
              <tr style="background:#f7f8f9;"><td style="padding:14px 20px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;width:150px;">Full Name</td><td style="padding:14px 20px;font-size:14px;color:#191c1e;">${name}</td></tr>
              <tr style="border-top:1px solid #e0e3e5;"><td style="padding:14px 20px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;">Institution</td><td style="padding:14px 20px;font-size:14px;color:#191c1e;">${institution}</td></tr>
              <tr style="border-top:1px solid #e0e3e5;background:#f7f8f9;"><td style="padding:14px 20px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;">Email</td><td style="padding:14px 20px;font-size:14px;"><a href="mailto:${email}" style="color:#006a61;text-decoration:none;font-weight:500;">${email}</a></td></tr>
              <tr style="border-top:1px solid #e0e3e5;"><td style="padding:14px 20px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;">Role</td><td style="padding:14px 20px;font-size:14px;color:#191c1e;">${role || 'Not specified'}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#f7f8f9;border-top:1px solid #e0e3e5;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#76777d;">This email contains all waitlist details from the website form.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      }),
      transporter.sendMail({
        from: `"EduAxis" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `You're on the EduAxis waitlist!`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#000000;padding:36px 40px;text-align:center;">
            <span style="font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">🚀 EduAxis</span>
            <p style="margin:8px 0 0;color:#a0a8b8;font-size:13px;">Waitlist Confirmed</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 8px;text-align:center;">
            <div style="width:56px;height:56px;background:#86f2e4;border-radius:50%;margin:0 auto 20px;text-align:center;font-size:28px;font-weight:700;color:#004d47;line-height:56px;">✓</div>
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#191c1e;letter-spacing:-0.3px;">You're on the waitlist, ${name}!</h1>
            <p style="margin:0;font-size:15px;color:#45464d;line-height:1.7;max-width:420px;margin:0 auto;">We received your submission and our team will contact you soon with the next steps.</p>
          </td>
        </tr>
        <tr><td style="padding:28px 40px 0;"><div style="height:1px;background:#e0e3e5;"></div></td></tr>
        <tr>
          <td style="padding:24px 40px;">
            <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;letter-spacing:0.8px;">Submission summary</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e0e3e5;border-radius:8px;overflow:hidden;">
              <tr style="background:#f7f8f9;"><td style="padding:12px 18px;font-size:12px;font-weight:600;color:#76777d;width:110px;">Full Name</td><td style="padding:12px 18px;font-size:13px;color:#191c1e;">${name}</td></tr>
              <tr style="border-top:1px solid #e0e3e5;"><td style="padding:12px 18px;font-size:12px;font-weight:600;color:#76777d;">Institution</td><td style="padding:12px 18px;font-size:13px;color:#191c1e;">${institution}</td></tr>
              <tr style="border-top:1px solid #e0e3e5;background:#f7f8f9;"><td style="padding:12px 18px;font-size:12px;font-weight:600;color:#76777d;">Email</td><td style="padding:12px 18px;font-size:13px;color:#191c1e;">${email}</td></tr>
              <tr style="border-top:1px solid #e0e3e5;"><td style="padding:12px 18px;font-size:12px;font-weight:600;color:#76777d;">Role</td><td style="padding:12px 18px;font-size:13px;color:#191c1e;">${role || 'Not specified'}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;">
            <p style="margin:0 0 16px;font-size:12px;font-weight:700;color:#76777d;text-transform:uppercase;letter-spacing:0.8px;">What to expect</p>
            <p style="margin:0;font-size:14px;color:#45464d;line-height:1.7;">One of our EduAxis specialists will email you soon to confirm availability and next steps.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f7f8f9;border-top:1px solid #e0e3e5;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#76777d;">EduAxis will contact you about next steps.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
      })
    ]);

    res.json({ ok: true });
  } catch (err) {
    console.error('Waitlist mail error:', err);
    res.status(500).json({ ok: false, error: 'Failed to send waitlist email.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));