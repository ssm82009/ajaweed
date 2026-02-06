# School Visitor System (نظام زائر المدرسي)

A complete React + Express + SQLite application for managing school visitors.

## Project Structure
- `client/`: React Frontend (Vite + TypeScript)
- `server/`: Node.js Backend (Express + SQLite)

## Prerequisites
- Node.js installed

## How to Run

1. **Start the Backend Server:**
   ```bash
   cd server
   npm install # (First time only)
   node index.js
   ```
   Server runs on `http://localhost:3001`

2. **Start the Frontend Client:**
   ```bash
   cd client
   npm install # (First time only)
   npm run dev -- --host
   ```
   Client runs on `http://localhost:5173` (or your network IP for mobile access)

## Features
- **Check-in Flow:** Name -> ID -> Phone (Verify) -> Reason -> Declaration -> Signature.
- **Verification:** Simulated SMS code (Wait 2s, code appears in alert).
- **Exit Flow:** Scan QR Code (Navigates to `/exit`) -> Auto-checkout based on device IP.
- **Database:** SQLite (`server/database.sqlite`).

## Simulation Notes
- **Verification Code:** Since there is no real SMS gateway, the code is alerted to the browser window after 2 seconds.
- **Exit Tracking:** The system uses the device's IP address to find the active visit. Ensure the device stays on the same network (Wi-Fi) during the visit.
