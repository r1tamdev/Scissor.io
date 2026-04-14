# ✂️ Scissor.io — URL Shortener

> Transform long, unwieldy URLs into clean, shareable links in seconds. Generate QR codes and take control of your links.


![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)


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

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (or local MongoDB)
- Git



## 📁 Project Structure

**Backend**

1. `backend/`
   a. `models/`
      i. `url.js` — Mongoose schema for URL documents
   b. `routes/`
      i. `url.js` — Express route handlers (shorten, redirect)
   c. `.env` — Environment variables (PORT, MONGO_URI, BASE_URL)
   d. `package.json`
   e. `server.js` — Express app entry point

**Frontend**

2. `frontend/`
   a. `public/`
   b. `src/`
      i. `components/`
         1. `Navbar.jsx` — Top navigation bar
         2. `Hero.jsx` — Hero section with URL input
         3. `Features.jsx` — Features section component
         4. `ResultCard.jsx` — Shortened URL + QR code display
         5. `Stats.jsx` — Stats/metrics display component
      ii. `App.jsx` — Root component & routing setup
      iii. `index.css` — Global styles & Tailwind directives
      iv. `main.jsx` — React DOM entry point
   c. `.env` — Frontend env vars (VITE_API_URL)
   d. `index.html` — Vite HTML template
   e. `package.json`

