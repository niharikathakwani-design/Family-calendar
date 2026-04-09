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
