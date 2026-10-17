const FALLBACK_REPO = "gorillaou/kortex-client";

function detectRepo() {
  const host = location.hostname;
  if (host.endsWith(".github.io")) {
    const owner = host.split(".")[0];
    const repo = location.pathname.split("/").filter(Boolean)[0] || `${owner}.github.io`;
    return `${owner}/${repo}`;
  }
  return FALLBACK_REPO;
}

const REPO = detectRepo();

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) node.append(child);
  return node;
}

function isClientJar(asset) {
  return asset.name.endsWith(".jar") && !asset.name.endsWith("-sources.jar");
}

function renderRelease(release, isLatest) {
  const title = el("div", { class: "release-title" }, [
    el("h3", { text: release.name || release.tag_name }),
  ]);
  if (isLatest) title.append(el("span", { class: "badge latest", text: "Latest" }));
  if (release.prerelease) title.append(el("span", { class: "badge pre", text: "Pre-release" }));

  const head = el("div", { class: "release-head" }, [
    title,
    el("span", { class: "release-date", text: formatDate(release.published_at) }),
  ]);

  const card = el("article", { class: "card" }, [head]);

  if (release.body && release.body.trim()) {
    card.append(el("p", { class: "release-notes", text: release.body.trim() }));
  }

  const jars = release.assets.filter(isClientJar);
  const assets = el("div", { class: "assets" });
  for (const asset of jars) {
    const link = el("a", { class: "btn primary small", href: asset.browser_download_url }, [
      `Download ${asset.name} `,
      el("span", { class: "asset-size", text: `(${formatSize(asset.size)})` }),
    ]);
    assets.append(link);
  }
  if (!jars.length) {
    assets.append(el("a", { class: "btn ghost small", href: release.html_url, text: "View release" }));
  }
  card.append(assets);
  return card;
}

async function loadReleases() {
  const list = document.getElementById("release-list");
  try {
    const releases = [];
    for (let page = 1; ; page++) {
      const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`);
      if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
      const batch = await res.json();
      releases.push(...batch.filter((r) => !r.draft));
      if (batch.length < 100) break;
    }

    list.innerHTML = "";
    if (!releases.length) {
      list.append(el("div", { class: "card loading", text: "No versions released yet." }));
      return;
    }

    const latest = releases.find((r) => !r.prerelease) || releases[0];
    releases.forEach((release) => list.append(renderRelease(release, release === latest)));

    const latestJar = latest.assets.find(isClientJar);
    const btn = document.getElementById("latest-btn");
    if (latestJar) {
      btn.href = latestJar.browser_download_url;
      btn.textContent = `Download ${latest.tag_name}`;
    }
    document.getElementById("latest-meta").textContent =
      `${releases.length} version${releases.length === 1 ? "" : "s"} available · latest released ${formatDate(latest.published_at)}`;
  } catch (err) {
    list.innerHTML = "";
    const card = el("div", { class: "card error" }, [
      "Couldn't load versions right now. ",
      el("a", { href: `https://github.com/${REPO}/releases`, text: "View them on GitHub" }),
      ".",
    ]);
    list.append(card);
    console.error(err);
  }
}

loadReleases();
