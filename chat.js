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
  updateDoc,
  getDoc,
  where
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
let username = localStorage.getItem("username");
if (!username) location.href = "index.html";

const otherKey = username === "pratham" ? "Adhya" : "pratham";
const otherUser = otherKey;

document.getElementById("chat-name").textContent = otherUser;

window.logout = () => {
  localStorage.removeItem("username");
  location.href = "index.html";
};

/* ================= REFS ================= */
const messagesRef = collection(db, "messages");
const typingRef = doc(db, "typing", "status");

/* ================= REPLY ================= */
let replyData = null;

window.clearReply = () => {
  replyData = null;
  document.getElementById("reply-box").classList.add("hidden");
};

window.startReply = (sender, text) => {
  replyData = { sender, text };
  document.getElementById("reply-text").textContent = `${sender}: ${text}`;
  document.getElementById("reply-box").classList.remove("hidden");
};

/* ================= SEND MESSAGE ================= */
window.sendMessage = async () => {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  if (!text) return;

  await addDoc(messagesRef, {
    sender: username,
    text,
    time: Date.now(),
    seen: false,
    reactions: {},
    replyTo: replyData
  });

  await setDoc(typingRef, { [username]: false }, { merge: true });
  clearReply();
  input.value = "";
};

document.getElementById("msg").addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});

/* ================= TYPING ================= */
let typingTimeout;

document.getElementById("msg").addEventListener("input", () => {
  setDoc(typingRef, { [username]: true }, { merge: true });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    setDoc(typingRef, { [username]: false }, { merge: true });
  }, 800);
});

onSnapshot(typingRef, snap => {
  if (!snap.exists()) return;
  document.getElementById("typing").textContent =
    snap.data()[otherKey] ? "typing…" : "";
});

/* ================= PRESENCE ================= */
const presenceRef = doc(db, "presence", username);

setDoc(presenceRef, { online: true, lastSeen: Date.now() }, { merge: true });

document.addEventListener("visibilitychange", () => {
  setDoc(presenceRef, {
    online: document.visibilityState === "visible",
    lastSeen: Date.now()
  }, { merge: true });
});

const otherPresenceRef = doc(db, "presence", otherKey);

onSnapshot(otherPresenceRef, snap => {
  if (!snap.exists()) return;
  const data = snap.data();
  const el = document.getElementById("user-status");

  if (data.online) {
    el.textContent = "Online";
    el.className = "status-text status-online";
  } else {
    const t = new Date(data.lastSeen).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    el.textContent = `Last seen ${t}`;
    el.className = "status-text";
  }
});

/* ================= REACTIONS ================= */
window.toggleReaction = async (msgId, emoji) => {
  const msgRef = doc(db, "messages", msgId);
  const snap = await getDoc(msgRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const reactions = data.reactions || {};
  const users = reactions[emoji] || [];

  if (users.includes(username)) {
    reactions[emoji] = users.filter(u => u !== username);
    if (reactions[emoji].length === 0) delete reactions[emoji];
  } else {
    reactions[emoji] = [...users, username];
  }

  await updateDoc(msgRef, { reactions });
};

/* ================= SMART AUTO-SCROLL ================= */
function isAtBottom(el) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
}

/* ================= MESSAGES (LAST 2 DAYS ONLY) ================= */

const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);

const q = query(
  messagesRef,
  where("time", ">", twoDaysAgo),  // 🔥 FILTER
  orderBy("time")
);

onSnapshot(q, snap => {
  const box = document.getElementById("messages");
  const shouldScroll = isAtBottom(box);
  box.innerHTML = "";

  const docs = snap.docs;
  let unseenRefs = [];
  let lastMyMsgIndex = -1;

  docs.forEach((d, i) => {
    if (d.data().sender === username) lastMyMsgIndex = i;
  });

  docs.forEach((d, i) => {
    const m = d.data();
    const isMe = m.sender === username;

    if (!isMe && !m.seen) unseenRefs.push(d.ref);

    const time = new Date(m.time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });

    const replyHTML = m.replyTo
      ? `<div class="reply-preview"><b>${m.replyTo.sender}</b>: ${m.replyTo.text}</div>`
      : "";

    const reactions = m.reactions || {};
    let reactionsHTML = "";
    Object.keys(reactions).forEach(emoji => {
      reactionsHTML += `
        <span class="reaction"
          onclick="toggleReaction('${d.id}','${emoji}')">
          ${emoji} ${reactions[emoji].length}
        </span>`;
    });

    box.innerHTML += `
      <div class="msg-row ${isMe ? "me-row" : "other-row"}">
        <div class="bubble ${isMe ? "me" : "other"}">${replyHTML}${m.text}</div>
        <div class="time-text">${time}</div>
        ${
          isMe && i === lastMyMsgIndex && m.seen
            ? `<div class="seen-text">Seen</div>`
            : ``
        }
        ${reactionsHTML ? `<div class="reactions">${reactionsHTML}</div>` : ``}
      </div>
    `;
  });

  unseenRefs.forEach(ref => updateDoc(ref, { seen: true }));

  if (shouldScroll) {
    box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }
});
