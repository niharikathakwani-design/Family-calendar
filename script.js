/*************************
 * STATE
 *************************/
let editingIndex = null;

/*************************
 * DOM
 *************************/
const eventList = document.getElementById("eventList");

/*************************
 * STORAGE
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
 * RENDER
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
  if (!data) return alert("No events to export");

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
  if (!file) return alert("Select a file");

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error();
      saveEvents(imported);
      renderEvents();
      alert("Events imported ✅");
    } catch {
      alert("Invalid JSON file");
    }
  };
  reader.readAsText(file);
}

/*************************
 * IMPORT OUTLOOK (.ICS)
 *************************/
function importICS() {
  const fileInput = document.getElementById("icsFile");
  const file = fileInput.files[0];
  if (!file) return alert("Select an .ics file");

  const reader = new FileReader();
  reader.onload = () => {
    let text;
    try {
      text = new TextDecoder("utf-16le").decode(reader.result);
    } catch {
      text = new TextDecoder("utf-8").decode(reader.result);
    }

    const imported = parseICS(text);
    if (!imported.length) return alert("No events found");

    saveEvents(getEvents().concat(imported));
    renderEvents();
    alert(`Imported ${imported.length} Outlook events ✅`);
  };

  reader.readAsArrayBuffer(file);
}

/*************************
 * ICS PARSER
 *************************/
function parseICS(text) {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") current = {};
    if (current && line.startsWith("SUMMARY"))
      current.title = line.split(":").slice(1).join(":").trim();
    if (current && line.startsWith("DESCRIPTION"))
      current.notes = line.split(":").slice(1).join(":").trim();
    if (current && line.startsWith("DTSTART"))
      current.date = extractICSDate(line);
    if (line === "END:VEVENT" && current && current.title && current.date) {
      events.push({ ...current, person: "Outlook" });
      current = null;
    }
  }
  return events;
}

function extractICSDate(line) {
  const m = line.match(/:(\d{8})/);
  if (!m) return "";
  return `${m[1].slice(0,4)}-${m[1].slice(4,6)}-${m[1].slice(6,8)}`;
}

/*************************
 * INIT
 *************************/
renderEvents();
