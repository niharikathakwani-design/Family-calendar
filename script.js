/*************************
 * STATE
 *************************/
let editingIndex = null;

/*************************
 * DOM ELEMENTS
 *************************/
const eventList = document.getElementById("eventList");

/*************************
 * STORAGE HELPERS
 *************************/
function getEvents() {
  return JSON.parse(localStorage.getItem("familyEvents")) || [];
}

function saveEvents(events) {
  localStorage.setItem("familyEvents", JSON.stringify(events));
}

/*************************
 * ADD / EDIT EVENT
 *************************/
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
  const newEvent = { title, date, person, notes };

  if (editingIndex !== null) {
    events[editingIndex] = newEvent;
    editingIndex = null;
  } else {
    events.push(newEvent);
  }

  saveEvents(events);
  clearForm();
  renderEvents();
}

/*************************
 * EDIT / DELETE
 *************************/
function editEvent(index) {
  const event = getEvents()[index];

  document.getElementById("title").value = event.title;
  document.getElementById("date").value = event.date;
  document.getElementById("person").value = event.person;
  document.getElementById("notes").value = event.notes;

  editingIndex = index;
}

function deleteEvent(index) {
  if (!confirm("Delete this event?")) return;

  const events = getEvents();
  events.splice(index, 1);
  saveEvents(events);
  renderEvents();
}

/*************************
 * RENDER EVENTS
 *************************/
function renderEvents() {
  const events = getEvents();
  eventList.innerHTML = "";

  events
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((event, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${event.title}</strong><br>
        📅 ${event.date} — ${event.person || ""}<br>
        <small>${event.notes || ""}</small><br><br>

        <button onclick="editEvent(${index})">✏️ Edit</button>
        <button onclick="deleteEvent(${index})">🗑 Delete</button>
      `;

      eventList.appendChild(li);
    });
}

function clearForm() {
  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
}

/*************************
 * EXPORT JSON
 *************************/
function exportEvents() {
  const data = localStorage.getItem("familyEvents");

  if (!data) {
    alert("No events to export");
    return;
  }

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "family-calendar-events.json";
  a.click();

  URL.revokeObjectURL(url);
}

/*************************
 * IMPORT JSON
 *************************/
function importEvents() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file");
