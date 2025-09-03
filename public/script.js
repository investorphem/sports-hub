async function load(type, elId) {
  const el = document.getElementById(elId);
  el.innerHTML = "Loading…";
  try {
    const res = await fetch(`/api/football?type=${type}`);
    const json = await res.json();
    const matches = json.matches || [];

    if (matches.length === 0) {
      el.innerHTML = "<div class='muted'>No matches</div>";
      return;
    }

    el.innerHTML = matches.map(m => {
      const time = new Date(m.utcDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
      const score = m.scoreFull ? `<strong>${m.scoreFull}</strong>` : `<span class="muted">—</span>`;
      return `<div class="match">
        <div>
          <div style="font-weight:600">${m.homeTeam} vs ${m.awayTeam}</div>
          <div class="muted">${m.competition || ''} • ${time}</div>
        </div>
        <div>${score}</div>
      </div>`;
    }).join("");
  } catch (e) {
    console.error(e);
    el.innerHTML = "<div class='muted'>Failed to load</div>";
  }
}

// initial load plus refresh every 60s
load("live", "live");
load("fixtures", "fixtures");
setInterval(()=>{ load("live","live"); load("fixtures","fixtures"); }, 60000);
