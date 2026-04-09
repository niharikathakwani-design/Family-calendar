const eventList = document.getElementById("eventList");
const addBtn = document.getElementById("addBtn");

function getEvents() {
  return JSON.parse(localStorage.getItem("familyEvents")) || [];
}

function saveEvents(events) {
  localStorage.setItem("familyEvents", JSON.stringify(events));
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
  // 📤 Export events to JSON file
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

// 📥 Import events from JSON file
function importEvents() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file first");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedEvents = JSON.parse(e.target.result);

      if (!Array.isArray(importedEvents)) {
        throw new Error("Invalid file format");
      }

      localStorage.setItem("familyEvents", JSON.stringify(importedEvents));
      renderEvents();

      alert("Events imported successfully ✅");
      fileInput.value = "";
    } catch (err) {
      alert("Invalid file. Please upload a valid calendar export.");
    }
  };

  reader.readAsText(file);
}
});

// ✅ Initial load
renderEvents();
function importICS() {
  const fileInput = document.getElementById("icsFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an Outlook .ics file");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const text = e.target.result;
      const events = parseICS(text);

      if (events.length === 0) {
        alert("No events found in the file");
        return;
      }

      const existing = JSON.parse(localStorage.getItem("familyEvents")) || [];
      const merged = existing.concat(events);

      localStorage.setItem("familyEvents", JSON.stringify(merged));
      renderEvents();

      alert(`Imported ${events.length} events from Outlook ✅`);
      fileInput.value = "";
    } catch (err) {
      alert("Could not read Outlook calendar file");
      console.error(err);
    }
  };

  reader.readAsText(file);
}

function parseICS(text) {
  const lines = text.split(/\r?\n/);
  const events = [];
  let current = null;

  for (let line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
    }

    if (line.startsWith("SUMMARY:")) {
      current.title = line.replace("SUMMARY:", "").trim();
    }

    if (line.startsWith("DTSTART")) {
      current.date = parseICSDate(line);
    }

    if (line.startsWith("DESCRIPTION:")) {
      current.notes = line.replace("DESCRIPTION:", "").trim();
    }

    if (line.startsWith("END:VEVENT") && current) {
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

function parseICSDate(line) {
  const match = line.match(/:(\d{8})/);
  if (!match) return "";

  const y = match[1].slice(0, 4);
  const m = match[1].slice(4, 6);
  const d = match[1].slice(6, 8);

  return `${y}-${m}-${d}`;
}
