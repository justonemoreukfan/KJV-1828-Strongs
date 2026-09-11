# INSTALLATION & SELF-CONTAINMENT GUIDE

This guide provides comprehensive, step-by-step instructions for installing and running the Classical Bible Study Suite completely self-contained on Windows, macOS, Linux, and Docker environments.

**Created Date**: September 11, 2026 • **Last Modified Date**: September 11, 2026

> **Scope**: This project is specifically focused on the historic 1611 King James Version, Noah Webster's 1828 Dictionary, and Strong's Concordance. It is provided as-is for personal Bible study.

---

## 1. Proof of Self-Containment (Zero External Dependencies)

This application is **100% self-contained and offline-capable**:

1. **Local Offline Datasets (`server_data/` — 26 MB total)**
   - `server_data/kjv.json` (4.4 MB): All 66 books, 1,189 chapters, and 31,102 verses of the King James Bible with chapter structures and verse texts.
   - `server_data/webster1828.json` (19 MB): Noah Webster's complete 1828 American Dictionary of the English Language.
   - `server_data/strongs_hebrew.json` (2.0 MB): All 8,674 Old Testament Hebrew & Aramaic entries (H1–H8674) with roots, derivations, transliterations, and pronunciations.
   - `server_data/strongs_greek.json` (1.2 MB): All 5,624 New Testament Greek entries (G1–G5624) with Greek script, transliterations, and definitions.

2. **No External Database Required**
   - No PostgreSQL, MySQL, MongoDB, Firebase, or Supabase.
   - All searches, cross-references, and concordance queries run in memory in the local Node.js process with microsecond lookup speeds.

3. **No Paid APIs or API Keys**
   - No OpenAI, Gemini, Claude, or third-party dictionary API subscriptions.
   - Every network call from the frontend goes to `/api/*` on its own local server (`http://localhost:3000`).

4. **Built-In Offline Narration**
   - The audio read-aloud feature uses the standard browser **Web Speech Synthesis API** (`window.speechSynthesis`).
   - It runs directly inside your web browser (Chrome, Edge, Safari, Firefox, Android, iOS) without making calls to cloud text-to-speech services.

5. **Local Browser Storage for User Data**
   - Bookmarks, reading history, and display settings (theme, font size) are saved directly in browser `localStorage`. No external account creation or tracking.

---

## 2. System Requirements

- **Node.js**: Version 18.0.0 or newer (v20.x or v22.x LTS strongly recommended).
- **Package Manager**: `npm` (bundled with Node.js), `bun`, `pnpm`, or `yarn`.
- **RAM**: Minimum 512 MB (1 GB recommended). The indexed datasets consume ~250–350 MB RAM in Node.js.
- **Disk Space**: ~500 MB (includes raw datasets, project source, and `node_modules`).
- **OS**: Windows 10/11, macOS (Intel or Apple Silicon M1/M2/M3), Linux (Ubuntu, Debian, Fedora, Arch, Alpine, etc.).

---

## 3. Step-by-Step Installation Guides

### A. Windows Installation

