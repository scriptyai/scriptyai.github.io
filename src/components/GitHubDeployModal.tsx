import { useState } from 'react';
import { 
  X, 
  Github, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  FileCode, 
  Terminal, 
  Layers, 
  Copy, 
  Check, 
  Sparkles,
  ShieldCheck,
  Globe,
  Download
} from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface GitHubDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export function GitHubDeployModal({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}: GitHubDeployModalProps) {
  const [activeTab, setActiveTab] = useState<'actions' | 'manual' | 'troubleshoot'>('actions');
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    soundEffects.playSuccess();
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleSaveKey = () => {
    onSaveApiKey(inputKey.trim());
    soundEffects.playSuccess();
  };

  const gitCommands = `# 1. Initialize git and add files
git init
git add .
git commit -m "Deploy Mujtaba Scripty AI to GitHub Pages"

# 2. Link your GitHub repository (replace with your repo URL)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main`;

  const buildCommands = `# 1. Install dependencies
npm install

# 2. Build the production static distribution
npm run build

# The output is in the 'dist' folder!
# Upload the contents inside 'dist' directly to your GitHub repo or gh-pages branch.`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0b0c16] border border-rose-900/40 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 font-sans">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-violet-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg">
              <Github className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Deploy to GitHub.com & github.io
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  White Screen Fixed
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configured with relative base paths, .nojekyll, 404 SPA handler & automated CI/CD
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Checklist Ribbon */}
        <div className="bg-slate-900/60 border-b border-slate-800/70 px-4 py-2.5 flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Relative Base: <code className="bg-slate-800 px-1 py-0.2 rounded font-mono text-emerald-300">./</code></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span><code className="bg-slate-800 px-1 py-0.2 rounded font-mono text-emerald-300">.nojekyll</code> Active</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span><code className="bg-slate-800 px-1 py-0.2 rounded font-mono text-emerald-300">404.html</code> Fallback</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Client AI Mode Active</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4">
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('actions');
            }}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'actions'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Method 1: GitHub Actions (Recommended)
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('manual');
            }}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Method 2: Upload Built Files (dist)
          </button>
          <button
            onClick={() => {
              soundEffects.playClick();
              setActiveTab('troubleshoot');
            }}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'troubleshoot'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Why White Screen Happens & Fixes
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">

          {/* TAB 1: GITHUB ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/30 via-slate-900 to-slate-900 border border-rose-900/30">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  Easiest & Most Reliable Method
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  We have added <code className="text-rose-300 bg-black/40 px-1 py-0.5 rounded font-mono">.github/workflows/deploy.yml</code> to your repository. 
                  When you upload your extracted zip files to GitHub, GitHub automatically compiles the TypeScript and Vite assets for you, eliminating 100% of white screens!
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Instructions:</h4>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Create a new repository on GitHub</div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Go to <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-rose-400 hover:underline inline-flex items-center gap-1">github.com/new <ExternalLink className="w-3 h-3" /></a> and create a public or private repository (e.g. <code className="bg-slate-800 px-1 rounded">mujtaba-scripty-ai</code>).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="w-full">
                    <div className="font-semibold text-slate-200">Upload your extracted zip files</div>
                    <p className="text-xs text-slate-400 mt-0.5 mb-2">
                      Extract the project zip and upload all the files directly to your GitHub repo, or run these git commands in your extracted folder:
                    </p>
                    <div className="relative">
                      <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                        {gitCommands}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(gitCommands, 'git')}
                        className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        {copiedSection === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSection === 'git' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">Enable GitHub Pages via GitHub Actions</div>
                    <div className="text-xs text-slate-300 mt-1 space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                      <div>1. In your GitHub repository, click on <strong className="text-white">Settings</strong> (gear icon).</div>
                      <div>2. In the left sidebar, click <strong className="text-white">Pages</strong>.</div>
                      <div>3. Under <strong className="text-white">Build and deployment &rarr; Source</strong>, select <strong className="text-rose-400">GitHub Actions</strong>.</div>
                      <div>4. Done! GitHub will automatically trigger the workflow and publish your site to:</div>
                      <div className="text-emerald-400 font-mono mt-1 text-xs">
                        https://&lt;your-username&gt;.github.io/&lt;your-repo-name&gt;/
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL DIST UPLOAD */}
          {activeTab === 'manual' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Uploading Pre-Compiled Production Build
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  If you want to upload files directly into GitHub without GitHub Actions building them, you must upload the <strong>compiled build</strong> files (the contents inside the <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded font-mono">dist</code> folder), NOT the raw <code className="font-mono">src/*.tsx</code> files. Browsers cannot parse uncompiled TypeScript!
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">How to Build & Upload:</h4>

                <div className="relative">
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {buildCommands}
                  </pre>
                  <button
                    onClick={() => copyToClipboard(buildCommands, 'build')}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedSection === 'build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSection === 'build' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Crucial Details Included for You:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 ml-1">
                    <li><strong className="text-slate-200">Base Path:</strong> We set <code className="text-rose-300">base: './'</code> in <code className="text-slate-200">vite.config.ts</code> so all JavaScript & CSS bundles link relatively instead of looking at the root domain!</li>
                    <li><strong className="text-slate-200">.nojekyll:</strong> Placed in <code className="text-slate-200">dist/.nojekyll</code> to ensure GitHub Pages does not drop files starting with underscores or specific characters.</li>
                    <li><strong className="text-slate-200">index.html at root:</strong> Place the files from inside <code className="text-slate-200">dist/</code> directly at the root of your GitHub repo or <code className="text-slate-200">gh-pages</code> branch.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TROUBLESHOOT */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/30">
                <h3 className="font-semibold text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  The 3 Reasons GitHub.io Gives a White Screen (And How We Fixed Them)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-rose-400 text-xs">
                    <span className="w-5 h-5 rounded-full bg-rose-950 flex items-center justify-center text-xs">1</span>
                    Wrong Base Path (Default Vite is '/')
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>Problem:</strong> On GitHub Pages, your site URL is <code className="text-slate-200">username.github.io/my-repo/</code>. If Vite builds with default <code className="text-rose-400">base: '/'</code>, index.html asks for <code className="text-rose-400">username.github.io/assets/main.js</code>, which gives a 404 Not Found &rarr; White Screen!
                  </p>
                  <p className="text-xs text-emerald-400 leading-relaxed">
                    <strong>Our Fix:</strong> We added <code className="text-emerald-300">base: './'</code> to <code className="text-emerald-300">vite.config.ts</code>. All scripts now load using relative URLs (<code className="text-emerald-300">./assets/main.js</code>) anywhere!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-rose-400 text-xs">
                    <span className="w-5 h-5 rounded-full bg-rose-950 flex items-center justify-center text-xs">2</span>
                    Uploading Raw .tsx Source Files Instead of Built Assets
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>Problem:</strong> When unzipping the source code, <code className="text-slate-200">index.html</code> points to <code className="text-rose-400">&lt;script src="/src/main.tsx"&gt;</code>. Web browsers cannot execute TypeScript directly!
                  </p>
                  <p className="text-xs text-emerald-400 leading-relaxed">
                    <strong>Our Fix:</strong> We included <code className="text-emerald-300">.github/workflows/deploy.yml</code> which compiles everything cleanly on GitHub Actions automatically!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 font-semibold text-rose-400 text-xs">
                    <span className="w-5 h-5 rounded-full bg-rose-950 flex items-center justify-center text-xs">3</span>
                    GitHub Pages Jekyll Filtering Out Assets
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>Problem:</strong> GitHub Pages runs Jekyll by default, ignoring files or folders starting with underscores.
                  </p>
                  <p className="text-xs text-emerald-400 leading-relaxed">
                    <strong>Our Fix:</strong> We added <code className="text-emerald-300">.nojekyll</code> in both root and public directories, permanently bypassing Jekyll.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Client-Side Gemini API Key for GitHub Pages */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <h4 className="font-semibold text-white text-xs sm:text-sm">Client-Side Gemini AI on GitHub Pages</h4>
              </div>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Optional
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              GitHub Pages is a static host (no Node.js server). All built-in tools (GUI Builder, Lua VM Sandbox, UNC Docs, Presets, Obfuscator, Security Auditor) work 100% offline! For live AI code generation on GitHub Pages, enter your Gemini API key below (saved securely in your browser's <code className="text-slate-300">localStorage</code>):
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy... (Paste Gemini API Key)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={handleSaveKey}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition cursor-pointer shadow-sm shadow-rose-600/30"
              >
                Save Key for GitHub Pages
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ready for GitHub.com & github.io deployment</span>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
