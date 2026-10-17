const CACHE_KEY = "kortex-releases";
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Palettes mirror com.beastmode.client.theme.Themes.
const THEMES = [
  { name: "Midnight", bg: "#05070D", panel: "#0E1119", hover: "#161A25", accent: "#6C8CFF", accent2: "#A07BFF", enabled: "#6C8CFF", text: "#ECEFF6", muted: "#7D8598", outline: "#1D2230" },
  { name: "Ember", bg: "#0A0605", panel: "#140F0D", hover: "#1D1613", accent: "#FF7A45", accent2: "#FFC145", enabled: "#FF7A45", text: "#F6EEEA", muted: "#948077", outline: "#2A201C" },
  { name: "Toxic", bg: "#040805", panel: "#0D120E", hover: "#151C16", accent: "#9DFF5A", accent2: "#2EE6A6", enabled: "#9DFF5A", text: "#ECF6E8", muted: "#7E907A", outline: "#1C261D" },
  { name: "Ocean", bg: "#03080C", panel: "#0B1218", hover: "#121C24", accent: "#33D1FF", accent2: "#6C8CFF", enabled: "#33D1FF", text: "#E8F4FA", muted: "#7690A0", outline: "#182632" },
  { name: "Rose", bg: "#0A0508", panel: "#140D11", hover: "#1D1419", accent: "#FF5C93", accent2: "#FF9F6B", enabled: "#FF5C93", text: "#F8ECF1", muted: "#977C88", outline: "#2A1C23" },
  { name: "Frost", bg: "#06090C", panel: "#0F1418", hover: "#171E24", accent: "#A9DCFF", accent2: "#7FA8FF", enabled: "#A9DCFF", text: "#F2F7FB", muted: "#8496A4", outline: "#1E2730" },
  { name: "Neon", bg: "#000000", panel: "#0A0A0D", hover: "#141418", accent: "#FF2BD6", accent2: "#39FF14", enabled: "#39FF14", text: "#FFFFFF", muted: "#8A8A96", outline: "#1E1E26" },
];

const ICONS = {
  combat: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
  movement: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>',
  render: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  player: '<circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>',
  hud: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>',
  download: '<path d="M12 3v12m0 0l-5-5m5 5l5-5M4 21h16"/>',
};

const CATEGORIES = [
  {
    id: "combat", name: "Combat", wide: true,
    blurb: "Precise, tunable PvP assists with per-module settings.",
    modules: ["KillAura", "Triggerbot", "AimAssist", "Velocity", "Criticals", "AutoClicker", "Reach", "KeepSprint", "WTap", "BowAim", "AutoCrystal", "Surround"],
  },
  {
    id: "movement", name: "Movement", wide: true,
    blurb: "Move faster, higher and smarter around the world.",
    modules: ["Fly", "Speed", "Scaffold", "Jesus", "NoFall", "Step", "NoSlow", "HighJump", "LongJump", "Timer", "Strafe", "AirJump", "Spider", "Parkour", "SafeWalk", "AutoSprint"],
  },
  {
    id: "render", name: "Render",
    blurb: "See ores, storage, players and hidden bases.",
    modules: ["StorageFinder", "BaseFinder", "ESP", "OreESP", "BlockESP", "DropESP", "Tracers", "Breadcrumbs", "Freecam", "Fullbright", "Zoom", "NoRender", "NoHurtCam", "Ambience"],
  },
  {
    id: "player", name: "Player",
    blurb: "Automate the boring parts of survival.",
    modules: ["AutoTotem", "ChestStealer", "InventoryMove", "AutoEat", "AutoTool", "FastPlace", "AntiAfk", "AutoFish"],
  },
  {
    id: "hud", name: "HUD",
    blurb: "Clean on-screen info that follows your theme.",
    modules: ["ArrayList", "Watermark", "Coordinates", "ArmorHUD", "PotionHUD", "FPS", "Nametags"],
  },
];

const GUI_SETTINGS = {
  KillAura: [["Range", "4.2", 70], ["CPS", "12", 60], ["Targets", "Players"]],
  Triggerbot: [["Delay", "80ms", 35], ["Weapon only", "On"]],
  AimAssist: [["Speed", "3.5", 45], ["FOV", "90°", 50]],
  Velocity: [["Horizontal", "0%", 0], ["Vertical", "0%", 0]],
  Reach: [["Distance", "3.4", 40]],
  AutoClicker: [["Min CPS", "9", 45], ["Max CPS", "13", 65]],
};

const state = {
  enabled: new Set(["KillAura", "Velocity", "Criticals"]),
  expanded: new Set(),
};

/* ---------- Helpers ---------- */

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) if (child != null) node.append(child);
  return node;
}

