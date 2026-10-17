# Kortex Client — Downloads

Download site for every version of Kortex Client, a Fabric utility client for Minecraft 26.3.

The site lists all releases from this repo's **Releases** tab automatically.

## Publishing a new version

1. Build the client: `./gradlew build` (jar lands in `build/libs/`).
2. Create a release with the jar attached:

```bash
gh release create v1.1.0 build/libs/kortex-1.1.0.jar --repo gorillaou/kortex-client --title "Kortex 1.1.0" --notes "What's new..."
```

The new version appears on the site immediately.
