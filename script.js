const eventList = document.getElementById("eventList");

// Sample data (auto-loads first time)
const sampleEvents = [
  {
    title: "Emma’s Soccer Practice",
    date: "2026-04-10",
    person: "Emma",
    notes: "Bring soccer gear"
  },
  {
    title: "Dad’s Birthday 🎂",
    date: "2026-04-15",
    person: "Dad",
    notes: "Buy cake"
  },
  {
    title: "Family Trip ✈️",
    date: "2026-04-20",
    person: "Everyone",
    notes: "Flight at 9am"
  }
];

function getEvents() {
  return JSON.parse(localStorage.getItem("familyEvents")) || [];
}

function saveEvents(events) {
  localStorage.setItem("familyEvents", JSON.stringify(events));
}

function loadSampleData() {
  const events = getEvents();
  if (events.length === 0) {
    saveEvents(sampleEvents);
  }
}

function addEvent() {
  const title = document.getElementById("title").value;
  const date = document.getElementById("date").value;
  const person = document.getElementById("person").value;
  const notes = document.getElementById("notes").value;

  if (!title || !date) {
    alert("Title and date are required");
    return;
  }

  const events = getEvents();
  events.push({ title, date, person, notes });
  saveEvents(events);

  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
  renderEvents();
}

function renderEvents() {
  const events = getEvents();
  eventList.innerHTML = "";

  events
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach(event => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${event.title}</strong><br>
        📅 ${event.date} — ${event.person || ""}<br>
        <small>${event.notes || ""}</small>
      `;
      eventList.appendChild(li);
    });
}

loadSampleData();
renderEvents();
