const REPO = process.env.GITHUB_REPO || "gorillaou/kortex-client";

function githubFetch(path, init = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  return fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "kortex-client-site",
      ...init.headers,
    },
  });
}

module.exports = { githubFetch };
