import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

const isGitHubPages = !!process.env.GITHUB_PAGES;
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath =
  process.env.BASE_PATH ??
  (isGitHubPages ? `/${repoName || "skycast-weather-dashboard"}` : "");

export default defineConfig({
  base: basePath ? `${basePath}/` : "/",
  server: { port: 3000 },
  plugins: [
    tsConfigPaths(),
    tanstackStart({
      router: { basepath: basePath },
      ...(isGitHubPages ? { spa: { enabled: true } } : {}),
    }),
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
});
