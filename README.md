# QuickMeet : Real-Time Video Conferencing Platform

<div align="center">

![QuickMeet](https://img.shields.io/badge/QuickMeet-Video_Conferencing_Website-4F46E5?style=for-the-badge)

![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![WebRTC](https://img.shields.io/badge/WebRTC-Enabled-FF6B6B?style=for-the-badge&logo=webrtc&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.1-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.6-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-9.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**A fully-featured, responsive video conferencing platform similar to Zoom/Google Meet, built from scratch using modern web technologies with WebRTC peer-to-peer connections.**

</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Application Flow](#application-flow)
- [Sponsor](#sponsor)
- [License](#license)

---

<a id="features"></a>

## ✨ Features

### 🎥 Core Video Features
| Feature | Description |
|---------|-------------|
| **Real-time Video Calls** | High-quality peer-to-peer video using WebRTC with multiple STUN servers |
| **Screen Sharing** | Share entire screen or specific windows with other participants |
| **Audio/Video Controls** | Toggle camera and microphone on/off during calls with instant sync |
| **Speaker Toggle** | Mute/unmute all incoming audio from remote participants |
| **Pre-Call Setup** | Preview video, configure display name and AV settings before joining |
| **Auto Aspect Ratio** | Video preview automatically adjusts to match webcam's native aspect ratio |

### ⚙️ Advanced Settings
| Feature | Description |
|---------|-------------|
| **Settings Panel** | Floating settings panel accessible via gear icon in the control bar |
| **Camera Selection** | Switch between available cameras during a call |
| **Microphone Selection** | Switch between available microphones during a call |
| **Echo Cancellation** | Toggle browser-level echo cancellation for cleaner audio |
| **Auto Gain Control** | Automatically adjusts microphone input volume |
| **Noise Suppression** | Filter out background noise from audio input |
| **Responsive Settings UI** | Settings panel adapts seamlessly to mobile and desktop screens |

### 👤 User Experience
| Feature | Description |
|---------|-------------|
| **Fully Responsive Design** | Adaptive layouts for desktop, tablet, and mobile devices |
| **Dark/Light Theme** | Toggle themes with persistent localStorage preferences |
| **User Authentication** | Secure token-based login and registration with bcrypt hashing |
| **Guest Access** | Join meetings without creating an account |
| **Custom Display Names** | Set your name for each meeting session |
| **Meeting Code Copy** | One-click copy meeting code with toast notification |

### 🎮 Meeting Controls
| Feature | Description |
|---------|-------------|
| **Host Identification** | Visual indicators for meeting host |
| **Participant Panel** | View all attendees with their audio/video status |
| **Real-time Chat** | In-meeting text messaging with floating panel design |
| **Adaptive Grid Layout** | Smart grid that adjusts based on participant count (1-8+) |
| **Screen Share Priority** | Screen shares get prominent display positioning |
| **Overflow Indicator** | Shows "+N more" when participants exceed grid capacity |

### 📜 Meeting History
| Feature | Description |
|---------|-------------|
| **Meeting History Page** | View all past meetings with date, time, and status |
| **Active Room Detection** | Real-time status showing if a room is "Active" or "Room Closed" |
| **Rejoin Meetings** | Quick rejoin button for active meetings |
| **Delete from History** | Remove individual meetings from history |
| **Auto-Cleanup** | Server automatically deletes meetings older than 30 days |
| **Duplicate Prevention** | Rejoining same room updates timestamp instead of creating duplicates |
| **Guest Restriction** | Meeting history only available for registered users |

### 🔒 Security & Stability
| Feature | Description |
|---------|-------------|
| **Peer-to-Peer Encryption** | Secure WebRTC connections via STUN servers |
| **Token Authentication** | Crypto-generated session tokens |
| **Password Hashing** | bcrypt with salt rounds for secure storage |
| **Back Navigation Block** | Prevents accidental meeting exits via browser back button |
| **Connection Recovery** | Handles peer disconnections gracefully |

### 🔍 SEO & Web Optimization
| Feature | Description |
|---------|-------------|
| **Per-Page Meta Tags** | Dynamic title, description, and canonical URL per route via `react-helmet-async` |
| **Open Graph Tags** | Rich link previews on Facebook, LinkedIn, and other social platforms |
| **Twitter Cards** | `summary_large_image` cards with custom OG image |
| **Structured Data** | JSON-LD schemas (`WebApplication` + `Organization`) for search engine rich results |
| **Sitemap & Robots.txt** | XML sitemap for crawlable pages; robots.txt blocks private routes |
| **PWA Manifest** | Web app manifest with icons for installability and app metadata |
| **404 Page** | Custom not-found page with `noindex` to prevent dead-end indexing |
| **Accessibility** | `aria-label` on forms/nav, `prefers-reduced-motion` media query support |
| **OG Image Component** | SVG-based Open Graph image component (1200×630) matching brand design |

---

<a id="tech-stack"></a>

## 🛠 Tech Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.3 | UI Framework with Hooks |
| React Router DOM | 7.11.0 | Client-side Routing & Navigation || React Helmet Async | 2.0.5 | Per-page SEO Meta Tags || Tailwind CSS | 3.3.6 | Utility-first CSS Styling |
| Lucide React | 0.562.0 | Modern SVG Icon Library |
| Socket.io Client | 4.8.1 | Real-time WebSocket Communication |
| Axios | 1.13.2 | HTTP Client for API Calls |
| Vite | 7.3.0 | Next-gen Build Tool & Dev Server |
| TypeScript | 5.9.3 | Type Checking (Config only) |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24.x | JavaScript Runtime |
| Express.js | 5.2.1 | Web Application Framework |
| Socket.io | 4.8.1 | WebSocket Server for Signaling |
| MongoDB | Cloud | NoSQL Database |
| Mongoose | 9.0.2 | MongoDB ODM |
| bcrypt | 6.0.0 | Password Hashing |
| crypto | Built-in | Token Generation |
| CORS | 2.8.5 | Cross-Origin Resource Sharing |

### WebRTC Infrastructure
| Component | Purpose |
|-----------|---------|
| RTCPeerConnection | Peer-to-peer media connections |
| MediaStream API | Camera, microphone, and screen capture |
| STUN Servers | NAT traversal for peer discovery |
| ICE Candidates | Connection establishment |

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
│  │  │  • login() / signup() / logout()    │  │  • toggleTheme()                           │ │   │
│  │  │  • loginAsGuest()                   │  │  • localStorage persistence                │ │   │
│  │  │  • Token validation                 │  │  • System preference detection             │ │   │
│  │  └─────────────────────────────────────┘  └────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              REUSABLE COMPONENTS                                         │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌───────────────┐ ┌───────────────────────┐  │   │
│  │  │  Button  │ │  Input   │ │  ChatPanel   │ │ LoadingSpinner│ │  DarkModeToggle /SEO  │  │   │
│  │  └──────────┘ └──────────┘ └──────────────┘ └───────────────┘ └───────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
└────────────────────────────────────┬────────────────────────────────┬───────────────────────────┘
                                     │                                │
                    ┌────────────────┴────────────────┐  ┌────────────┴────────────────┐
                    │        Socket.io Client         │  │      Axios HTTP Client      │
                    │      (Real-time Events)         │  │      (REST API Calls)       │
                    └────────────────┬────────────────┘  └────────────┬────────────────┘
                                     │                                │
═══════════════════════════════════════════════════════════════════════════════════════════════════
                                     │           NETWORK              │
═══════════════════════════════════════════════════════════════════════════════════════════════════
                                     │                                │
                    ┌────────────────┴────────────────┐  ┌────────────┴────────────────┐
                    │        Socket.io Server         │  │       Express Router        │
                    │      (WebSocket Handler)        │  │      (HTTP Endpoints)       │
                    └────────────────┬────────────────┘  └────────────┬────────────────┘
                                     │                                │
┌────────────────────────────────────┴────────────────────────────────┴───────────────────────────┐
│                              SERVER (Node.js 24 + Express 5)                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              SOCKET MANAGER (socketManager.js)                           │   │
│  │                                                                                          │   │
│  │   EVENTS RECEIVED                          EVENTS EMITTED                                │   │
│  │   ┌─────────────────────────┐              ┌─────────────────────────────────────────┐   │   │
│  │   │ • join-call             │              │ • user-joined (broadcast to room)       │   │   │
│  │   │ • signal (WebRTC SDP)   │              │ • user-left (broadcast to room)         │   │   │
│  │   │ • chat-message          │              │ • signal (forward to peer)              │   │   │
│  │   │ • update-media-state    │              │ • chat-message (broadcast)              │   │   │
│  │   │ • screen-share-toggle   │              │ • user-media-state-changed              │   │   │
│  │   │ • disconnect            │              │ • user-started-screen-share             │   │   │
│  │   └─────────────────────────┘              │ • user-stopped-screen-share             │   │   │
│  │                                            └─────────────────────────────────────────┘   │   │
│  │   ROOM MANAGEMENT                                                                        │   │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────┐    │   │
│  │   │ • socketToRoom{} - Maps socket ID to room URL                                   │    │   │
│  │   │ • rooms{} - Tracks clients in each room (socketId, userName, userRole, A/V)     │    │   │
│  │   │ • getActiveRooms() - Returns list of rooms with active participants             │    │   │
│  │   │ • Room cleanup after 1 hour of inactivity                                       │    │   │
│  │   └─────────────────────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              USER CONTROLLER (userController.js)                         │   │
│  │                                                                                          │   │
│  │   ┌─────────────────────────────────────────────────────────────────────────────────┐    │   │
│  │   │  POST /v1/users/signup     │  Register user (bcrypt hash, crypto token)         │    │   │
│  │   ├─────────────────────────────────────────────────────────────────────────────────┤    │   │
│  │   │  POST /v1/users/login      │  Authenticate user, return token + user data       │    │   │
│  │   ├─────────────────────────────────────────────────────────────────────────────────┤    │   │
│  │   │  GET  /v1/users/history    │  Get meetings with active room status              │    │   │
│  │   ├─────────────────────────────────────────────────────────────────────────────────┤    │   │
│  │   │  POST /v1/users/history    │  Add/Update meeting (upsert - no duplicates)       │    │   │
│  │   ├─────────────────────────────────────────────────────────────────────────────────┤    │   │
│  │   │  DELETE /v1/users/history  │  Remove meeting from user's history                │    │   │
│  │   └─────────────────────────────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              BACKGROUND JOBS (app.js)                                    │   │
│  │  ┌───────────────────────────────────┐  ┌─────────────────────────────────────────────┐  │   │
│  │  │  Meeting Cleanup (Every 6 hours)  │  │  Room Cleanup (On disconnect)               │  │   │
│  │  │  Delete meetings > 30 days old    │  │  Remove empty rooms after timeout           │  │   │
│  │  └───────────────────────────────────┘  └─────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                                 │
└────────────────────────────────────────────────────┬────────────────────────────────────────────┘
                                                     │
                                                     │ Mongoose ODM
                                                     ▼
                              ┌─────────────────────────────────────────────┐
                              │              MongoDB Atlas                  │
                              │  ┌─────────────────────────────────────┐    │
                              │  │         Users Collection            │    │
                              │  │  • _id: ObjectId                    │    │
                              │  │  • name: String                     │    │
                              │  │  • email: String (unique)           │    │
                              │  │  • password: String (bcrypt)        │    │
                              │  │  • token: String (crypto)           │    │
                              │  └─────────────────────────────────────┘    │
                              │  ┌─────────────────────────────────────┐    │
                              │  │        Meetings Collection          │    │
                              │  │  • _id: ObjectId                    │    │
                              │  │  • user_id: String (email)          │    │
                              │  │  • meetingCode: String              │    │
                              │  │  • date: Date (auto-updated)        │    │
                              │  └─────────────────────────────────────┘    │
                              └─────────────────────────────────────────────┘
```

---

<a id="project-structure"></a>

## 📁 Project Structure

```
quickmeet/
├── frontend/                          # React Frontend Application
│   ├── public/                        # Static assets
│   │   ├── icon-192.svg               # PWA icon (192x192)
│   │   ├── icon-512.svg               # PWA icon (512x512)
│   │   ├── manifest.json              # Web app manifest (PWA)
│   │   ├── robots.txt                 # Search engine crawl rules
│   │   └── sitemap.xml                # XML sitemap for SEO
│   ├── src/
│   │   ├── components/                # Reusable UI Components
│   │   │   ├── Button.jsx             # Custom button with variants
│   │   │   ├── ChatPanel.jsx          # Floating chat interface
│   │   │   ├── DarkModeToggle.jsx     # Theme switch component
│   │   │   ├── Input.jsx              # Styled input fields
│   │   │   ├── LoadingSpinner.jsx     # Loading indicator
│   │   │   └── SEO.jsx                # Per-page SEO meta tags component
│   │   │
│   │   ├── context/                   # React Context Providers
│   │   │   ├── AuthContext.jsx        # Authentication state & methods
│   │   │   └── ThemeContext.jsx       # Dark/Light theme management
│   │   │
│   │   ├── pages/                     # Application Pages
│   │   │   ├── LandingPage.jsx        # Home page with guest join
│   │   │   ├── LoginPage.jsx          # User login form
│   │   │   ├── SignupPage.jsx         # User registration form
│   │   │   ├── MeetingEntryPage.jsx   # Create/Join meeting interface
│   │   │   ├── MeetingHistoryPage.jsx # Past meetings with rejoin/delete
│   │   │   ├── NotFoundPage.jsx       # Custom 404 page
│   │   │   ├── PreCallPage.jsx        # Pre-call setup & preview
│   │   │   └── VideoCallPage.jsx      # Main video call interface (1000+ lines)
│   │   │
│   │   ├── App.jsx                    # Root component with routing
│   │   ├── main.jsx                   # Application entry point (HelmetProvider)
│   │   ├── index.css                  # Global styles, Tailwind & reduced-motion
│   │   └── opengraph-image.jsx        # OG image component (1200×630 SVG)
│   │
│   ├── .env                           # Environment variables
│   ├── .npmrc                         # npm config (legacy-peer-deps)
│   ├── index.html                     # HTML template with full SEO metadata
│   ├── package.json                   # Frontend dependencies
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── vite.config.ts                 # Vite build configuration
│   └── vercel.json                    # Vercel deployment config (SPA rewrites)
│
├── backend/                           # Node.js Backend Server
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── socketManager.js       # Socket.io event handlers
│   │   │   └── userController.js      # Auth & user API handlers
│   │   │
│   │   ├── models/
│   │   │   ├── userModel.js           # User mongoose schema
│   │   │   └── meetingModel.js        # Meeting mongoose schema
│   │   │
│   │   ├── routes/
│   │   │   └── users.routes.js        # User API routes
│   │   │
│   │   └── app.js                     # Express server entry point
│   │
│   ├── .env                           # Environment variables
│   └── package.json                   # Backend dependencies
│
├── .gitignore                         # Git ignore rules
├── LICENSE                            # MIT License
└── README.md                          # Project documentation
```

---

<a id="getting-started"></a>

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended: 24.x)
- MongoDB Atlas account or local MongoDB instance
- npm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/arkaghosh2005/QuickMeet.git
   cd quickmeet
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment Variables** (see [Environment Variables](#environment-variables))

5. **Start the Backend Server on Terminal 1**
   ```bash
   cd backend
   node '.\src\app.js'
   ```

6. **Start the Frontend Development Website on Terminal 2**
   ```bash
   cd frontend
   npm run dev
   ```

7. **Open your browser** and navigate to `http://localhost:5173`

---

<a id="environment-variables"></a>

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# MongoDB Connection
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/quickmeet

# CORS - Allowed Origins
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# Backend Server URL
VITE_SERVER_URL=http://localhost:8000

# STUN Servers for WebRTC (NAT Traversal)
VITE_STUN_URL_1=stun:stun.l.google.com:19302
VITE_STUN_URL_2=stun:stun1.l.google.com:19302
VITE_STUN_URL_3=stun:stun2.l.google.com:19302
VITE_STUN_URL_4=stun:stun3.l.google.com:19302
VITE_STUN_URL_5=stun:stun4.l.google.com:19302
```

---

<a id="api-reference"></a>

## 📚 API Reference

### Authentication Endpoints

#### `POST /v1/users/signup`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** `201 Created`
```json
{
  "message": "User has been Registered. Please Login."
}
```

---

#### `POST /v1/users/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "token": "abc123xyz...",
  "user": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

#### `GET /v1/users/history?token={token}`
Get user's meeting history with active room status.

**Response:** `200 OK`
```json
[
  {
    "_id": "64abc123...",
    "user_id": "john@example.com",
    "meetingCode": "ABC-1234-XYZ",
    "date": "2025-12-30T10:00:00.000Z"
  }
]
```

---

#### `POST /v1/users/history`
Add a meeting to user's history (updates timestamp if meeting already exists).

**Request Body:**
```json
{
  "token": "abc123xyz...",
  "meeting_code": "ABC-1234-XYZ"
}
```

**Response:** `201 Created`
```json
{
  "message": "Meeting added to history"
}
```

---

#### `DELETE /v1/users/history`
Delete a specific meeting from user's history.

**Request Body:**
```json
{
  "token": "abc123xyz...",
  "meeting_id": "64abc123..."
}
```

**Response:** `200 OK`
```json
{
  "message": "Meeting deleted from history"
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

### License
This project is licensed under the **MIT License** - see the [LICENSE](https://github.com/arkaghosh2005/QuickMeet/blob/main/LICENSE) file for details.

---

<div align="center">

Made with ❤️ using React, Node.js and WebRTC by **Arka Ghosh**

</div>