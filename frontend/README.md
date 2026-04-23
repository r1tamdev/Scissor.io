<p align="center">
  <img src="https://img.shields.io/badge/Scissor.io-URL%20Shortener-F4A623?style=for-the-badge&logo=link&logoColor=white" alt="Scissor.io" />
</p>

<h1 align="center">✂️ Scissor.io</h1>

<p align="center">
  <strong>A modern, full-stack URL shortener with link expiry, password protection, and click analytics.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" />
</p>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **Instant Shortening** | Generate short links in milliseconds with unique 7-char IDs via `nanoid` |
| 📱 **QR Code Generation** | Every link gets an auto-generated QR code — download or share directly |
| ⏱ **Link Expiry** | Set links to auto-expire after 1 hour, 24 hours, 7 days, or 30 days |
| 🔒 **Password Protection** | Secure links with bcrypt-hashed passwords; visitors see a branded unlock page |
| 📊 **Click Analytics** | Real-time dashboard with click timeline, device breakdown, and top referrers |
| 🎨 **Premium UI** | Dark theme with glassmorphism, goldenrod accents, and smooth micro-animations |

---

## 🛠 Tech Stack

### Frontend
- **React 19** — Component-based UI with hooks
- **Vite 8** — Lightning-fast dev server and build tool
- **Tailwind CSS + DaisyUI** — Utility-first styling with custom design tokens
- **Axios** — HTTP client for API communication
- **qrcode** — Client-side QR code generation

### Backend
- **Express 5** — Node.js web framework
- **MongoDB + Mongoose 9** — NoSQL database with ODM
- **nanoid** — Collision-resistant unique ID generation
- **bcryptjs** — Secure password hashing
- **dotenv** — Environment variable management
- **cors** — Cross-origin request handling

---

## 📁 Project Structure

