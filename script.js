// 🔥 Firebase configuration (PASTE YOUR REAL CONFIG HERE)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "family-calendar-7299c.firebaseapp.com",
  projectId: "family-calendar-7299c",
  storageBucket: "family-calendar-7299c.appspot.com",
  messagingSenderId: "1063556817040",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const eventList = document.getElementById("eventList");

// ➕ Add event
function addEvent() {
  const title = document.getElementById("title").value;
  const date = document.getElementById("date").value;
  const person = document.getElementById("person").value;
  const notes = document.getElementById("notes").value;

  if (!title || !date) {
    alert("Title and date are required");
    return;
  }

  db.collection("events").add({
    title,
    date,
    person,
    notes,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.querySelectorAll("input, textarea").forEach(el => el.value = "");
}

// 🔄 Real-time sync
db.collection("events")
  .orderBy("date")
  .onSnapshot(snapshot => {
    eventList.innerHTML = "";
    snapshot.forEach(doc => {
      const event = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${event.title}</strong><br>
        📅 ${event.date} — ${event.person || ""}<br>
        <small>${event.notes || ""}</small>
      `;
      eventList.appendChild(li);
    });
  });
