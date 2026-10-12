# Mujtaba Scripty AI ⚡

> **Next-Generation Executor (UNC) Luau Scripting Studio & Coding Assistant**

Mujtaba Scripty AI is an interactive web studio and specialized coding engine for writing, analyzing, optimizing, and debugging Roblox Luau scripts and UNC (Unified Naming Convention) executor scripts.

---

## 🌟 Features

- **Roblox Luau & UNC Integration**: Pre-configured for Synapse, Wave, Krnl, Delta, Fluxus, Codex, and standard UNC environments.
- **Pure Luau Draggable GUI Builder**: Generate self-contained UI interfaces with smooth TweenService animations and zero external assets.
- **In-Browser Lua 5.3 Sandbox**: Test, run, and experiment with standard Lua code directly in your browser powered by Fengari.
- **Code Security & Anti-Cheat Audit**: Analyze scripts for anti-cheat detections, unvalidated remotes, and memory leaks.
- **Obfuscator & Minifier Tools**: Compress variable identifiers and minify production scripts.
- **Visual Code Diff Comparison**: Compare original vs modified scripts side-by-side with line highlights.
- **Script Stash**: Save, organize, and export your generated Lua scripts locally.
- **Streaming AI Generation**: Fast token streaming with fallback support for client and server execution.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- A [Google Gemini API Key](https://aistudio.google.com/)

### 1. Clone or Download the Repository
```bash
git clone https://github.com/your-username/mujtaba-scripty-ai.git
cd mujtaba-scripty-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```bash
cp .env.example .env
```
Add your Gemini API key in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Express server with Vite middleware on port 3000 |
| `npm run build` | Builds the production bundle to `dist/` |
| `npm start` | Runs the production server via `tsx server.ts` |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview` | Previews the production build locally |

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI workflow
├── netlify/
│   └── functions/               # Serverless fallback functions
├── public/                      # Static assets & previews
├── src/
│   ├── components/              # Modals, GUI builder, Sandbox, Header, etc.
│   ├── types/                   # TypeScript interfaces and Lua definitions
│   ├── utils/                   # Audio effects, gemini fallbacks, formatters
│   ├── App.tsx                  # Main workspace application
│   ├── index.css                # Tailwind CSS v4 styling
│   └── main.tsx                 # React entry point
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore patterns
├── package.json                 # Project dependencies & scripts
├── server.ts                    # Express backend & AI streaming API
├── tsconfig.json                # TypeScript compiler configuration
└── vite.config.ts               # Vite configuration
```

---

## 🛡️ License

This project is licensed under the Apache-2.0 License.
