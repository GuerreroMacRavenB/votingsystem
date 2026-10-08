const CONFIG = {
  schoolName: "SACATA National High School",
  electionTitle: "SSLG Election",
  schoolYear: "S.Y. 2025-2026",
  adminPin: "SSLG2026",
  registeredVoters: []
};

const POSITIONS = [
  {
    id: "pres",
    title: "President",
    candidates: [
      { id: "p1", name: "Juan Dela Cruz", info: "Grade 12 - STEM" },
      { id: "p2", name: "Maria Santos", info: "Grade 11 - ABM" },
      { id: "p3", name: "Jose Rizal", info: "Grade 12 - HUMSS" }
    ]
  },
  {
    id: "vp",
    title: "Vice President",
    candidates: [
      { id: "v1", name: "Andrea Reyes", info: "Grade 12 - STEM" },
      { id: "v2", name: "Miguel Torres", info: "Grade 11 - STEM" },
      { id: "v3", name: "Angela Cruz", info: "Grade 12 - TVL" }
    ]
  },
  {
    id: "sec",
    title: "Secretary",
    candidates: [
      { id: "s1", name: "Patricia Lim", info: "Grade 11 - ABM" },
      { id: "s2", name: "Carlo Mendoza", info: "Grade 12 - STEM" },
      { id: "s3", name: "Sofia Ramos", info: "Grade 11 - HUMSS" }
    ]
  },
  {
    id: "treas",
    title: "Treasurer",
    candidates: [
      { id: "t1", name: "Daniel Go", info: "Grade 12 - TVL" },
      { id: "t2", name: "Erica Villanueva", info: "Grade 11 - STEM" },
      { id: "t3", name: "Nathan Bautista", info: "Grade 12 - ABM" }
    ]
  },
  {
    id: "aud",
    title: "Auditor",
    candidates: [
      { id: "a1", name: "Grace Tan", info: "Grade 11 - HUMSS" },
      { id: "a2", name: "Ryan Ocampo", info: "Grade 12 - STEM" },
      { id: "a3", name: "Kaye Flores", info: "Grade 11 - ABM" }
    ]
  },
  {
    id: "pio",
    title: "Public Information Officer",
    candidates: [
      { id: "i1", name: "Leo Garcia", info: "Grade 12 - ABM" },
      { id: "i2", name: "Trisha Nakamura", info: "Grade 11 - STEM" },
      { id: "i3", name: "Mark Delos Santos", info: "Grade 12 - HUMSS" }
    ]
  },
  {
    id: "sgt",
    title: "Sergeant-at-Arms",
    candidates: [
      { id: "g1", name: "Ramon Cruz", info: "Grade 12 - TVL" },
      { id: "g2", name: "Joshua Alcantara", info: "Grade 11 - ABM" },
      { id: "g3", name: "Ivan Reyes", info: "Grade 12 - STEM" }
    ]
  }
];

const BLANK = "__blank";
const KEY_TALLY = "sacata_sslg_tally";
const KEY_VOTERS = "sacata_sslg_voters";

let voter = null;
let selections = {};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    alert("Your browser blocked local storage. Results may not be saved.");
  }
}

function emptyTally() {
  const tally = {};
  POSITIONS.forEach((pos) => {
    tally[pos.id] = { blank: 0 };
    pos.candidates.forEach((c) => (tally[pos.id][c.id] = 0));
  });
  return tally;
}

function getTally() {
  const saved = load(KEY_TALLY, null);
  return saved || emptyTally();
}

function getVoters() {
  return load(KEY_VOTERS, []);
}

