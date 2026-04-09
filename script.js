/***********************
 * DOM ELEMENTS
 ***********************/
const eventList = document.getElementById("eventList");
const addBtn = document.getElementById("addBtn");

/***********************
 * STORAGE HELPERS
 ***********************/
function getEvents() {
  return JSON.parse(localStorage.getItem("familyEvents")) || [];
}

function saveEvents(events) {
  localStorage.setItem("familyEvents", JSON.stringify(events));
}

/***********************
 * RENDER EVENTS
 ***********************/
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

/***********************
 * ADD EVENT
 ***********************/
if (addBtn) {
  addBtn.addEventListener("click", () => {
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
  });
}

/***********************
 * EXPORT JSON
 ***********************/
function exportEvents() {
  const events = localStorage.getItem("familyEvents");

  if (!events) {
    alert("No events to export");
    return;
  }

  const blob = new Blob([events], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "family-calendar-events.json";
  a.click();

  URL.revokeObjectURL(url);
}

/***********************
 * IMPORT JSON
 ***********************/
function importEvents() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first");
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const importedEvents = JSON.parse(e.target.result);

      if (!Array.isArray(importedEvents)) {
        throw new Error("Invalid format");
      }

      saveEvents(importedEvents);
      renderEvents();
      alert("Events imported successfully ✅");
      fileInput.value = "";
    } catch {
      alert("Invalid file. Please upload a valid calendar export.");
    }
  };

  reader.readAsText(file);
}

/***********************
 * IMPORT OUTLOOK (.ICS)
 ***********************/
function importICS() {
  const fileInput = document.getElementById("icsFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an Outlook .ics file");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const buffer = reader.result;
      let text;

      try {
        // Outlook default
        text = new TextDecoder("utf-16le").decode(buffer);
      } catch {
        text = new TextDecoder("utf-8").decode(buffer);
      }

      const imported = parseICS(text);

      if (!imported.length) {
        alert("No events found in the Outlook calendar file.");
        return;
      }

      const existing = getEvents();
      saveEvents(existing.concat(imported));
      renderEvents();

      alert(`Imported ${imported.length} Outlook events ✅`);
      fileInput.value = "";
    } catch (err) {
      console.error(err);
      alert("Could not read Outlook calendar file");
    }
  };

  reader.readAsArrayBuffer(file);
}

/***********************
 * ICS PARSER
 ***********************/
function parseICS(text) {
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const events = [];
  let current = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {};
    }

    if (current && line.startsWith("SUMMARY")) {
      current.title = line.split(":").slice(1).join(":").trim();
    }

    if (current && line.startsWith("DESCRIPTION")) {
      current.notes = line.split(":").slice(1).join(":").trim();
    }

    if (current && line.startsWith("DTSTART")) {
      current.date = extractICSDate(line);
    }

    if (line === "END:VEVENT" && current) {
      if (current.title && current.date) {
        events.push({
          title: current.title,
          date: current.date,
          person: "Outlook",
          notes: current.notes || ""
        });
      }
      current = null;
    }
  }

  return events;
}

function extractICSDate(line) {
  const match = line.match(/:(\d{8})/);
  if (!match) return "";

  const y = match[1].slice(0, 4);
  const m = match[1].slice(4, 6);
  const d = match[1].slice(6, 8);

  return `${y}-${m}-${d}`;
}

/***********************
 * INITIAL LOAD
 ***********************/
renderEvents();
