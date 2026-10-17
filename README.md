# Kortex Client — Downloads

Download site for every version of Kortex Client, a Fabric utility client for Minecraft 26.3.

Live at **https://gorillaou.github.io/kortex-client/**

The site reads this repo's **Releases** at page load, so every published version (old and new) shows up automatically.

## Publishing a new version

Releases are published automatically by the client's Gradle build:

1. *(Optional)* Write what changed in `release-notes.txt` in the client project.
2. Run `./gradlew build`.

If the client's source changed since the last release, the build bumps the patch version
(`1.0.0` → `1.0.1`), builds the jar, and publishes it here as a new release. Older releases are never touched.
To jump to a bigger version, set `version=` in `gradle.properties` yourself before building.