function showStep(stepId) {
  ["step-verify", "step-ballot", "step-review", "step-done"].forEach((id) => {
    document.getElementById(id).classList.toggle("hidden", id !== stepId);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderBallot() {
  const container = document.getElementById("ballot-container");
  container.innerHTML = "";

  POSITIONS.forEach((pos) => {
    const card = document.createElement("div");
    card.className = "card position";
    card.dataset.pos = pos.id;

    const head = document.createElement("div");
    head.className = "position-head";
    head.innerHTML = `<h3>${pos.title}</h3><span class="badge">Select one</span>`;
    card.appendChild(head);

    const list = document.createElement("div");
    list.className = "candidates";

    pos.candidates.forEach((c) => {
      const label = document.createElement("label");
      label.className = "candidate";
      label.innerHTML = `
        <input type="radio" name="${pos.id}" value="${c.id}">
        <span class="cand-info"><strong>${c.name}</strong><small>${c.info}</small></span>`;
      list.appendChild(label);
    });

    const blank = document.createElement("label");
    blank.className = "candidate blank";
    blank.innerHTML = `
      <input type="radio" name="${pos.id}" value="${BLANK}">
      <span>Leave this position blank (abstain)</span>`;
    list.appendChild(blank);

    card.appendChild(list);
    container.appendChild(card);
  });

  document.getElementById("ballot-meta").textContent =
    `${CONFIG.schoolName} | ${CONFIG.electionTitle} | ${CONFIG.schoolYear}`;
}

function handleBallotChange(e) {
  if (e.target.type !== "radio") return;
  const pos = e.target.name;
  selections[pos] = e.target.value;

  const card = e.target.closest(".position");
  card.querySelectorAll(".candidate").forEach((el) => el.classList.remove("selected"));
  e.target.closest(".candidate").classList.add("selected");
  const badge = card.querySelector(".badge");
  badge.textContent = e.target.value === BLANK ? "Blank" : "Selected";
  badge.classList.add("done");

  updateProgress();
}

function updateProgress() {
  const total = POSITIONS.length;
  const decided = POSITIONS.filter((p) => selections[p.id]).length;
  document.getElementById("progress-text").textContent = `${decided} of ${total} decided`;
  document.getElementById("progress-bar").style.width = `${(decided / total) * 100}%`;
  document.getElementById("btn-review").disabled = decided !== total;
}

function renderReview() {
  const list = document.getElementById("review-list");
  list.innerHTML = "";

  POSITIONS.forEach((pos) => {
    const pick = selections[pos.id];
    let text;
    if (pick === BLANK) {
      text = "Blank / Abstain";
    } else {
      const cand = pos.candidates.find((c) => c.id === pick);
      text = cand ? `${cand.name} — ${cand.info}` : "—";
    }

    const row = document.createElement("div");
    row.className = "review-item";
    row.innerHTML = `<span class="pos">${pos.title}</span><span class="pick${pick === BLANK ? " blank-pick" : ""}">${text}</span>`;
    list.appendChild(row);
  });
}

function castVote() {
  const tally = getTally();
  const voters = getVoters();

  POSITIONS.forEach((pos) => {
    const pick = selections[pos.id];
    if (pick === BLANK) {
      tally[pos.id].blank += 1;
    } else if (pick) {
      tally[pos.id][pick] += 1;
    }
  });

  voters.push({
    id: voter.id,
    name: voter.name,
    section: voter.section,
    time: new Date().toISOString()
  });

  save(KEY_TALLY, tally);
  save(KEY_VOTERS, voters);

  const receipt = `RECEIPT SN-SSLG-${Date.now().toString(36).toUpperCase()}`;
  document.getElementById("receipt").textContent =
    `${receipt} | ID: ${voter.id} | ${new Date().toLocaleString()}`;

  voter = null;
  selections = {};
  showStep("step-done");
}

function resetVotingForm() {
  document.getElementById("verify-form").reset();
  document.getElementById("verify-error").classList.add("hidden");
  renderBallot();
  updateProgress();
}

function verifyVoter(e) {
  e.preventDefault();

  const id = document.getElementById("student-id").value.trim().toUpperCase();
  const name = document.getElementById("student-name").value.trim();
  const section = document.getElementById("student-section").value.trim();
  const errorBox = document.getElementById("verify-error");

  function fail(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
  }

  if (id.length < 3) return fail("Please enter a valid student ID.");
  if (name.length < 3) return fail("Please enter your complete name.");
  if (section.length < 2) return fail("Please enter your grade and section.");

  const registered = CONFIG.registeredVoters.map((v) => v.trim().toUpperCase());
  if (registered.length > 0 && !registered.includes(id)) {
    return fail("Your student ID is not in the voters' list. Please see the election committee.");
  }

  const voters = getVoters();
  if (voters.some((v) => v.id.toUpperCase() === id)) {
    return fail("This student ID has already voted. One student, one vote.");
  }

  voter = { id, name, section };
  selections = {};
  errorBox.classList.add("hidden");
  resetVotingForm();
  showStep("step-ballot");
}

function renderResults() {
  const tally = getTally();
  const voters = getVoters();
  const container = document.getElementById("results-container");
  container.innerHTML = "";

  document.getElementById("stat-cast").textContent = voters.length;
  document.getElementById("stat-registered").textContent =
    CONFIG.registeredVoters.length > 0 ? CONFIG.registeredVoters.length : "Open";
  document.getElementById("stat-registered").style.fontSize =
    CONFIG.registeredVoters.length > 0 ? "" : "1.1rem";

  const registered = CONFIG.registeredVoters.length;
  document.getElementById("stat-turnout").textContent =
    registered > 0 ? `${Math.round((voters.length / registered) * 100)}%` : "—";
  document.getElementById("stat-positions").textContent = POSITIONS.length;

  POSITIONS.forEach((pos) => {
    const box = document.createElement("div");
    box.className = "card result-position";

    const total = pos.candidates.reduce((sum, c) => sum + (tally[pos.id][c.id] || 0), 0) + (tally[pos.id].blank || 0);

    const head = document.createElement("h3");
    head.innerHTML = `<span>${pos.title}</span><span class="total-badge">${total} ballots</span>`;
    box.appendChild(head);

    const max = Math.max(...pos.candidates.map((c) => tally[pos.id][c.id] || 0));
    const leaders = pos.candidates.filter((c) => (tally[pos.id][c.id] || 0) === max && max > 0);
    const tie = leaders.length > 1;

    pos.candidates.forEach((c) => {
      const votes = tally[pos.id][c.id] || 0;
      const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
      const isWinner = !tie && leaders.length === 1 && leaders[0].id === c.id;

      const row = document.createElement("div");
      row.className = "result-row";
      row.innerHTML = `
        <div class="result-line">
          <span class="name${isWinner ? " winner" : ""}">${c.name}</span>
          <span class="figures">${votes} votes (${pct}%)</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>`;
      box.appendChild(row);
    });

    const blankVotes = tally[pos.id].blank || 0;
    const blankPct = total > 0 ? Math.round((blankVotes / total) * 100) : 0;
    const blankRow = document.createElement("div");
    blankRow.className = "result-row";
    blankRow.innerHTML = `
      <div class="result-line">
        <span class="name" style="color:#6b7280">Blank / Abstain</span>
        <span class="figures">${blankVotes} votes (${blankPct}%)</span>
      </div>
      <div class="bar-track"><div class="bar-fill blank-bar" style="width:${blankPct}%"></div></div>`;
    box.appendChild(blankRow);

    if (tie) {
      const notice = document.createElement("p");
      notice.className = "warning";
      notice.textContent = `Tie for first place: ${leaders.map((l) => l.name).join(", ")}. Resolution is subject to the election committee.`;
      box.appendChild(notice);
    }

    container.appendChild(box);
  });
}

function exportCSV() {
  const tally = getTally();
  const voters = getVoters();
  const rows = [["Position", "Candidate", "Votes", "Percentage"]];

  POSITIONS.forEach((pos) => {
    const total = pos.candidates.reduce((sum, c) => sum + (tally[pos.id][c.id] || 0), 0) + (tally[pos.id].blank || 0);
    pos.candidates.forEach((c) => {
      const votes = tally[pos.id][c.id] || 0;
      const pct = total > 0 ? Math.round((votes / total) * 100) : 0;
      rows.push([pos.title, c.name, votes, pct + "%"]);
    });
    rows.push([pos.title, "Blank / Abstain", tally[pos.id].blank || 0, (total > 0 ? Math.round((tally[pos.id].blank / total) * 100) : 0) + "%"]);
  });

  rows.push([]);
  rows.push(["Total ballots cast", voters.length]);
  rows.push(["School", CONFIG.schoolName]);
  rows.push(["Election", `${CONFIG.electionTitle} ${CONFIG.schoolYear}`]);
  rows.push(["Date exported", new Date().toLocaleString()]);

  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SSLG-Results-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function resetElection() {
  const confirmed = confirm("Reset the election? This will permanently delete ALL ballots and results on this device.");
  if (!confirmed) return;
  if (!confirm("Final confirmation: erase every recorded vote?")) return;
  try {
    localStorage.removeItem(KEY_TALLY);
    localStorage.removeItem(KEY_VOTERS);
  } catch (e) {}
  voter = null;
  selections = {};
  resetVotingForm();
  renderResults();
  alert("Election data has been reset.");
}

function switchView(view) {
  document.getElementById("view-vote").classList.toggle("hidden", view !== "vote");
  document.getElementById("view-results").classList.toggle("hidden", view !== "results");
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.toggle("active", t.dataset.view === view);
  });
  if (view === "results") {
    document.getElementById("results-gate").classList.remove("hidden");
    document.getElementById("results-panel").classList.add("hidden");
    document.getElementById("pin").value = "";
    document.getElementById("pin-error").classList.add("hidden");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderBallot();
  updateProgress();

  document.getElementById("ballot-container").addEventListener("change", handleBallotChange);
  document.getElementById("verify-form").addEventListener("submit", verifyVoter);

  document.getElementById("btn-back").addEventListener("click", () => showStep("step-verify"));

  document.getElementById("btn-review").addEventListener("click", () => {
    renderReview();
    showStep("step-review");
  });

  document.getElementById("btn-edit").addEventListener("click", () => showStep("step-ballot"));

  document.getElementById("btn-cast").addEventListener("click", () => {
    if (confirm("Cast your vote now? Your ballot cannot be changed after this.")) castVote();
  });

  document.getElementById("btn-new").addEventListener("click", () => {
    resetVotingForm();
    showStep("step-verify");
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  document.getElementById("btn-unlock").addEventListener("click", () => {
    const pin = document.getElementById("pin").value;
    if (pin === CONFIG.adminPin) {
      document.getElementById("results-gate").classList.add("hidden");
      document.getElementById("results-panel").classList.remove("hidden");
      renderResults();
    } else {
      document.getElementById("pin-error").classList.remove("hidden");
    }
  });

  document.getElementById("pin").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-unlock").click();
  });

  document.getElementById("btn-lock").addEventListener("click", () => switchView("vote"));
  document.getElementById("btn-csv").addEventListener("click", exportCSV);
  document.getElementById("btn-reset").addEventListener("click", resetElection);
});
