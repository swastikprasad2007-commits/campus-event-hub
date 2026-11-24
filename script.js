const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "Rapid Prototyping & AI Agents Sprint",
    club: "Builder's Guild",
    category: "Tech & AI",
    date: "Thu, 26 Nov • 3:00 PM",
    venue: "Innovation Lab 204",
    desc: "Hands-on session building clean web tools and structured prompt workflows in small teams."
  },
  {
    id: "evt-2",
    title: "UI Typography & Layout Critique",
    club: "Design Collective",
    category: "Design & Media",
    date: "Fri, 27 Nov • 5:00 PM",
    venue: "Studio Room 102",
    desc: "Bring a work-in-progress interface or poster for constructive feedback on hierarchy and spacing."
  },
  {
    id: "evt-3",
    title: "Evening Badminton Rally & Mobility",
    club: "Court & Conditioning",
    category: "Sports & Wellness",
    date: "Sat, 28 Nov • 6:00 AM",
    venue: "Indoor Sports Complex",
    desc: "Fast-paced doubles rotations followed by a 15-minute shoulder and lower-back cool-down."
  },
  {
    id: "evt-4",
    title: "Acoustic Unplugged & Open Mic",
    club: "Stagecraft Society",
    category: "Cultural",
    date: "Sat, 28 Nov • 6:30 PM",
    venue: "Amphitheatre Courtyard",
    desc: "Low-key evening performances featuring indie covers, spoken word, and live instrumentals."
  },
  {
    id: "evt-5",
    title: "Git, Debugging & Clean Code Clinic",
    club: "Open Source Circle",
    category: "Tech & AI",
    date: "Sun, 29 Nov • 2:00 PM",
    venue: "Computing Block Lab 3",
    desc: "Practical walkthrough of branch workflows, DevTools inspection, and avoiding common front-end bugs."
  },
  {
    id: "evt-6",
    title: "Campus Street Photography Walk",
    club: "Lens & Frame",
    category: "Design & Media",
    date: "Sun, 29 Nov • 4:30 PM",
    venue: "Central Plaza Gate",
    desc: "Golden-hour walk focused on framing, natural light, and candid campus storytelling."
  }
];

const STORAGE_KEYS = {
  events: "campus_hub_events_v1",
  rsvps: "campus_hub_rsvps_v1"
};

let events = JSON.parse(localStorage.getItem(STORAGE_KEYS.events) || "null") || INITIAL_EVENTS;
let rsvpIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.rsvps) || "[]");
let activeCategory = "All";
let searchQuery = "";

const eventsGrid = document.getElementById("eventsGrid");
const resultCountText = document.getElementById("resultCountText");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll(".tab");
const rsvpList = document.getElementById("rsvpList");
const rsvpCountBadge = document.getElementById("rsvpCountBadge");
const clearRsvpsBtn = document.getElementById("clearRsvpsBtn");
const addEventForm = document.getElementById("addEventForm");

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function saveData() {
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
  localStorage.setItem(STORAGE_KEYS.rsvps, JSON.stringify(rsvpIds));
}

function getFilteredEvents() {
  return events.filter((evt) => {
    const matchesCategory = activeCategory === "All" || evt.category === activeCategory;
    const haystack = `${evt.title} ${evt.club} ${evt.venue} ${evt.desc}`.toLowerCase();
    const matchesSearch = haystack.includes(searchQuery.trim().toLowerCase());
    return matchesCategory && matchesSearch;
  });
}

function renderEvents() {
  const filtered = getFilteredEvents();
  resultCountText.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? "event" : "events"}`;

  if (filtered.length === 0) {
    eventsGrid.innerHTML = `
      <article class="event-card">
        <h3 class="event-title">No matching events found</h3>
        <p class="event-desc">Try clearing your search filter or switching to another category tab.</p>
      </article>
    `;
    return;
  }

  eventsGrid.innerHTML = filtered
    .map((evt) => {
      const isGoing = rsvpIds.includes(evt.id);
      return `
        <article class="event-card">
          <div>
            <div class="card-top">
              <span class="badge">${escapeHTML(evt.category)}</span>
              <span class="club-label">${escapeHTML(evt.club)}</span>
            </div>
            <h3 class="event-title">${escapeHTML(evt.title)}</h3>
            <p class="event-desc">${escapeHTML(evt.desc)}</p>
          </div>

          <div>
            <div class="event-meta">
              <span>${escapeHTML(evt.date)}</span>
              <span>${escapeHTML(evt.venue)}</span>
            </div>
            <button
              type="button"
              class="btn btn-rsvp ${isGoing ? "going" : ""}"
              data-rsvp-id="${escapeHTML(evt.id)}"
              style="margin-top: 0.85rem;"
            >
              ${isGoing ? "✓ RSVP Confirmed" : "RSVP"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRsvps() {
  rsvpCountBadge.textContent = String(rsvpIds.length);
  const goingEvents = events.filter((evt) => rsvpIds.includes(evt.id));

  if (goingEvents.length === 0) {
    rsvpList.innerHTML = '<li class="empty-note">No events RSVP\'d yet. Click "RSVP" on any card above.</li>';
    return;
  }

  rsvpList.innerHTML = goingEvents
    .map(
      (evt) => `
      <li class="rsvp-item">
        <div>
          <strong>${escapeHTML(evt.title)}</strong>
          <span>${escapeHTML(evt.date)} • ${escapeHTML(evt.venue)}</span>
        </div>
        <button type="button" class="btn btn-ghost" data-remove-rsvp="${escapeHTML(evt.id)}">Remove</button>
      </li>
    `
    )
    .join("");
}

function toggleRsvp(id) {
  if (rsvpIds.includes(id)) {
    rsvpIds = rsvpIds.filter((item) => item !== id);
  } else {
    rsvpIds = [...rsvpIds, id];
  }
  saveData();
  renderEvents();
  renderRsvps();
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeCategory = tab.dataset.category;
    renderEvents();
  });
});

searchInput.addEventListener("input", (event) => {
  searchQuery = event.target.value;
  renderEvents();
});

eventsGrid.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-rsvp-id]");
  if (!btn) return;
  toggleRsvp(btn.dataset.rsvpId);
});

rsvpList.addEventListener("click", (event) => {
  const removeBtn = event.target.closest("[data-remove-rsvp]");
  if (!removeBtn) return;
  toggleRsvp(removeBtn.dataset.removeRsvp);
});

clearRsvpsBtn.addEventListener("click", () => {
  rsvpIds = [];
  saveData();
  renderEvents();
  renderRsvps();
});

addEventForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = document.getElementById("eventTitle").value.trim();
  const club = document.getElementById("eventClub").value.trim();
  const category = document.getElementById("eventCategory").value;
  const date = document.getElementById("eventDate").value.trim();
  const venue = document.getElementById("eventVenue").value.trim();
  const desc = document.getElementById("eventDesc").value.trim();

  if (!title || !club || !date || !venue || !desc) return;

  const created = {
    id: `evt-${Date.now()}`,
    title,
    club,
    category,
    date,
    venue,
    desc
  };

  events = [created, ...events];
  saveData();
  addEventForm.reset();
  renderEvents();
  renderRsvps();
  document.getElementById("eventsSection").scrollIntoView({ behavior: "smooth" });
});

renderEvents();
renderRsvps();