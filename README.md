# Kortex Client — Downloads

Download site for every version of Kortex Client, a Fabric utility client for Minecraft.

Live at **https://kortex-client.vercel.app**

The site lists releases through a Vercel function, `api/releases.js`, so every version (old and new) shows up automatically.

While the repo is public, no setup is needed: downloads go straight to GitHub.
If the repo is made private, add a `GITHUB_TOKEN` environment variable in Vercel (a fine-grained token with
read-only **Contents** access to `gorillaou/kortex-client`). Downloads then go through `api/download.js`,
which redirects to a short-lived download link.

## Publishing a new version

Releases are published automatically by the client's Gradle build:

1. *(Optional)* Write what changed in `release-notes.txt` in the client project.
2. Run `./gradlew build`.

If the client's source changed since the last release, the build bumps the patch version
(`1.0.0` → `1.0.1`), builds the jar, and publishes it as a new release with its requirements. Older
releases are never touched. To jump to a bigger version, set `version=` in `gradle.properties` yourself before building.