function icon(name) {
  return el("span", { html: `<svg viewBox="0 0 24 24">${ICONS[name]}</svg>` }).firstChild;
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function timeAgo(iso) {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of units) {
    const value = Math.floor(seconds / size);
    if (value >= 1) return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
  }
  return "just now";
}

function formatNumber(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

function cleanNotes(body) {
  return (body || "").replace(/<!--[\s\S]*?-->/g, "").replace(/\*\*/g, "").replace(/^#+\s*/gm, "").trim();
}

let toastTimer;
function toast(message) {
  const node = document.getElementById("toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 2200);
}

/* ---------- Themes ---------- */

let canvasColor = hexToRgb(THEMES[0].accent);

function applyTheme(name, announce = false) {
  const theme = THEMES.find((t) => t.name === name) || THEMES[0];
  const root = document.documentElement.style;
  root.setProperty("--bg", theme.bg);
  root.setProperty("--panel", theme.panel);
  root.setProperty("--panel-hover", theme.hover);
  root.setProperty("--accent", theme.accent);
  root.setProperty("--accent-2", theme.accent2);
  root.setProperty("--enabled", theme.enabled);
  root.setProperty("--text", theme.text);
  root.setProperty("--muted", theme.muted);
  root.setProperty("--outline", theme.outline);
  root.setProperty("--accent-rgb", hexToRgb(theme.accent).join(", "));
  document.documentElement.dataset.theme = theme.name;
  document.querySelector('meta[name="theme-color"]').setAttribute("content", theme.bg);
  canvasColor = hexToRgb(theme.accent);
  localStorage.setItem("kortex-theme", theme.name);
  document.querySelectorAll(".theme-card").forEach((card) => card.classList.toggle("active", card.dataset.theme === theme.name));
  if (announce) toast(`${theme.name} theme applied`);
}

function renderThemes() {
  const grid = document.getElementById("theme-grid");
  for (const theme of THEMES) {
    const card = el("button", {
      class: "theme-card",
      type: "button",
      "data-theme": theme.name,
      "aria-label": `Apply ${theme.name} theme`,
      style: `--t-bg:${theme.bg};--t-panel:${theme.panel};--t-accent:${theme.accent};--t-enabled:${theme.enabled};--t-text:${theme.text};--t-outline:${theme.outline}`,
      onclick: () => applyTheme(theme.name, true),
    }, [
      el("div", { class: "theme-preview" }, [el("i"), el("i"), el("i"), el("i")]),
      el("div", { class: "theme-name" }, [theme.name, el("span")]),
    ]);
    grid.append(card);
  }
}

/* ---------- Features ---------- */

function renderFeatures() {
  const grid = document.getElementById("feature-grid");
  for (const category of CATEGORIES) {
    grid.append(el("article", { class: `feature glass reveal${category.wide ? " wide" : ""}` }, [
      el("div", { class: "feature-icon" }, icon(category.id)),
      el("h3", {}, [category.name, el("small", { text: `${category.modules.length} modules` })]),
      el("p", { text: category.blurb }),
      el("div", { class: "chips" }, category.modules.map((m) => el("span", { class: "chip", text: m }))),
    ]));
  }
}

function renderMarquee() {
  const names = CATEGORIES.flatMap((c) => c.modules);
  const track = document.getElementById("marquee");
  for (const name of [...names, ...names]) track.append(el("span", { text: name }));
}

/* ---------- Mock ClickGUI ---------- */

function renderGui() {
  const list = document.getElementById("gui-modules");
  const combat = CATEGORIES[0].modules;
  list.innerHTML = "";
  for (const name of combat) {
    const on = state.enabled.has(name);
    const row = el("li", {
      class: `gui-module${on ? " on" : ""}`,
      onclick: () => {
        state.enabled.has(name) ? state.enabled.delete(name) : state.enabled.add(name);
        renderGui();
      },
      oncontextmenu: (event) => {
        event.preventDefault();
        state.expanded.has(name) ? state.expanded.delete(name) : state.expanded.add(name);
        renderGui();
      },
    }, [el("span", { text: name }), el("span", { class: "dots", text: state.expanded.has(name) ? "−" : "···" })]);
    list.append(row);

    if (state.expanded.has(name)) {
      const settings = GUI_SETTINGS[name] || [["Keybind", "None"], ["Visible", "On"]];
      list.append(el("li", { class: "gui-settings" }, settings.map(([label, value, fill]) => el("div", {}, [
        el("div", { class: "gui-setting" }, [el("span", { text: label }), el("b", { text: value })]),
        fill != null ? el("div", { class: "gui-slider" }, el("i", { style: `width:${fill}%` })) : null,
      ]))));
    }
  }
  document.getElementById("gui-count").textContent = `${combat.filter((m) => state.enabled.has(m)).length}/${combat.length}`;
  renderArrayList();
}

function renderArrayList() {
  const list = document.getElementById("arraylist");
  const names = [...state.enabled, "AutoSprint", "Fullbright", "StorageFinder"].sort((a, b) => b.length - a.length);
  list.innerHTML = "";
  for (const name of names) list.append(el("li", { text: name }));
}

/* ---------- Releases ---------- */

function isClientJar(asset) {
  return asset.name.endsWith(".jar") && !asset.name.endsWith("-sources.jar");
}

function primaryJar(release) {
  return release.assets.find(isClientJar);
}

// Each release body carries <!-- kortex-meta {...} --> written by the client's Gradle publish task.
function releaseRequirements(release) {
  const match = (release.body || "").match(/<!--\s*kortex-meta\s*(\{[\s\S]*?\})\s*-->/);
  if (!match) return null;
  try {
    const meta = JSON.parse(match[1]);
    return [
      ["Minecraft", meta.minecraft],
      ["Fabric Loader", meta.loader && `${meta.loader}+`],
      ["Fabric API", meta.fabricApi],
      ["Java", meta.java && `${meta.java}+`],
    ].filter(([, value]) => value);
  } catch {
    return null;
  }
}

function requirementChips(release) {
  const reqs = releaseRequirements(release);
  if (!reqs) return el("div", { class: "req-chips" }, el("span", { class: "req-chip muted", text: "Requirements not listed" }));
  return el("div", { class: "req-chips" }, reqs.map(([label, value]) => el("span", { class: "req-chip" }, [el("span", { text: label }), el("b", { text: value })])));
}

function downloadButton(release, size = "btn-md") {
  const jar = primaryJar(release);
  if (!jar) return el("span", { class: `btn btn-ghost ${size}`, text: "No download" });
  return el("a", { class: `btn btn-primary ${size}`, href: jar.browser_download_url, onclick: () => toast(`Downloading ${jar.name}…`) }, [icon("download"), "Download"]);
}

function renderLatest(release) {
  const container = document.getElementById("latest-release");
  const jar = primaryJar(release);
  const notes = cleanNotes(release.body) || "No release notes for this version.";

  const side = el("div", { class: "latest-side" }, [
    el("div", { class: "meta-grid" }, [
      el("div", { class: "meta-item" }, [el("span", { text: "File" }), el("b", { text: jar ? jar.name : "—" })]),
      el("div", { class: "meta-item" }, [el("span", { text: "Size" }), el("b", { text: jar ? formatSize(jar.size) : "—" })]),
      el("div", { class: "meta-item" }, [el("span", { text: "Downloads" }), el("b", { text: jar ? formatNumber(jar.download_count) : "—" })]),
      el("div", { class: "meta-item" }, [el("span", { text: "Released" }), el("b", { text: timeAgo(release.published_at) })]),
    ]),
    downloadButton(release, "btn-lg"),
  ]);

  container.innerHTML = "";
  container.append(el("article", { class: "latest-card glass" }, [
    el("div", {}, [
      el("div", { class: "latest-tag" }, [
        el("span", { class: "badge badge-latest", text: "Latest release" }),
        el("span", { class: "badge badge-date", text: formatDate(release.published_at) }),
      ]),
      el("h3", { text: release.tag_name }),
      el("p", { class: "latest-notes", text: notes }),
      el("p", { class: "req-label", text: "Requirements" }),
      requirementChips(release),
    ]),
    side,
  ]));
}

function renderTimeline(releases, latest) {
  const list = document.getElementById("release-list");
  const query = document.getElementById("version-search").value.trim().toLowerCase();
  const filtered = releases.filter((r) => `${r.tag_name} ${r.name} ${r.body}`.toLowerCase().includes(query));

  list.innerHTML = "";
  if (!filtered.length) {
    list.append(el("li", { class: "empty", text: query ? `No versions match "${query}".` : "No versions released yet." }));
    return;
  }

  for (const release of filtered) {
    const jar = primaryJar(release);
    const isLatest = release === latest;
    const title = el("div", { class: "release-title" }, [el("h4", { text: release.tag_name })]);
    if (isLatest) title.append(el("span", { class: "badge badge-latest", text: "Latest" }));
    if (release.prerelease) title.append(el("span", { class: "badge badge-pre", text: "Pre-release" }));

    const firstLine = cleanNotes(release.body).split("\n")[0];
    const sub = [formatDate(release.published_at), jar ? `${formatNumber(jar.download_count)} download${jar.download_count === 1 ? "" : "s"}` : null, firstLine || null].filter(Boolean).join(" · ");

    list.append(el("li", { class: `release-row${isLatest ? " is-latest" : ""}` }, [
      el("div", { class: "release-main" }, [title, el("p", { class: "release-sub", text: sub }), requirementChips(release)]),
      el("div", { class: "release-actions" }, [
        jar ? el("span", { class: "release-size", text: formatSize(jar.size) }) : null,
        downloadButton(release, "btn-sm"),
      ]),
    ]));
  }
}

function applyReleases(releases) {
  if (!releases.length) {
    document.getElementById("latest-release").innerHTML = "";
    document.getElementById("hero-pill").textContent = "First release coming soon";
    document.getElementById("stat-versions").textContent = "0";
    document.getElementById("stat-downloads").textContent = "0";
    renderTimeline([], null);
    return;
  }

  const latest = releases.find((r) => !r.prerelease) || releases[0];
  const jar = primaryJar(latest);
  const totalDownloads = releases.reduce((sum, r) => sum + r.assets.filter(isClientJar).reduce((s, a) => s + a.download_count, 0), 0);

  renderLatest(latest);
  renderTimeline(releases, latest);
  document.getElementById("version-search").oninput = () => renderTimeline(releases, latest);

  document.getElementById("hero-pill").textContent = `${latest.tag_name} is out · ${timeAgo(latest.published_at)}`;
  document.getElementById("hero-download-label").textContent = `Download ${latest.tag_name}`;
  document.getElementById("cta-download-label").textContent = `Download ${latest.tag_name}`;
  document.getElementById("wm-version").textContent = latest.tag_name.replace(/^v/, "");
  const latestMc = (releaseRequirements(latest) || []).find(([label]) => label === "Minecraft");
  if (latestMc) document.getElementById("hero-mc").textContent = latestMc[1];
  countUp(document.getElementById("stat-versions"), releases.length);
  countUp(document.getElementById("stat-downloads"), totalDownloads, formatNumber);

  if (jar) {
    document.querySelectorAll("[data-latest-link]").forEach((link) => {
      link.href = jar.browser_download_url;
      link.addEventListener("click", () => toast(`Downloading ${jar.name}…`));
    });
  }
}

async function fetchReleases() {
  const res = await fetch("/api/releases");
  if (!res.ok) throw new Error(`Releases API returned ${res.status}`);
  return res.json();
}

async function loadReleases() {
  try {
    const releases = await fetchReleases();
    localStorage.setItem(CACHE_KEY, JSON.stringify(releases));
    applyReleases(releases);
  } catch (err) {
    console.error(err);
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      applyReleases(JSON.parse(cached));
      return;
    }
    document.getElementById("latest-release").innerHTML = "";
    const list = document.getElementById("release-list");
    list.innerHTML = "";
    list.append(el("li", { class: "empty", text: "Couldn't load versions right now. Try again in a minute." }));
    document.getElementById("hero-pill").textContent = "Downloads are temporarily unavailable";
  }
}

/* ---------- Motion ---------- */

function countUp(node, target, format = String) {
  if (prefersReducedMotion) {
    node.textContent = format(target);
    return;
  }
  const start = performance.now();
  const duration = 1400;
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 4);
    node.textContent = format(Math.round(target * eased));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach((node, i) => {
    node.style.transitionDelay = `${(i % 3) * 80}ms`;
    observer.observe(node);
  });
}

function setupGlassGlow() {
  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".glass");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  });
}

function setupNav() {
  const nav = document.getElementById("nav");
  const update = () => nav.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", update, { passive: true });
  update();
}

function setupCanvas() {
  const canvas = document.getElementById("bg-canvas");
  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999 };
  let particles = [];
  let width = 0;
  let height = 0;

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.floor((width * height) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.4,
    }));
  };

  const draw = () => {
    const [r, g, b] = canvasColor;
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140) {
        p.x += (dx / dist) * 0.8;
        p.y += (dy / dist) * 0.8;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.6)`;
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const c = particles[j];
        const d = Math.hypot(a.x - c.x, a.y - c.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.16 * (1 - d / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(c.x, c.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  };

  addEventListener("resize", resize);
  addEventListener("pointermove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();
  if (!prefersReducedMotion) requestAnimationFrame(draw);
}

/* ---------- Boot ---------- */

renderThemes();
renderFeatures();
renderMarquee();
applyTheme(localStorage.getItem("kortex-theme") || "Midnight");
renderGui();
setupNav();
setupGlassGlow();
setupCanvas();
setupReveal();
document.querySelectorAll("[data-count]").forEach((node) => countUp(node, Number(node.dataset.count)));
loadReleases();
