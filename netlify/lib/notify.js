// Tells the site owner when something important happens (a membership is bought).
// Email: set RESEND_API_KEY (free at resend.com). Goes to NOTIFY_EMAIL, or ADMIN_EMAIL if that is not set.
// Optional MAIL_FROM, e.g. "MRK TRADER <alerts@yourdomain.com>". Also sends a Telegram message if TG_BOT_TOKEN and TG_CHAT_ID are set.
// Never throws: a failed notification must never break a payment.
exports.owner = async (subject, text) => {
  const to = process.env.NOTIFY_EMAIL || process.env.ADMIN_EMAIL, jobs = [];
  if (process.env.RESEND_API_KEY && to) {
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + process.env.RESEND_API_KEY },
      body: JSON.stringify({ from: process.env.MAIL_FROM || 'MRK TRADER <onboarding@resend.dev>', to: [to], subject, text }),
    }).catch(() => {}));
  }
  if (process.env.TG_BOT_TOKEN && process.env.TG_CHAT_ID) {
    jobs.push(fetch(`https://api.telegram.org/bot${process.env.TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: process.env.TG_CHAT_ID, text: subject + '\n\n' + text }),
    }).catch(() => {}));
  }
  await Promise.all(jobs);
};
