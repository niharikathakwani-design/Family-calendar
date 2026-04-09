const eventList = document.getElementById("eventList");

function getEvents() {
  return JSON.parse(localStorage.getItem("familyEvents")) || [];
}

function saveEvents(events) {
  localStorage.setItem("familyEvents", JSON.stringify(events));
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

renderEvents();
