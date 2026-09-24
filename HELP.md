# Bible Study Suite: Backend Architecture & Self-Hosting Guide

This document explains the technical architecture of the backend, how the data pipelines operate, and step-by-step instructions to run, build, and deploy this application outside of the Google AI Studio container environment.

- **GitHub Repository**: [https://github.com/justonemoreukfan/KJV-1828-Strongs](https://github.com/justonemoreukfan/KJV-1828-Strongs)
- **Live Published Web Edition**: [https://kjv-bible-1828-webster-dictionary-strong-s.ai.studio/](https://kjv-bible-1828-webster-dictionary-strong-s.ai.studio/)

---

## 1. System Overview & Architecture

This application is a **full-stack unified TypeScript application** combining a high-performance **Express.js API server** with a **React 19 + Vite client**.

```
┌─────────────────────────────────────────────────────────────┐
│                       Web Browser                           │
│  (React 19 + Tailwind CSS + Lucide Icons + Motion Engine)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API (/api/*)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Server                        │
│                     (Port 3000 / ESM)                       │
├──────────────────────────────┬──────────────────────────────┤
│      Vite Dev Middleware     │       In-Memory Index        │
│    (Dev Mode: HMR & assets)  │     & Cross-Ref Engine       │
├──────────────────────────────┴──────────────────────────────┤
│                     Core Services                           │
│  ├── bibleService.ts       (KJV 31,102 verses parser & italics engine)    │
│  ├── dictionaryService.ts  (Webster 1828 indexer, lemmatizer & phonetics) │
│  ├── strongsService.ts     (Hebrew & Greek root matcher)                  │
│  └── bibleMetadata.ts      (Canon ordering & abbreviations)               │
└──────────────────────────────┬──────────────────────────────┘
                               │ Reads JSON datasets on boot
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    server_data/ Directory                   │
│  ├── kjv.json             (66 Books, Authorized 1611 text)  │
│  ├── webster1828.json      (Full 1828 Lexicon definitions)  │
│  ├── strongs_hebrew.json   (H1 - H8674 roots & derivations) │
│  └── strongs_greek.json    (G1 - G5624 roots & derivations) │
└─────────────────────────────────────────────────────────────┘
```

### Why It Uses In-Memory Indexing
- **Zero External Database Overhead**: No PostgreSQL, MongoDB, or Redis required.
- **Microsecond Latency**: Lookups for definitions, Hebrew/Greek lemmas, and verse concordance occurrences complete in under 5 milliseconds.
- **Morphological Lemmatization**: Intelligent inflection mapping resolves biblical plurals, past tenses, and participles (e.g., `snares` $\rightarrow$ `snare`, `created` $\rightarrow$ `create`, `shined` $\rightarrow$ `shine`) to true singular and base headwords.
- **Clean Phonetic Respellings**: Pronunciation extraction is strictly scoped to entry headers, preserving authentic 1828 phonetic respellings (`a'bl`, `abolishun`, `Ile`, `dout`) without bleeding definition body words.
- **Cross-Dataset Dynamic Verification**: When you look up a word in Webster 1828, the backend instantly cross-checks Strong's Hebrew and Greek indices to verify if original manuscript roots exist before returning data to the client. If a word is an unmapped biblical proper name (`David`, `Solomon`), it links directly into Strong's Concordance.

---

## 2. Hardware & Runtime Prerequisites

To run this application on your local machine, VPS, or cloud platform:

| Requirement | Minimum | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v18.0.0` | `v20.x` or `v22.x` (LTS) | Required for ES Modules & TypeScript |
| **NPM** | `v9.0.0+` | `v10.x+` | Alternatively `pnpm`, `yarn`, or `bun` |
| **RAM** | `512 MB` | `1 GB` or higher | The datasets take ~200–350 MB in RAM |
| **Disk Space** | `500 MB` | `1 GB` | Includes `node_modules` and raw datasets |
| **Operating System** | Any | Linux / macOS / Windows | Works cross-platform |

---

## 3. Dataset Files (`server_data/`)

The application loads four static JSON files located in `./server_data`:

1. `server_data/kjv.json`:
   - Contains all 66 books of the King James Bible with chapter and verse arrays.
   - *Auto-download behavior*: If missing, `bibleService.ts` automatically downloads it from:
     `https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json`
2. `server_data/webster1828.json`:
   - Contains Noah Webster's complete 1828 Dictionary entries.
   - *Auto-download behavior*: If missing, `dictionaryService.ts` automatically downloads it from:
     `https://raw.githubusercontent.com/man4christ/1828-dictionary/master/json/dictionary_webster1828.json`
3. `server_data/strongs_hebrew.json`:
   - Contains James Strong's Hebrew & Aramaic lexicon (H1 to H8674), transliterations, pronunciations, and KJV translation keys.
4. `server_data/strongs_greek.json`:
   - Contains James Strong's Greek lexicon (G1 to G5624), transliterations, pronunciations, and KJV translation keys.

*Note: For air-gapped or offline environments, ensure the `server_data/` folder is copied together with the code.*

---

## 4. How to Run Locally (Step-by-Step)

### Step 1: Clone or Download the Project
Extract the zip or clone the repository to your computer:
```bash
cd your-project-folder
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run in Development Mode
In development, `tsx` runs `server.ts`. Express mounts Vite as a development middleware, providing instant frontend compilation and API routes:
```bash
npm run dev
```
Open your browser to:
```
http://localhost:3000
```

### Step 4: Run in Production Mode
For production, the client is compiled into optimized static HTML/CSS/JS in `dist/`, and the backend `server.ts` is bundled into `dist/server.cjs` via `esbuild`:

```bash
# 1. Build client and server bundle:
npm run build

# 2. Launch production server:
npm start
```
The server will boot and serve the compiled static application and API routes on port `3000`.

---

## 5. Running on a Custom Port

In the default code (`server.ts`), the port is set to `3000`:
```ts
const PORT = 3000;
```

To allow running on any port via the `PORT` environment variable (e.g. `PORT=8080`), you can edit `server.ts` line 10:
```ts
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
```
Then start the server:
```bash
PORT=8080 npm start
```

---

## 6. Docker Deployment

To run this application anywhere using Docker:

### Create a `Dockerfile`:
```dockerfile
# syntax=docker/dockerfile:1
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Build Vite frontend and server bundle
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled bundles and server datasets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server_data ./server_data

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
```

### Build and run the container:
```bash
# Build Docker image
docker build -t bible-study-suite .

# Run container mapping port 3000 to 3000
docker run -d -p 3000:3000 --name bible-app bible-study-suite
```
Visit `http://localhost:3000`.

---

## 7. VPS Deployment (Ubuntu / Debian with PM2 & Nginx)

If hosting on a virtual private server (e.g. DigitalOcean, Linode, AWS EC2, Hetzner):

### 1. Install Node.js and PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

### 2. Upload and Build the Code
```bash
cd /var/www/bible-study
npm install
npm run build
```

### 3. Start with PM2
```bash
pm2 start dist/server.cjs --name "bible-suite" --time
pm2 save
pm2 startup
```

### 4. Nginx Reverse Proxy Configuration
Create `/etc/nginx/sites-available/biblesuite`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $remote_addr;
    }
}
```
Enable site and reload:
```bash
sudo ln -s /etc/nginx/sites-available/biblesuite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Cloud PaaS Deployment (Render, Railway, Fly.io)

