const { githubFetch } = require("./_github");

module.exports = async (req, res) => {
  const asset = String(req.query.asset || "");
  if (!/^\d+$/.test(asset)) {
    res.status(400).send("Missing or invalid asset id");
    return;
  }

  try {
    // GitHub answers with a redirect to a short-lived signed URL for the file itself.
    const gh = await githubFetch(`/releases/assets/${asset}`, {
      headers: { Accept: "application/octet-stream" },
      redirect: "manual",
    });
    const location = gh.headers.get("location");
    if (gh.status >= 300 && gh.status < 400 && location) {
      res.setHeader("Cache-Control", "no-store");
      res.redirect(302, location);
      return;
    }
    res.status(gh.status === 404 ? 404 : 502).send(gh.status === 404 ? "Download not found" : "Download unavailable");
  } catch (err) {
    console.error(err);
    res.status(502).send("Download unavailable");
  }
};
