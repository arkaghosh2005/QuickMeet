# QuickMeet : Real-Time Video Conferencing Platform

<div align="center">

![QuickMeet](https://img.shields.io/badge/QuickMeet-Video_Conferencing_Website-4F46E5?style=for-the-badge)

![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-STUN%20%2B%20TURN-FF6B6B?style=for-the-badge&logo=webrtc&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.2-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.6-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-9.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-Tested-FCC72B?style=for-the-badge&logo=vitest&logoColor=black)

**A fully-featured, responsive video conferencing platform similar to Zoom/Google Meet, built from scratch using modern web technologies with WebRTC peer-to-peer connections.**

</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [WebRTC NAT Traversal (STUN & TURN)](#webrtc-infrastructure)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Application Flow](#application-flow)
- [Sponsor](#sponsor)
- [License](#license)

---

<a id="features"></a>

## ✨ Features

### 🎥 Core Video & Audio
| Feature | Description |
|---------|-------------|
| **Real-time Video Calls** | Ultra-low latency peer-to-peer video using WebRTC with Google STUN + configurable TURN servers |
| **Hardware Release Guarantee** | Clean media track disposal (`track.stop()`) on call end, unmount, or tab close — no lingering webcam lights |
| **Screen Sharing** | Share entire screen or specific application windows with track renegotiation |
| **Audio/Video Controls** | Toggle camera and microphone on/off during calls with instant peer state synchronization |
| **Speaker Toggle** | Mute/unmute all incoming audio from remote participants |
| **Pre-Call Setup** | Preview video, test microphone, configure display name and AV toggles before joining |
| **Auto Aspect Ratio** | Video preview automatically adjusts to match webcam native aspect ratio |
| **Connection Status Bar** | Visual indicator for connected, reconnecting, and disconnected states with manual retry |

### ⚙️ In-Call Settings Panel
| Feature | Description |
|---------|-------------|
| **Settings Panel** | Accessible via the gear icon in the control bar |
| **Camera Selection** | Switch dynamically between available system webcams |
| **Microphone Selection** | Switch dynamically between available microphones |
| **Echo Cancellation** | Toggle browser-level acoustic echo cancellation |
| **Auto Gain Control** | Toggle microphone input gain normalization |
| **Noise Suppression** | Filter out background noise from the microphone feed |

### 👤 User Experience & Accessibility
| Feature | Description |
|---------|-------------|
| **Smart Code Formatting** | Automatic dash insertion (`AAA-BBBB-CCC`) while typing or pasting meeting codes/URLs |
| **Enter-Key Quick Join** | Press `Enter` in the meeting code input to join instantly |
| **Dark/Light Theme** | System and manual dark mode with `dark` class applied to root `<html>` and persisted in `localStorage` |
| **User Authentication** | Token-based signup & login with bcrypt password hashing and strong password rules |
| **Guest Access** | Join any meeting instantly as a guest without an account |
| **One-Click Code Copy** | Copy meeting code or direct pre-call invitation link with toast feedback |
| **Responsive Design** | Custom adaptive CSS breakpoints supporting desktop, tablet, and mobile |

### 🎮 Meeting Controls & Layout
| Feature | Description |
|---------|-------------|
| **Host Identification** | Distinct badge for room creator vs participants |
| **Participant Panel** | Real-time attendee list displaying live microphone, camera, and screen share states |
| **Real-time Chat** | Floating in-call messaging panel with auto-scroll and unread badge count |
| **Adaptive Grid Layout** | Dynamic responsive grid accommodating 1 to 8+ participants |
| **Screen Share Priority** | Screen shares automatically claim primary layout focus |
| **Participant Overflow** | Displays `+N more` indicator when attendees exceed grid slots |

### 📜 Meeting History
| Feature | Description |
|---------|-------------|
| **History Dashboard** | View past meetings with date, timestamp, and active indicator |
| **Active Room Detection** | Shows real-time badge if a past meeting is currently in progress |
| **One-Click Rejoin** | Direct rejoin button for active meetings |
| **Meeting Deletion** | Remove individual meetings from user history |
| **Auto-Cleanup (TTL)** | MongoDB TTL index automatically cleans entries older than 30 days |
| **Duplicate Prevention** | Rejoining an existing room updates the timestamp instead of duplicating rows |

### 🔒 Security, Reliability & Quality
| Feature | Description |
|---------|-------------|
| **WebSocket XSS Sanitization** | Server-side sanitization of user names, chat text, and screen share labels |
| **Strong Password Policy** | Enforces minimum 8 chars, uppercase, lowercase, numbers, and special characters |
| **DNS Resilience** | Automatic Google Public DNS (`8.8.8.8`) fallback in Node.js to resolve Atlas SRV lookups on restrictive networks |
| **Bounded Memory** | Chat messages capped at 500 per room to prevent unbounded server memory growth |
| **Rate Limiting** | Strict rate limits on authentication endpoints (5 req/15 min) and API (100 req/15 min) |
| **Input Validation** | Strict `express-validator` rules on all authentication and history endpoints |
| **Security Headers** | Helmet middleware configured for CSP, HSTS, and X-Frame-Options |
| **Accidental Leave Prevention** | Browser back navigation trap, beforeunload tab-close warning, and confirmation dialog |
| **Graceful Shutdown** | Handles `SIGTERM`/`SIGINT` to cleanly close HTTP, WebSockets, and MongoDB connections |
| **Automated Tests** | Unit & component test suite powered by Vitest and React Testing Library |
| **Linting & Formatting** | ESLint 9 flat configuration and Prettier formatting |

### 🔍 SEO & Web Optimization
| Feature | Description |
|---------|-------------|
| **Per-Page Meta Tags** | Dynamic title, description, and canonical tags via `react-helmet-async` |
| **Open Graph & Twitter Cards** | Social link previews powered by `og-image.svg` matching brand identity |
| **JSON-LD Structured Data** | `WebApplication` and `Organization` schemas for rich Google search results |
| **Sitemap & Robots.txt** | `sitemap.xml` for public pages; `robots.txt` disallows indexing of private rooms |
| **PWA Manifest & Favicon** | Web app manifest with SVG icons and standalone display capability |

---

<a id="tech-stack"></a>

## 🛠 Tech Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.3 | Declarative UI framework with Hooks |
| React Router DOM | 7.17.0 | Client-side routing and navigation |
| Vite | 7.3.5 | Modern ESM build tool and development server |
| Tailwind CSS | 3.3.6 | Utility-first responsive styling with dark mode |
| Lucide React | 0.562.0 | SVG icon library |
| Socket.io Client | 4.8.1 | Real-time WebSocket signaling |
| Axios | 1.17.0 | HTTP client with authentication interceptors |
| React Helmet Async | 3.0.0 | Per-route SEO metadata management |
| Vitest | Latest | Next-generation unit test runner |
| React Testing Library | Latest | Component testing utilities |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24.x (>= 18) | JavaScript runtime environment |
| Express.js | 5.2.1 | HTTP API server framework |
| Socket.io | 4.8.2 | Real-time WebRTC signaling server |
| MongoDB Atlas | Cloud | Cloud document database |
| Mongoose | 9.6.3 | MongoDB Object Data Modeling (ODM) |
| bcrypt | 6.0.0 | Salted password hashing |
| jsonwebtoken | 9.0.3 | Stateless JWT token issuance and verification |
| helmet | 8.2.0 | HTTP security headers middleware |
| express-validator | 7.3.2 | Request payload validation and sanitization |
| express-rate-limit | 8.5.2 | IP-based request throttling |
| CORS | 2.8.5 | Cross-origin resource sharing |

---

<a id="webrtc-infrastructure"></a>

## 🌐 WebRTC Infrastructure (STUN & TURN)

QuickMeet implements standard WebRTC signaling over Socket.io. For NAT traversal, the platform supports both **STUN** and **TURN** servers:

```
                  ┌─────────────────────────────────────────┐
                  │          Signaling (Socket.io)          │
                  │   Offers, Answers & ICE Candidates      │
                  └──────────────────┬──────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
    ┌─────────────────────────┐             ┌─────────────────────────┐
    │     Peer A (Browser)    │◄── P2P ────►│     Peer B (Browser)    │
    └────────────┬────────────┘  Media Flow └────────────┬────────────┘
                 │                                       │
                 ├────────► STUN (Google) ◄──────────────┤ (Direct P2P via STUN)
                 │                                       │
                 └────────► TURN Server   ◄──────────────┘ (Relay for symmetric NATs)
```

| Traversal Type | Configuration | Behavior |
|----------------|---------------|----------|
| **STUN (Default)** | 5 Google STUN servers (`stun.l.google.com:19302` to `stun4`) | Discovers public IP/port for direct peer-to-peer media paths (~80-85% of users). |
| **TURN (Configured)** | Configured via `VITE_TURN_URL`, `VITE_TURN_USERNAME`, `VITE_TURN_CREDENTIAL` | Relays media packets for users behind restrictive firewalls or symmetric NATs. |

> **Need free TURN credentials?** You can generate free TURN credentials from [metered.ca/tools/openrelay](https://www.metered.ca/tools/openrelay/) or self-host [Coturn](https://github.com/coturn/coturn).

---

<a id="system-architecture"></a>

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CLIENT (React 19 + Vite 7)                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐  │
│  │   Landing   │ │   Login     │ │   Signup    │ │   Meeting   │ │   Meeting   │ │  PreCall  │  │
│  │    Page     │ │    Page     │ │    Page     │ │   Entry     │ │   History   │ │   Page    │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └─────┬─────┘  │
│         │               │               │               │               │              │        │
│         └───────────────┴───────────────┴───────┬───────┴───────────────┴──────────────┘        │
│                                                 │                                               │
│                                                 ▼                                               │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              VIDEO CALL PAGE (Main Interface)                            │   │
│  │  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐ ┌───────────────┐  │   │
│  │  │   Video Grid       │ │   Control Bar      │ │   Settings Panel   │ │  Chat Panel   │  │   │
│  │  │  - Local video     │ │  - Mic toggle      │ │  - Camera select   │ │  - Messages   │  │   │
│  │  │  - Remote videos   │ │  - Video toggle    │ │  - Mic select      │ │  - Real-time  │  │   │
│  │  │  - Screen shares   │ │  - Speaker toggle  │ │  - Echo cancel     │ │  - Floating   │  │   │
│  │  │  - Adaptive grid   │ │  - Screen share    │ │  - Auto gain       │ └───────────────┘  │   │
│  │  │  - Overflow (+N)   │ │  - Chat button     │ │  - Noise suppress  │ ┌───────────────┐  │   │
│  │  └────────────────────┘ │  - Settings button │ └────────────────────┘ │  Participants │  │   │
│  │                         │  - End call        │                        │    Panel      │  │   │
│  │                         └────────────────────┘                        └───────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              CONTEXT PROVIDERS (Global State)                            │   │
│  │  ┌─────────────────────────────────────┐  ┌────────────────────────────────────────────┐ │   │
│  │  │           AuthContext               │  │              ThemeContext                  │ │   │
│  │  │  • userData (name, email, token)    │  │  • isDarkMode state                        │ │   │
│  │  │  • login() / signup() / logout()    │  │  • toggleDarkMode()                        │ │   │
│  │  │  • loginAsGuest()                   │  │  • document.documentElement.classList      │ │   │
│  │  │  • Session expiry toast             │  │  • localStorage persistence                │ │   │
│  │  └─────────────────────────────────────┘  └────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────┬────────────────────────────────┬───────────────────────────┘
                                     │                                │
                    ┌────────────────┴────────────────┐  ┌────────────┴────────────────┐
                    │        Socket.io Client         │  │      Axios HTTP Client      │
                    │      (Real-time Signaling)      │  │      (REST API Calls)       │
                    └────────────────┬────────────────┘  └────────────┬────────────────┘
                                     │                                │
═══════════════════════════════════════════════════════════════════════════════════════════════════
                                     │           NETWORK              │
═══════════════════════════════════════════════════════════════════════════════════════════════════
                                     │                                │
                    ┌────────────────┴────────────────┐  ┌────────────┴────────────────┐
                    │        Socket.io Server         │  │       Express Router        │
                    │      (Signaling & Events)       │  │      (HTTP Endpoints)       │
                    └────────────────┬────────────────┘  └────────────┬────────────────┘
                                     │                                │
┌────────────────────────────────────┴────────────────────────────────┴───────────────────────────┐
│                              SERVER (Node.js 24 + Express 5)                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              SOCKET MANAGER (socketManager.js)                           │   │
│  │  • Sanitized inputs (XSS protection)         • Room cleanup timer (1 hour timeout)       │   │
│  │  • Bounded message buffer (500 max/room)     • JWT & Guest handshake authentication      │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              USER CONTROLLER (userController.js)                         │   │
│  │  • POST /v1/users/signup (409 on duplicate)  • GET /v1/users/history                     │   │
│  │  • POST /v1/users/login (7-day JWT)          • POST /v1/users/history (upsert)           │   │
│  │  • DELETE /v1/users/history                  • Sanitized generic 500 error responses     │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                     │
                                                     ▼ Mongoose ODM
                                      ┌─────────────────────────────┐
                                      │        MongoDB Atlas        │
                                      │  • Users Collection         │
                                      │  • Meetings (30-day TTL)    │
                                      └─────────────────────────────┘
```

---

<a id="project-structure"></a>

## 📁 Project Structure

```
quickmeet/
├── frontend/                          # React Frontend Application
│   ├── public/                        # Static assets
│   │   ├── favicon.svg                # Brand SVG Favicon
│   │   ├── icon-192.svg               # PWA icon (192x192)
│   │   ├── icon-512.svg               # PWA icon (512x512)
│   │   ├── manifest.json              # Web app manifest (PWA)
│   │   ├── og-image.svg               # Open Graph social preview (1200x630)
│   │   ├── robots.txt                 # Search engine crawl rules
│   │   └── sitemap.xml                # XML sitemap for SEO
│   ├── src/
│   │   ├── components/                # Reusable UI Components
│   │   │   ├── __tests__/             # Component tests
│   │   │   │   └── Button.test.jsx    # Button unit tests
│   │   │   ├── Button.jsx             # Accessible button with variants
│   │   │   ├── ChatPanel.jsx          # Floating in-call chat
│   │   │   ├── ConfirmModal.jsx       # Accessible modal dialog
│   │   │   ├── DarkModeToggle.jsx     # Theme switch with keyboard support
│   │   │   ├── Input.jsx              # Form input with validation states
│   │   │   ├── LoadingSpinner.jsx     # Animated CSS spinner
│   │   │   └── SEO.jsx                # Per-route meta tags
│   │   │
│   │   ├── context/                   # Global state providers
│   │   │   ├── AuthContext.jsx        # JWT & guest authentication
│   │   │   └── ThemeContext.jsx       # Dark mode state & HTML class toggle
│   │   │
│   │   ├── pages/                     # Application Routes
│   │   │   ├── __tests__/             # Page logic unit tests
│   │   │   │   └── MeetingCode.test.js# Code generation & formatting tests
│   │   │   ├── LandingPage.jsx        # Landing hero & guest join
│   │   │   ├── LoginPage.jsx          # Login form
│   │   │   ├── SignupPage.jsx         # Registration with password strength
│   │   │   ├── MeetingEntryPage.jsx   # Create/Join with auto-dash formatting
│   │   │   ├── MeetingHistoryPage.jsx # Past meetings list
│   │   │   ├── NotFoundPage.jsx       # Custom 404 page
│   │   │   ├── PreCallPage.jsx        # Hardware preview & setup
│   │   │   └── VideoCallPage.jsx      # Video conferencing interface
│   │   │
│   │   ├── test/                      # Test configuration & setup
│   │   │   └── setup.js               # Test teardown & cleanup
│   │   ├── App.jsx                    # Root routing & route guards
│   │   ├── main.jsx                   # Entry point (HelmetProvider)
│   │   ├── index.css                  # Tailwind styles & reduced motion
│   │   └── opengraph-image.jsx        # OG image SVG generator component
│   │
│   ├── .env                           # Frontend environment variables
│   ├── index.html                     # HTML document template with SEO
│   ├── package.json                   # Dependencies & test scripts
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── vite.config.js                 # Vite build configuration
│   ├── vitest.config.js               # Vitest testing configuration
│   └── vercel.json                    # Vercel deployment rewrites
│
├── backend/                           # Node.js Backend Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManager.js       # WebSocket signaling & XSS sanitize
│   │   │   └── userController.js      # Auth & meeting history handlers
│   │   ├── models/
│   │   │   ├── userModel.js           # User Mongoose schema
│   │   │   └── meetingModel.js        # Meeting schema (30-day TTL index)
│   │   ├── routes/
│   │   │   └── users.routes.js        # Express routes & express-validator
│   │   ├── middleware/
│   │   │   └── auth.js                # JWT authentication middleware
│   │   └── app.js                     # Express app & DNS fallback setup
│   │
│   ├── .env                           # Backend environment variables
│   └── package.json                   # Backend dependencies & engines
│
├── eslint.config.js                   # ESLint 9 Flat Config (React + Node)
├── .prettierrc                        # Prettier code formatting rules
├── .prettierignore                    # Prettier ignore paths
├── .gitignore                         # Git ignore definitions
├── LICENSE                            # MIT License
└── README.md                          # Project documentation
```

---

<a id="getting-started"></a>

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0 (Recommended: 24.x)
- **MongoDB Atlas** account or a local MongoDB database
- **npm** package manager

### 1. Clone the repository

```bash
git clone https://github.com/arkaghosh2005/QuickMeet.git
cd quickmeet
```

### 2. Configure Environment Variables

Create and configure your `.env` files in both directories:

**Backend (`backend/.env`):**
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/QuickMeet
JWT_SECRET=your_super_secret_key_minimum_64_characters_recommended
```

**Frontend (`frontend/.env`):**
```env
VITE_SERVER_URL=http://localhost:3000
VITE_STUN_URL_1=stun:stun.l.google.com:19302
VITE_STUN_URL_2=stun:stun1.l.google.com:19302
VITE_STUN_URL_3=stun:stun2.l.google.com:19302
VITE_STUN_URL_4=stun:stun3.l.google.com:19302
VITE_STUN_URL_5=stun:stun4.l.google.com:19302

# Optional TURN server for symmetric NAT traversal
VITE_TURN_URL=turn:your-turn-server.com:3478
VITE_TURN_USERNAME=your_username
VITE_TURN_CREDENTIAL=your_credential
```

### 3. Install Dependencies & Start Backend

In your first terminal:

```bash
cd backend
npm install
npm run dev
```

The backend starts listening on `http://localhost:3000`.

### 4. Install Dependencies & Start Frontend

In your second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

<a id="running-tests"></a>

## 🧪 Running Tests

QuickMeet includes automated unit and component tests using **Vitest** and **React Testing Library**.

To run the test suite:

```bash
# Run tests once in terminal
cd frontend
npm run test:run

# Run tests in interactive watch mode
npm test
```

---

<a id="environment-variables"></a>

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | HTTP & WebSocket server port | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `CLIENT_URL` | Allowed CORS origins (comma-separated for multiple) | `http://localhost:5173` |
| `MONGO_URL` | MongoDB Atlas or local connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | 64+ char random hex |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Base URL of the backend server | `http://localhost:3000` |
| `VITE_STUN_URL_1`–`5` | Google public STUN server endpoints | `stun:stun.l.google.com:19302` |
| `VITE_TURN_URL` | *(Optional)* TURN server URI | `turn:openrelay.metered.ca:80` |
| `VITE_TURN_USERNAME` | *(Optional)* TURN authentication username | `openrelayproject` |
| `VITE_TURN_CREDENTIAL` | *(Optional)* TURN authentication credential | `openrelayproject` |

---

<a id="api-reference"></a>

## 📚 API Reference

### Authentication Endpoints

#### `POST /v1/users/signup`
Registers a new user account with strong password verification.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Responses:**
- `201 Created` — User registered successfully
- `400 Bad Request` — Validation error (e.g., password does not meet complexity)
- `409 Conflict` — User with this email already exists

---

#### `POST /v1/users/login`
Authenticates a user and returns a 7-day JWT token.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "Password123!"
}
```

**Responses:**
- `200 OK` — Authentication successful:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```
- `401 Unauthorized` — Invalid password
- `404 Not Found` — User not found

---

### Meeting History Endpoints

All history endpoints require the `Authorization: Bearer <token>` header.

#### `GET /v1/users/history`
Returns all meetings for the logged-in user with their current active status.

**Response:** `200 OK`
```json
[
  {
    "_id": "64abc123...",
    "user_id": "jane@example.com",
    "meetingCode": "ABC-1234-XYZ",
    "date": "2026-11-01T10:00:00.000Z",
    "isActive": true
  }
]
```

---

#### `POST /v1/users/history`
Saves or updates a meeting entry in the user's history (upsert).

**Request Body:**
```json
{
  "meeting_code": "ABC-1234-XYZ"
}
```

**Response:** `201 Created`

---

#### `DELETE /v1/users/history`
Deletes a specific meeting record from history.

**Request Body:**
```json
{
  "meeting_id": "64abc123..."
}
```

**Response:** `200 OK`

---

### Monitoring

#### `GET /health`
Uptime health check endpoint for monitoring probes.

**Response:** `200 OK`
```json
{
  "status": "ok",
  "uptime": 3600.42
}
```

---

<a id="application-flow"></a>

## 📱 Application Flow

```
Landing Page (Guest Join / Login / Signup)
         │
         ▼
    Login / Signup
         │
         ▼
  Meeting Entry Page ◄────────────┐
  (Create or Join Meeting)        │
         │                        │
         ├────────────────────────┤
         │                        │
         ▼                        │
    Pre-Call Page         Meeting History Page
  (Preview & Settings)    (View/Rejoin/Delete)
         │
         ▼
    Video Call Page
  (Full Meeting Experience)
```

---

<a id="sponsor"></a>

## 💖 Sponsor

If you find QuickMeet helpful and would like to support its continued development, consider sponsoring!

<div align="center">

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor%20on-GitHub-ea4aaa?style=for-the-badge&logo=github-sponsors&logoColor=white)](https://github.com/sponsors/arkaghosh2005)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A-Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/arkaghosh2005)

</div>

Your support helps cover hosting costs, development time, and enables new features. Every contribution is greatly appreciated! ☕✨

---

<a id="license"></a>

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](https://github.com/arkaghosh2005/QuickMeet/blob/main/LICENSE) file for details.

---

<div align="center">

Made with ❤️ using React, Node.js and WebRTC by **Arka Ghosh**

</div>