```
URL-SHORTENER/
├── backend/
│   ├── models/
│   │   ├── url.js            # URL schema (originalUrl, shortId, expiresAt, password)
│   │   └── click.js          # Click analytics schema (device, referrer, timestamp)
│   ├── routes/
│   │   └── url.js            # API routes (shorten, redirect, verify, analytics)
│   ├── server.js             # Express server + MongoDB connection
│   ├── .env                  # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Fixed navigation with scroll detection
│   │   │   ├── Hero.jsx            # Hero section with URL input
│   │   │   ├── AdvancedOptions.jsx # Expiry chips + password toggle
│   │   │   ├── ResultCard.jsx      # Short URL display + badges + actions
│   │   │   ├── AnalyticsPanel.jsx  # Click analytics dashboard
│   │   │   └── Features.jsx        # Feature showcase grid
│   │   ├── App.jsx           # Root component with state management
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Complete design system + component styles
│   ├── index.html
│   └── package.json
│
├── screenshots/              # README screenshots
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **npm** or **yarn**

### 1. Clone the repository

```bash
git clone https://github.com/your-username/scissor-io.git
cd scissor-io
```

### 2. Setup the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>
PORT=5000
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

### 3. Setup the Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the app

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📡 API Endpoints

### `POST /shorten`

Create a shortened URL with optional expiry and password.

**Request Body:**
```json
{
  "originalUrl": "https://example.com/very-long-path",
  "expiresIn": "7d",
  "password": "mysecret"
}
```

| Field | Type | Required | Options |
|-------|------|----------|---------|
| `originalUrl` | `string` | ✅ | Any valid URL |
| `expiresIn` | `string` | ❌ | `1h`, `24h`, `7d`, `30d`, `never` |
| `password` | `string` | ❌ | Plain text (hashed before storage) |

**Response:**
```json
{
  "shortId": "aBcD1x2",
  "shortUrl": "http://localhost:5000/aBcD1x2",
  "expiresAt": "2026-04-30T10:00:00.000Z",
  "hasPassword": true
}
```

---

### `GET /:shortId`

Redirects to the original URL.

| Scenario | Behavior |
|----------|----------|
| Valid link, no password | `302` redirect to original URL |
| Valid link, has password | Serves an HTML password prompt page |
| Expired link | `410 Gone` — `{ error: "This link has expired" }` |
| Not found | `404` — `{ error: "URL not found" }` |

---

### `POST /:shortId/verify`

Verify password for a protected link.

**Request Body:**
```json
{
  "password": "mysecret"
}
```

**Response (success):**
```json
{
  "redirectUrl": "https://example.com/very-long-path"
}
```

**Response (wrong password):**
```json
{
  "error": "Incorrect password"
}
```

---

### `GET /:shortId/analytics`

Retrieve click analytics for a shortened URL.

**Response:**
```json
{
  "totalClicks": 42,
  "devices": {
    "desktop": 30,
    "mobile": 10,
    "tablet": 2
  },
  "referrers": [
    { "name": "twitter.com", "count": 18 },
    { "name": "Direct", "count": 15 },
    { "name": "google.com", "count": 9 }
  ],
  "dailyClicks": {
    "2026-04-17": 3,
    "2026-04-18": 8,
    "2026-04-19": 12,
    "2026-04-20": 5,
    "2026-04-21": 7,
    "2026-04-22": 4,
    "2026-04-23": 3
  },
  "createdAt": "2026-04-16T10:00:00.000Z",
  "expiresAt": "2026-04-23T10:00:00.000Z",
  "hasPassword": true,
  "originalUrl": "https://example.com"
}
```

---

## 🗄️ Database Models

### URL Model

| Field | Type | Description |
|-------|------|-------------|
| `originalUrl` | `String` | The destination URL |
| `shortId` | `String` | Unique 7-character identifier |
| `clicks` | `Number` | Total click counter |
| `expiresAt` | `Date` | Auto-expiry timestamp (null = never) |
| `password` | `String` | Bcrypt-hashed password (null = no protection) |
| `createdAt` | `Date` | Auto-generated timestamp |

### Click Model

| Field | Type | Description |
|-------|------|-------------|
| `shortId` | `String` | Links to the URL document |
| `timestamp` | `Date` | When the click occurred |
| `referrer` | `String` | Source of the click (or "Direct") |
| `userAgent` | `String` | Browser user-agent string |
| `device` | `String` | `desktop`, `mobile`, or `tablet` |

---

## 🎨 Design System

The UI follows a custom dark-theme design system with these core tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `--accent` | `#F4A623` | Primary goldenrod accent |
| `--accent-light` | `#FFC857` | Hover / highlight states |
| `--bg-primary` | `#0A0A0F` | Page background |
| `--bg-glass` | `rgba(255,255,255,0.04)` | Glassmorphism cards |
| Font — Headings | **Outfit** | Bold, modern display font |
| Font — Body | **Inter** | Clean, readable system font |

---

## 🧩 Key Features Deep Dive

### ⏱ Link Expiry
- Choose from **5 presets**: Never, 1 Hour, 24 Hours, 7 Days, 30 Days
- Result card shows a **live countdown badge** (e.g., `Expires in 6d 23h`)
- MongoDB **TTL index** auto-cleans expired documents
- Expired links return a `410 Gone` HTTP status

### 🔒 Password Protection
- Passwords are hashed with **bcrypt** (10 salt rounds) before storage
- Visitors see a **branded unlock page** served directly by the backend
- The unlock page uses the same dark theme and goldenrod design system
- Wrong passwords show inline error messages without page reload

### 📊 Click Analytics
- Every click logs **device type**, **referrer**, **user-agent**, and **timestamp**
- Dashboard features:
  - **Total clicks** counter with goldenrod gradient
  - **7-day bar chart** with animated bars
  - **Top referrers** with percentage progress bars
  - **Device breakdown** with color-coded segments (Desktop / Mobile / Tablet)
  - **Metadata footer** with creation date, expiry info, and protection status

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

