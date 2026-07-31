(() => {
  "use strict";

  const USER = "shingo0620";
  const EXCLUDED_REPOS = new Set(["claude-usage", "openab"]);
  const ghRepos = document.getElementById("ghRepos");
  const ghFollowers = document.getElementById("ghFollowers");
  const ghSince = document.getElementById("ghSince");
  const ghRecent = document.getElementById("ghRecent");

  if (!ghRepos || !ghRecent) return;

  // Fallback snapshot used only if the live GitHub API call fails
  // (rate limit / offline). Keeps the panel from looking broken.
  const FALLBACK = {
    public_repos: 50,
    followers: 2,
    created_at: "2015-01-01T00:00:00Z",
    recent: [
      { name: "SPT", pushed_at: "2026-07-30T15:56:30Z" },
      { name: "my-vapor-fighter", pushed_at: "2026-07-27T03:38:49Z" },
      { name: "my-llm-wiki", pushed_at: "2026-07-11T03:08:51Z" },
      { name: "my-fable5-assitant", pushed_at: "2026-07-08T07:00:27Z" },
    ],
  };

  function timeAgo(iso) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const day = 86400000;
    const days = Math.floor(diffMs / day);
    if (days <= 0) return "today";
    if (days === 1) return "1d ago";
    if (days < 30) return days + "d ago";
    const months = Math.floor(days / 30);
    if (months < 12) return months + "mo ago";
    return Math.floor(months / 12) + "y ago";
  }

  function render(profile, repos) {
    ghRepos.textContent = profile.public_repos;
    ghFollowers.textContent = profile.followers;
    ghSince.textContent = new Date(profile.created_at).getFullYear();

    const items = repos
      .filter((r) => !EXCLUDED_REPOS.has(r.name))
      .slice(0, 5)
      .map(
        (r) => `
      <div class="gh-recent-item">
        <a href="https://github.com/${USER}/${r.name}" target="_blank" rel="noopener">${r.name}</a>
        <time>${timeAgo(r.pushed_at)}</time>
      </div>`
      );
    ghRecent.innerHTML = items.join("") || '<div class="gh-recent-item"><span class="muted">no public activity</span></div>';
  }

  async function load() {
    try {
      const [profileRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${USER}`, { headers: { Accept: "application/vnd.github+json" } }),
        fetch(`https://api.github.com/users/${USER}/repos?sort=pushed&per_page=10`, {
          headers: { Accept: "application/vnd.github+json" },
        }),
      ]);
      if (!profileRes.ok || !reposRes.ok) throw new Error("github api error");
      const profile = await profileRes.json();
      const repos = await reposRes.json();
      render(profile, repos);
    } catch (err) {
      render(FALLBACK, FALLBACK.recent);
    }
  }

  load();
})();