### Render.com
- **Environment**: Node
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/server.cjs`
- **Port**: Set `PORT` environment variable or leave default `3000`.

### Railway.app
- Deploy from GitHub repo.
- Railway detects `package.json` automatically and executes `npm run build` and `npm start`.

### Google Cloud Run
- Deploy directly using the `Dockerfile` provided above, or push image to Artifact Registry and deploy with minimum 512MiB RAM.

---

## 9. Backend API Endpoint Reference

All API routes return JSON and support standard HTTP GET requests:

| Endpoint | Query Parameters | Description |
| :--- | :--- | :--- |
| `GET /api/health` | None | Returns status and total count of indexed books |
| `GET /api/bible/books` | None | Returns metadata for all 66 books (name, testament, genre, chapters) |
| `GET /api/bible/chapter` | `book` (e.g. `gn`, `jn`), `chapter` (e.g. `1`) | Returns chapter verses, headers, and translator italics markers |
| `GET /api/bible/search` | `q` (query), `testament` (`ALL`, `OT`, `NT`), `limit` | Full-text Concordance search across 31,102 verses |
| `GET /api/dictionary/lookup` | `word` (e.g. `snares`, `charity`) | Looks up Webster 1828 definition with morphological lemmatization, pristine phonetic respelling, Strong's concordance validation, and King James occurrence counts |
| `GET /api/dictionary/search` | `q`, `limit` | Autocomplete & quick search for 1828 headwords |
| `GET /api/dictionary/index` | `letter` (A–Z), `page`, `limit`, `q` | Paginated alphabetical index for browsing the dictionary |
| `GET /api/dictionary/word/:word` | Path param `:word` | Direct entry definition query |
| `GET /api/strongs/lookup` | `word` (e.g. `faith`), `testament` (`OT`, `NT`) | Finds Hebrew & Greek lemmas for an English word and cross-checks Webster 1828 |
| `GET /api/strongs/search` | `q`, `limit` | Search Strong's English keywords, lemmas, or transliterations |
| `GET /api/strongs/index` | `letter` (A–Z), `page`, `limit`, `q` | Paginated index of biblical English words linked to Strong's numbers |
| `GET /api/strongs/entry/:id` | Path param `:id` (e.g. `H7225`, `G26`) | Detailed entry with Greek/Hebrew script, transliteration, pronunciation, and Strong's definition |
| `GET /api/strongs/occurrences` | `word`, `testament`, `bookId`, `limit` | Exact biblical verse occurrences where the word appears in the King James text |

---

## 10. Troubleshooting & FAQ

### Q: The server fails with "Cannot find module .../server_data/..."
**Solution**: Make sure the `server_data/` directory exists in the root folder alongside `package.json`. If downloading on a server with firewalled outbound internet, copy `server_data` manually from the repository.

### Q: JavaScript heap out of memory error
**Solution**: When running on very low-spec virtual servers (e.g. 512MB RAM without swap space), add the Node option to increase memory ceiling:
```bash
NODE_OPTIONS="--max-old-space-size=1024" npm start
```
Or create a 1GB swap file on Linux (`fallocate -l 1G /swapfile && mkswap /swapfile && swapon /swapfile`).

### Q: Can I run this with Bun?
**Solution**: Yes. You can run `bun server.ts` directly for development, or install dependencies using `bun install`.
