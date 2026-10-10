const isGitHubPages = !!process.env.GITHUB_PAGES;

export default {
  preset: process.env.VERCEL
    ? "vercel"
    : process.env.NETLIFY
      ? "netlify"
      : "node",
  ...(isGitHubPages
    ? { prerender: { routes: ["/"], crawlLinks: false } }
    : {}),
};
