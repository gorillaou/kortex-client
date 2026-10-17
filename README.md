# Kortex Client — Downloads

Download site for every version of Kortex Client, a Fabric utility client for Minecraft.

Live at **https://kortex-client.vercel.app**

The repo is private, so the site never talks to GitHub from the browser. Two Vercel functions do it server-side:

- `api/releases.js` lists every release (old and new) for the site.
- `api/download.js?asset=<id>` redirects to a short-lived download link for a jar.

Both need a `GITHUB_TOKEN` environment variable in Vercel: a fine-grained token with read-only
**Contents** access to `gorillaou/kortex-client`.

## Publishing a new version

Releases are published automatically by the client's Gradle build:

1. *(Optional)* Write what changed in `release-notes.txt` in the client project.
2. Run `./gradlew build`.

If the client's source changed since the last release, the build bumps the patch version
(`1.0.0` → `1.0.1`), builds the jar, and publishes it as a new release with its requirements. Older
releases are never touched. To jump to a bigger version, set `version=` in `gradle.properties` yourself before building.
