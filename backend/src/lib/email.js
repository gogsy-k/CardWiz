/*
 * Email sending via Resend. RESEND_API_KEY env var zaroori hai.
 * Key missing ho to silently no-op (dev).
 */
'use strict';

let resend = null;

function getResend() {
  if (!resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) return null;
    const { Resend } = require('resend');
    resend = new Resend(key);
  }
  return resend;
}

function fmtINR(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

function monthName(date) {
  return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

function buildEmailHtml({ name, month, totalSpend, actualRewards, missed, topCategory }) {
  const topMissSection = topCategory
    ? `<div style="background:#fff8ed;border-radius:10px;padding:14px 16px;margin:16px 0">
        <div style="font-size:11px;color:#b45309;font-weight:700;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px">Biggest opportunity</div>
        <div style="font-size:14px;color:#0C1018">
          <strong>${topCategory.category.replace(/_/g, ' ')}</strong> — use
          <strong>${topCategory.betterCardName || 'a better card'}</strong> to earn
          ${topCategory.rateIfUsed}% instead of your current card.
        </div>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <div style="background:#0C1018;border-radius:16px 16px 0 0;padding:28px 24px;text-align:center">
      <div style="font-size:32px">💳</div>
      <div style="color:#818CF8;font-size:22px;font-weight:900;margin-top:6px;letter-spacing:-0.5px">CardWiz</div>
      <div style="color:#B7C0D4;font-size:13px;margin-top:4px">Monthly Report · ${month}</div>
    </div>

    <div style="background:#ffffff;padding:28px 24px;border-radius:0 0 16px 16px">
      <p style="color:#0C1018;font-size:16px;margin:0 0 6px 0">Hi ${name},</p>
      <p style="color:#64748B;font-size:14px;line-height:1.6;margin:0 0 20px 0">
        Here's your CardWiz spending summary for <strong>${month}</strong>.
      </p>

      <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:20px">
        <tr>
          <td style="width:33%;padding:14px 12px;background:#f8f8ff;border-radius:10px;text-align:center;vertical-align:top">
            <div style="font-size:20px;font-weight:900;color:#0C1018">${fmtINR(totalSpend)}</div>
            <div style="font-size:11px;color:#888;margin-top:3px">Total Spend</div>
          </td>
          <td style="width:12px"></td>
          <td style="width:33%;padding:14px 12px;background:#f0fff4;border-radius:10px;text-align:center;vertical-align:top">
            <div style="font-size:20px;font-weight:900;color:#16a34a">${fmtINR(actualRewards)}</div>
            <div style="font-size:11px;color:#888;margin-top:3px">Rewards Earned</div>
          </td>
          <td style="width:12px"></td>
          <td style="width:33%;padding:14px 12px;background:#fff5f5;border-radius:10px;text-align:center;vertical-align:top">
            <div style="font-size:20px;font-weight:900;color:#dc2626">${fmtINR(missed)}</div>
            <div style="font-size:11px;color:#888;margin-top:3px">Left on Table</div>
          </td>
        </tr>
      </table>

      ${topMissSection}

      <div style="text-align:center;margin:28px 0 20px">
        <a href="https://cardwiz.in/account/savings"
           style="background:#6366F1;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;display:inline-block">
          View Full Report →
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">

      <p style="font-size:11px;color:#aaa;text-align:center;line-height:1.7;margin:0">
        You're receiving this because you opted in to monthly reports.<br>
        <a href="https://cardwiz.in/account" style="color:#aaa;text-decoration:underline">Manage preferences</a>
        &nbsp;·&nbsp;
        <a href="https://cardwiz.in" style="color:#aaa;text-decoration:underline">CardWiz</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

async function sendMonthlyReport({ to, name, reportData, forMonth }) {
  const client = getResend();
  if (!client) {
    console.log(`[email] RESEND_API_KEY missing — skipping email to ${to}`);
    return { skipped: true };
  }

  const month = monthName(forMonth);
  const topCategory = (reportData.byCategory || [])[0] || null;

  const html = buildEmailHtml({
    name,
    month,
    totalSpend: reportData.totalSpend,
    actualRewards: reportData.actualRewards,
    missed: reportData.missed,
    topCategory,
  });

  const result = await client.emails.send({
    from: 'CardWiz <reports@cardwiz.in>',
    to,
    subject: `Your CardWiz Report — ${month}`,
    html,
  });

  return result;
}

function buildOfferAlertHtml({ name, keyword, title, excerpt, link }) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px">

    <div style="background:#0C1018;border-radius:16px 16px 0 0;padding:24px;text-align:center">
      <div style="font-size:30px">🏷️</div>
      <div style="color:#818CF8;font-size:20px;font-weight:900;margin-top:6px;letter-spacing:-0.5px">CardWiz</div>
      <div style="color:#B7C0D4;font-size:13px;margin-top:4px">Offer Alert</div>
    </div>

    <div style="background:#ffffff;padding:28px 24px;border-radius:0 0 16px 16px">
      <p style="color:#0C1018;font-size:16px;margin:0 0 6px 0">Hi ${name},</p>
      <p style="color:#64748B;font-size:14px;line-height:1.6;margin:0 0 18px 0">
        Aapke watchlist keyword <strong style="color:#0C1018">"${keyword}"</strong> se ek naya offer match hua hai:
      </p>

      <div style="background:#f8f8ff;border-radius:10px;padding:16px;margin-bottom:20px">
        <div style="font-size:16px;font-weight:800;color:#0C1018">${title}</div>
        ${excerpt ? `<div style="font-size:13px;color:#64748B;margin-top:6px;line-height:1.6">${excerpt}</div>` : ''}
      </div>

      <div style="text-align:center;margin:24px 0 18px">
        <a href="https://cardwiz.in${link}"
           style="background:#6366F1;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:900;font-size:14px;display:inline-block">
          Offer dekho →
        </a>
      </div>

      <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
      <p style="font-size:11px;color:#aaa;text-align:center;line-height:1.7;margin:0">
        Aapko ye isliye mila kyunki aapne "${keyword}" ko watchlist mein add kiya tha.<br>
        <a href="https://cardwiz.in/account" style="color:#aaa;text-decoration:underline">Manage watchlist</a>
        &nbsp;·&nbsp;
        <a href="https://cardwiz.in" style="color:#aaa;text-decoration:underline">CardWiz</a>
      </p>
    </div>

  </div>
</body>
</html>`;
}

async function sendOfferAlert({ to, name, post, keyword }) {
  const client = getResend();
  if (!client) {
    console.log(`[email] RESEND_API_KEY missing — skipping offer alert to ${to}`);
    return { skipped: true };
  }

  const html = buildOfferAlertHtml({
    name: name || 'there',
    keyword,
    title: post.title,
    excerpt: post.excerpt || '',
    link: post.slug ? `/news/${post.slug}` : '/news',
  });

  return client.emails.send({
    from: 'CardWiz <reports@cardwiz.in>',
    to,
    subject: `🏷️ New offer matching "${keyword}" — CardWiz`,
    html,
  });
}

module.exports = { sendMonthlyReport, sendOfferAlert };
