const { githubFetch, hasToken } = require("./_github");

module.exports = async (req, res) => {
  try {
    const releases = [];
    for (let page = 1; ; page++) {
      const gh = await githubFetch(`/releases?per_page=100&page=${page}`, { headers: { Accept: "application/vnd.github+json" } });
      if (!gh.ok) throw new Error(`GitHub API returned ${gh.status}`);
      const batch = await gh.json();
      releases.push(...batch.filter((r) => !r.draft));
      if (batch.length < 100) break;
    }

    const body = releases.map((r) => ({
      tag_name: r.tag_name,
      name: r.name,
      body: r.body,
      prerelease: r.prerelease,
      published_at: r.published_at,
      assets: r.assets.map((a) => ({
        name: a.name,
        size: a.size,
        download_count: a.download_count,
        browser_download_url: hasToken() ? `/api/download?asset=${a.id}` : a.browser_download_url,
      })),
    }));

    res.setHeader("Cache-Control", hasToken()
      ? "public, s-maxage=60, stale-while-revalidate=300"
      : "public, s-maxage=300, stale-while-revalidate=3600");
    res.status(200).json(body);
  } catch (err) {
    console.error(err);
    res.setHeader("Cache-Control", "no-store");
    res.status(502).json({ error: "Couldn't load releases", reason: err.message });
  }
};
