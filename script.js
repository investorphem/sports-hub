async function fetchData(endpoint, containerId) {
  try {
    const res = await fetch(`/api/football?type=${endpoint}`);
    const data = await res.json();
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p>No data available</p>";
      return;
    }

    data.forEach(match => {
      const div = document.createElement("div");
      div.className = "match";
      div.innerHTML = `
        <strong>${match.homeTeam} vs ${match.awayTeam}</strong><br>
        ${match.score} <br>
        ${match.date}
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

fetchData("live", "scores-container");
fetchData("fixtures", "fixtures-container");
