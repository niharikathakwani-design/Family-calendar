// Firebase config
const firebaseConfig = {
  apiKey: "PASTE_YOURS",
  authDomain: "family-calendar-7299c.firebaseapp.com",
  projectId: "family-calendar-7299c",
  storageBucket: "family-calendar-7299c.appspot.com",
  messagingSenderId: "1063556817040",
  appId: "PASTE_YOURS"
};

// Init Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const eventList = document.getElementById("eventList");
const addBtn = document.getElementById("addBtn");

// Add event
addBtn.addEventListener("click", () => {
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
});

// Listen for events
db.collection("events")
  .orderBy("date")
  .onSnapshot(snapshot => {
    eventList.innerHTML = "";
    snapshot.forEach(doc => {
      const e = doc.data();
      const li = document.createElement("li");
      li.innerHTML = `<strong>${e.title}</strong><br>${e.date} — ${e.person || ""}`;
      eventList.appendChild(li);
    });
  });
