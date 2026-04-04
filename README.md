# ✂️ Scissor.io — URL Shortener

> Transform long, unwieldy URLs into clean, shareable links in seconds. Generate QR codes and take control of your links.

---

## 🚀 Features

- 🔗 **URL Shortening** — Instantly convert long URLs into short, shareable links
- 📱 **QR Code Generation** — Auto-generate QR codes for every shortened link
- 🌙 **Dark Mode UI** — Clean, modern dark-themed interface
- ⚡ **Fast & Lightweight** — Built with Vite + React for blazing-fast performance
- 🗄️ **MongoDB Backend** — Persistent storage for all your links

---

## 🛠️ Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React, Vite, Tailwind CSS |
| Backend    | Node.js, Express.js     |
| Database   | MongoDB (Mongoose)      |
| QR Code    | `qrcode` / `react-qr-code` |

---

## 📁 Project Structure

URL-SHORTENER/
├── backend/
│   ├── models/
│   │   └── url.js              # Mongoose schema for URL documents
│   ├── routes/
│   │   └── url.js              # Express route handlers (shorten, redirect)
│   ├── node_modules/
│   ├── .env                    # Environment variables (PORT, MONGO_URI, BASE_URL)
│   ├── package.json
│   ├── package-lock.json
│   └── server.js               # Express app entry point
│
└── frontend/
    ├── node_modules/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Features.jsx    # Features section component
    │   │   ├── Hero.jsx        # Hero section with URL input
    │   │   ├── Navbar.jsx      # Top navigation bar
    │   │   ├── ResultCard.jsx  # Displays shortened URL + QR code
    │   │   └── Stats.jsx       # Stats/metrics display component
    │   ├── App.jsx             # Root component, routing setup
    │   ├── index.css           # Global styles / Tailwind directives
    │   └── main.jsx            # React DOM entry point
    ├── .env                    # Frontend env variables (VITE_API_URL)
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html              # Vite HTML template
    ├── package.json
    └── package-lock.json
