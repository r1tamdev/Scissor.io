import express from 'express';
import bcrypt from 'bcryptjs';
import Url from '../models/url.js';
import Click from '../models/click.js';
import { nanoid } from 'nanoid';

const router = express.Router();

// ── Shorten URL ──────────────────────────────────────────
router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl, expiresIn, password } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ error: "Original URL is required" });
    }
    try {
      new URL(originalUrl);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    // Generate unique shortId
    let shortId;
    let exists = true;
    while (exists) {
      shortId = nanoid(7);
      exists = await Url.findOne({ shortId });
    }

    // Calculate expiry date
    let expiresAt = null;
    if (expiresIn && expiresIn !== "never") {
      const now = new Date();
      const durations = {
        "1h": 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      };

      // Presets first
      if (durations[expiresIn]) {
        expiresAt = new Date(now.getTime() + durations[expiresIn]);
      } else {
        // Custom format: <amount><unit>, where unit is s/m/h/d
        // Example: 10s, 15m, 2h, 3d
        const match = /^(\d+)([smhd])$/.exec(expiresIn);
        if (match) {
          const amount = Number(match[1]);
          const unit = match[2];
          const unitMs = unit === "s"
            ? 1000
            : unit === "m"
              ? 60 * 1000
              : unit === "h"
                ? 60 * 60 * 1000
                : 24 * 60 * 60 * 1000;

          if (Number.isFinite(amount) && amount > 0) {
            expiresAt = new Date(now.getTime() + amount * unitMs);
          }
        }
      }
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const url = await Url.create({
      shortId,
      originalUrl,
      expiresAt,
      password: hashedPassword,
    });

    res.json({
      shortId: url.shortId,
      shortUrl: `${process.env.BASE_URL}/${url.shortId}`,
      expiresAt: url.expiresAt,
      hasPassword: !!url.password,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Redirect (with expiry check + analytics logging) ─────
router.get("/:shortId", async (req, res) => {
  try {
    const { shortId } = req.params;
    const url = await Url.findOne({ shortId });

    if (!url) return res.status(404).json({ error: "URL not found" });

    // Check expiry
    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).send(getExpiredPage());
    }

    // If password-protected, serve unlock page
    if (url.password) {
      return res.send(getPasswordPage(shortId));
    }

    // Log click analytics
    const ua = req.headers["user-agent"] || "";
    const device = /mobile/i.test(ua) ? "mobile" : /tablet/i.test(ua) ? "tablet" : "desktop";
    await Click.create({
      shortId,
      referrer: req.headers.referer || "Direct",
      userAgent: ua,
      device,
    });

    url.clicks += 1;
    await url.save();

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Verify password ──────────────────────────────────────
router.post("/:shortId/verify", async (req, res) => {
  try {
    const { shortId } = req.params;
    const { password } = req.body;
    const url = await Url.findOne({ shortId });

    if (!url) return res.status(404).json({ error: "URL not found" });

    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({ error: "This link has expired" });
    }

    if (!url.password) {
      // No password needed — just redirect
      return res.json({ redirectUrl: url.originalUrl });
    }

    const valid = await bcrypt.compare(password || "", url.password);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Log click analytics
    const ua = req.headers["user-agent"] || "";
    const device = /mobile/i.test(ua) ? "mobile" : /tablet/i.test(ua) ? "tablet" : "desktop";
    await Click.create({
      shortId,
      referrer: req.headers.referer || "Direct",
      userAgent: ua,
      device,
    });

    url.clicks += 1;
    await url.save();

    res.json({ redirectUrl: url.originalUrl });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Update password (add/change/remove) ───────────────────
router.put("/:shortId/password", async (req, res) => {
  try {
    const { shortId } = req.params;
    const { password } = req.body || {};

    const url = await Url.findOne({ shortId });
    if (!url) return res.status(404).json({ error: "URL not found" });

    if (url.expiresAt && url.expiresAt < new Date()) {
      return res.status(410).json({ error: "This link has expired" });
    }

    const next = typeof password === "string" ? password.trim() : "";

    if (!next) {
      url.password = null;
      await url.save();
      return res.json({ hasPassword: false });
    }

    url.password = await bcrypt.hash(next, 10);
    await url.save();
    return res.json({ hasPassword: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Analytics endpoint ───────────────────────────────────
router.get("/:shortId/analytics", async (req, res) => {
  try {
    const { shortId } = req.params;
    const url = await Url.findOne({ shortId });

    if (!url) return res.status(404).json({ error: "URL not found" });

    const clicks = await Click.find({ shortId }).sort({ timestamp: -1 });

    const totalClicks = clicks.length;
    const devices = { desktop: 0, mobile: 0, tablet: 0 };
    const referrers = {};
    const dailyClicks = {};

    // Build last 7 days template
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dailyClicks[key] = 0;
    }

    clicks.forEach((click) => {
      // Device counts
      devices[click.device] = (devices[click.device] || 0) + 1;

      // Referrer counts
      let ref = "Direct";
      if (click.referrer && click.referrer !== "Direct") {
        try {
          ref = new URL(click.referrer).hostname;
        } catch {
          ref = click.referrer;
        }
      }
      referrers[ref] = (referrers[ref] || 0) + 1;

      // Daily clicks
      const day = click.timestamp.toISOString().split("T")[0];
      if (dailyClicks[day] !== undefined) {
        dailyClicks[day]++;
      }
    });

    // Sort referrers by count
    const sortedReferrers = Object.entries(referrers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalClicks,
      devices,
      referrers: sortedReferrers,
      dailyClicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      hasPassword: !!url.password,
      originalUrl: url.originalUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ── Password gate HTML page ──────────────────────────────
function getPasswordPage(shortId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scissor.io — Unlock Link</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #0A0A0F;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .bg-orb {
      position: fixed; top: -30%; left: -15%; width: 60%; height: 60%;
      background: radial-gradient(circle, rgba(244,166,35,0.07) 0%, transparent 70%);
      animation: drift 18s ease-in-out infinite;
    }
    @keyframes drift {
      0%,100% { transform: translate(0,0); }
      50% { transform: translate(40px,-30px); }
    }
      #eye-btn {
  background: transparent;
  border: none;
  padding: 10px 12px;
  color: #6B6B80;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
  border-radius: 8px;
  transition: color 0.2s;
  box-shadow: none;
}
#eye-btn:hover {
  color: #fff;
  filter: none;
  box-shadow: none;
  transform: none;
}
    .card {
      position: relative; z-index: 2;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      max-width: 420px; width: 90%;
      text-align: center;
      backdrop-filter: blur(20px);
    }
    .card::before {
      content: ''; position: absolute; top:0; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, #F4A623, transparent);
    }
    .lock-icon {
      width: 64px; height: 64px; margin: 0 auto 1.5rem;
      background: rgba(244,166,35,0.15);
      border: 1px solid rgba(244,166,35,0.3);
      border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    .lock-icon svg { color: #F4A623; }
    h1 { font-family: 'Outfit', sans-serif; font-size: 1.6rem; font-weight: 800; margin-bottom: .5rem; }
    .subtitle { color: #A0A0B8; font-size: .9rem; margin-bottom: 2rem; }
    .input-wrap {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px; padding: 6px;
      display: flex; gap: 6px;
      align-items: center;
      overflow: hidden; /* keep button/background fully inside rounded container */
      transition: border-color .25s, box-shadow .25s;
    }
    .input-wrap:focus-within {
      border-color: rgba(244,166,35,0.6);
      box-shadow: 0 0 0 4px rgba(244,166,35,0.15);
    }
    input {
      flex: 1; background: transparent; border: none; outline: none;
      color: #fff; font-family: 'Inter', sans-serif; font-size: 1rem;
      padding: 14px 14px;
      min-width: 0;
    }
    input::placeholder { color: #6B6B80; }
    button {
  padding: 10px 22px;
  background: linear-gradient(135deg, #F4A623, #E8961C);
  color: #0A0A0F; border: none; border-radius: 10px;
  font-family: 'Inter', sans-serif; font-size: .9rem; font-weight: 700;
  cursor: pointer; transition: all .25s; white-space: nowrap;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  align-self: stretch;
}
    button:hover { filter: brightness(1.05); box-shadow: 0 0 0 4px rgba(244,166,35,0.15); }
    button:active { filter: brightness(0.98); }
    .error {
      color: #ef4444; font-size: .85rem; margin-top: 1rem;
      min-height: 1.2em;
    }
    .brand {
      margin-top: 2rem; font-family: 'Outfit', sans-serif;
      font-size: .85rem; color: #6B6B80; font-weight: 700;
    }
    .brand span { color: #F4A623; }
  </style>
</head>
<body>
  <div class="bg-orb"></div>
  <div class="card">
    <div class="lock-icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    </div>
    <h1>This link is protected</h1>
    <p class="subtitle">Enter the password to continue to the destination</p>
    <form id="form">
      <div class="input-wrap">
  <input type="password" id="pw" placeholder="Enter password…" autocomplete="off" autofocus />
  <button type="button" id="eye-btn" onclick="togglePw()">
    <svg id="eye-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  </button>
  <button type="submit">Unlock</button>
      </div>
      <div class="error" id="err"></div>
    </form>
    <div class="brand">Scissor<span>.io</span></div>
  </div>
  <script>
    document.getElementById('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('pw').value;
      const err = document.getElementById('err');
      err.textContent = '';
      try {
        const res = await fetch('/${shortId}/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw }),
        });
        const data = await res.json();
        if (res.ok && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          err.textContent = data.error || 'Incorrect password';
        }
      } catch {
        err.textContent = 'Something went wrong. Try again.';
      }
    });
    function togglePw() {
  const input = document.getElementById('pw');
  const icon = document.getElementById('eye-icon');
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  if (isPassword) {
    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
  } else {
    icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
  }
}
  </script>
</body>
</html>`;
}

function getExpiredPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Link Expired — Scissor.io</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Outfit:wght@700;800;900&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0A0A0F;
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .bg-orb {
      position: fixed; top: -30%; left: -15%; width: 60%; height: 60%;
      background: radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%);
      animation: drift 18s ease-in-out infinite;
    }
    @keyframes drift {
      0%,100% { transform: translate(0,0); }
      50% { transform: translate(40px,-30px); }
    }
    .card {
      position: relative; z-index: 2;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 3rem 2.5rem;
      max-width: 420px; width: 90%;
      text-align: center;
      backdrop-filter: blur(20px);
    }
    .card::before {
      content: ''; position: absolute; top:0; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, #ef4444, transparent);
    }
    .icon {
      width: 72px; height: 72px;
      margin: 0 auto 1.5rem;
      background: rgba(239,68,68,0.12);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
    }
    .icon svg { color: #ef4444; }
    h1 { font-family: 'Outfit', sans-serif; font-size: 1.8rem; font-weight: 800; margin-bottom: 0.75rem; }
    p { color: #A0A0B8; font-size: 0.95rem; line-height: 1.7; margin-bottom: 2rem; }
    a {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 28px;
      background: linear-gradient(135deg, #F4A623, #E8961C);
      color: #0A0A0F; border-radius: 999px;
      font-weight: 700; font-size: 0.95rem;
      text-decoration: none; transition: all 0.2s;
    }
    a:hover { transform: translateY(-2px); box-shadow: 0 4px 30px rgba(244,166,35,0.3); }
    .brand { margin-top: 2rem; font-family: 'Outfit', sans-serif; font-size: 0.85rem; color: #6B6B80; font-weight: 700; }
    .brand span { color: #F4A623; }
  </style>
</head>
<body>
  <div class="bg-orb"></div>
  <div class="card">
    <div class="icon">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    </div>
    <h1>Link Expired</h1>
    <p>This link has expired and is no longer accessible.<br/>Create a new shortened link to share.</p>
    <a href="${process.env.BASE_URL}">Create New Link →</a>
    <div class="brand">Scissor<span>.io</span></div>
  </div>
</body>
</html>`;
}

export default router;