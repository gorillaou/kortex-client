const REPO = process.env.GITHUB_REPO || "gorillaou/kortex-client";

// Without a token this only works while the repo is public, and is limited to 60 GitHub calls an hour.
function hasToken() {
  return Boolean(process.env.GITHUB_TOKEN);
}

function githubFetch(path, init = {}) {
  const headers = {
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "kortex-client-site",
    ...init.headers,
  };
  if (hasToken()) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return fetch(`https://api.github.com/repos/${REPO}${path}`, { ...init, headers });
}

module.exports = { githubFetch, hasToken };
