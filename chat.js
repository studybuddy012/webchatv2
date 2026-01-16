import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ================= FIREBASE ================= */
const firebaseConfig = {
  apiKey: "AIzaSyDtmTgb_1K7bm5bf8NyLvx68Eh_CGM_jKE",
  authDomain: "webchat-1bfe4.firebaseapp.com",
  projectId: "webchat-1bfe4",
  storageBucket: "webchat-1bfe4.firebasestorage.app",
  messagingSenderId: "262087743590",
  appId: "1:262087743590:web:53934198aca60e81acf5a7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= USER ================= */
const username = localStorage.getItem("username");
if (!username) location.href = "index.html";

/* jis se baat ho rahi hai (IG style) */
const otherUser =
  username === "pratham" ? "Adhya" : "Pratham";

/* header name set */
const chatNameEl = document.getElementById("chat-name");
if (chatNameEl) chatNameEl.textContent = otherUser;

/* logout */
window.logout = () => {
  localStorage.removeItem("username");
  location.href = "index.html";
};

/* ================= REFS ================= */
const messagesRef = collection(db, "messages");
const typingRef = doc(db, "typing", "status");

/* ================= SEND MESSAGE ================= */
window.sendMessage = async () => {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  if (!text) return;

  await addDoc(messagesRef, {
    sender: username,
    text,
    time: Date.now(),
    seen: false
  });

  // typing off after send
  await setDoc(typingRef, { [username]: false }, { merge: true });

  input.value = "";
};

/* Enter key send */
document.getElementById("msg").addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

/* ================= TYPING INDICATOR ================= */
let typingTimeout;

document.getElementById("msg").addEventListener("input", () => {
  setDoc(typingRef, { [username]: true }, { merge: true });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    setDoc(typingRef, { [username]: false }, { merge: true });
  }, 800);
});

/* listen typing */
onSnapshot(typingRef, snap => {
  if (!snap.exists()) return;

  const data = snap.data();
  const typingBox = document.getElementById("typing");

  const otherKey =
    username === "pratham" ? "adhya" : "pratham";

  typingBox.textContent = data[otherKey] ? "typing…" : "";
});

/* ================= MESSAGES + SEEN ================= */
const q = query(messagesRef, orderBy("time"));

onSnapshot(q, snap => {
  const box = document.getElementById("messages");
  box.innerHTML = ""; // 🔥 clear once (no duplicates)

  let unseenRefs = [];
  let lastMyMsgSeen = false;

  snap.docs.forEach(d => {
    const m = d.data();
    const isMe = m.sender === username;

    // mark unseen messages (receiver side)
    if (!isMe && !m.seen) unseenRefs.push(d.ref);

    if (isMe) lastMyMsgSeen = m.seen;

    const time = new Date(m.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    box.innerHTML += `
      <div class="msg-row ${isMe ? "me-row" : "other-row"}">
        <div class="bubble ${isMe ? "me" : "other"}">${m.text}</div>
        <div class="time-text">${time}</div>
      </div>
    `;
  });

  // update seen OUTSIDE render loop
  unseenRefs.forEach(ref => updateDoc(ref, { seen: true }));

  // IG style: Seen only for last message
  if (lastMyMsgSeen) {
    box.innerHTML += `<div class="seen-text">Seen</div>`;
  }

  box.scrollTop = box.scrollHeight;
});