1. **Install Node.js**:
   - Download the LTS installer from [https://nodejs.org/](https://nodejs.org/) (e.g., v20.x LTS or v22.x LTS).
   - Run the `.msi` installer and accept default settings (ensure "Add to PATH" is checked).
   - Verify in Command Prompt (`cmd`) or PowerShell:
     ```powershell
     node -v
     npm -v
     ```

2. **Extract the Project**:
   - Unzip your downloaded project folder to a location like `C:\Apps\BibleStudySuite`.

3. **Install Project Dependencies**:
   - Open Command Prompt or PowerShell in that directory:
     ```powershell
     cd C:\Apps\BibleStudySuite
     npm install
     ```

4. **Run the Application**:
   - **For everyday use / production (fastest & lowest memory)**:
     ```powershell
     npm run build
     npm start
     ```
   - **For developer mode (with live frontend code reloading)**:
     ```powershell
     npm run dev
     ```

5. **Open in Browser**:
   - Open your browser and navigate to:
     ```
     http://localhost:3000
     ```

*(Tip: You can create a desktop shortcut with a `.bat` file containing `cd C:\Apps\BibleStudySuite && npm start`)*

---

### B. macOS Installation

1. **Install Node.js**:
   - Using Homebrew:
     ```bash
     brew install node
     ```
   - Or download the macOS installer (`.pkg`) from [https://nodejs.org/](https://nodejs.org/).

2. **Extract and Navigate to the Folder**:
   ```bash
   cd ~/Downloads/bible-study-suite
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Build and Start**:
   ```bash
   npm run build
   npm start
   ```

5. **Access the App**:
   - Open Safari, Chrome, or Firefox and go to `http://localhost:3000`.

---

### C. Linux (Ubuntu / Debian / Raspberry Pi)

1. **Install Node.js 20 LTS**:
   ```bash
   sudo apt update
   sudo apt install -y curl
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   ```

2. **Copy / Clone the Project**:
   ```bash
   cd /opt/bible-study-suite
   ```

3. **Install Dependencies and Build**:
   ```bash
   npm install
   npm run build
   ```

4. **Run as a Background Service with PM2 (Optional for Servers/Raspberry Pi)**:
   ```bash
   sudo npm install -g pm2
   pm2 start dist/server.cjs --name "bible-suite"
   pm2 startup
   pm2 save
   ```
   Now the application will automatically start on system reboot and restart if it ever crashes.

---

### D. Docker Installation (Any OS)

If you prefer containers, a single Docker container can run the entire suite.

1. **Create a `Dockerfile`** in the project root:
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/server_data ./server_data
   EXPOSE 3000
   CMD ["node", "dist/server.cjs"]
   ```

2. **Build and Run the Container**:
   ```bash
   # Build the image:
   docker build -t bible-study-suite .

   # Run container:
   docker run -d -p 3000:3000 --name bible-suite --restart unless-stopped bible-study-suite
   ```

3. Open `http://localhost:3000`.

---

### E. Bun Installation (Ultra-Fast Alternative)

If you use [Bun](https://bun.sh):

```bash
# Install dependencies:
bun install

# Run directly:
bun server.ts
```

Bun will execute TypeScript natively with near-instant boot times.

---

## 4. Custom Port Configuration

By default, the server binds to port `3000`. If port 3000 is already in use by another service on your machine:

1. In `server.ts`, line 10 can be changed to:
   ```typescript
   const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
   ```
2. Then start with your desired port:
   - **Linux / macOS**:
     ```bash
     PORT=8080 npm start
     ```
   - **Windows PowerShell**:
     ```powershell
     $env:PORT="8080"; npm start
     ```
   - **Windows Command Prompt (cmd)**:
     ```cmd
     set PORT=8080 && npm start
     ```

---

## 5. Offline & Air-Gapped Use Note (Optional Fonts)

The application references Google Web Fonts (*Cinzel* and *EB Garamond*) in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400..900&family=EB+Garamond:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">
```

If you are running in a **strictly air-gapped / offline environment** without internet:
- The app will automatically fall back to your system fonts (`serif`, `Times New Roman`, `Georgia`, and `sans-serif`) without breaking or failing.
- Everything—searching, reading, lexicon lookup, concordance, bookmarks, and audio playback—functions 100% offline.
- If you wish to have the exact fonts offline, you can download the `.woff2` files into `public/fonts/` and link them via `src/index.css`.

---

## 6. Summary Command Reference

| Action | Command |
| :--- | :--- |
| **First-Time Install** | `npm install` |
| **Development Mode** | `npm run dev` |
| **Compile for Production** | `npm run build` |
| **Start Production Server** | `npm start` |
| **Type Check & Lint** | `npm run lint` |
| **Docker Build** | `docker build -t bible-study-suite .` |
| **Docker Run** | `docker run -d -p 3000:3000 bible-study-suite` |

For deep technical backend architecture details and API endpoint documentation, refer to **`HELP.md`**.
