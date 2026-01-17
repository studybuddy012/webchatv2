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
  getDoc
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

const otherUser = username === "pratham" ? "Adhya" : "Pratham";
document.getElementById("chat-name").textContent = otherUser;

/* logout */
window.logout = () => {
  localStorage.removeItem("username");
  location.href = "index.html";
};

/* ================= REFS ================= */
const messagesRef = collection(db, "messages");
const typingRef = doc(db, "typing", "status");

/* ================= REPLY STATE ================= */
let replyData = null;

window.clearReply = () => {
  replyData = null;
  document.getElementById("reply-box").classList.add("hidden");
};

window.startReply = (sender, text) => {
  replyData = { sender, text };
  document.getElementById("reply-text").textContent =
    `${sender}: ${text}`;
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
  const otherKey = username === "pratham" ? "Adhya" : "pratham";
  document.getElementById("typing").textContent =
    snap.data()[otherKey] ? "typing…" : "";
});

/* ================= ONLINE / LAST SEEN ================= */
const presenceRef = doc(db, "presence", username);

await setDoc(presenceRef, {
  online: true,
  lastSeen: Date.now()
}, { merge: true });

window.addEventListener("beforeunload", () => {
  setDoc(presenceRef, {
    online: false,
    lastSeen: Date.now()
  }, { merge: true });
});

const otherKey = username === "pratham" ? "Adhya" : "pratham";
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

window.openReactionPicker = (msgId) => {
  document.querySelectorAll(".reaction-picker").forEach(p => p.remove());

  const picker = document.createElement("div");
  picker.className = "reaction-picker";
  picker.innerHTML = `
    <span>❤️</span>
    <span>😂</span>
    <span>😮</span>
    <span>😢</span>
    <span>👍</span>
  `;

  picker.querySelectorAll("span").forEach(e => {
    e.onclick = () => {
      toggleReaction(msgId, e.textContent);
      picker.remove();
    };
  });

  document.body.appendChild(picker);
  setTimeout(() => picker.remove(), 3000);
};

/* ================= THREE DOTS MENU ================= */
function closeMsgMenus() {
  document.querySelectorAll(".msg-menu").forEach(m => m.remove());
}

window.copyMessage = (text) => {
  navigator.clipboard.writeText(text);
  closeMsgMenus();
};

window.openMsgMenu = (event, sender, text) => {
  event.stopPropagation();
  closeMsgMenus();

  const menu = document.createElement("div");
  menu.className = "msg-menu";
  menu.innerHTML = `
    <div onclick="startReply('${sender}','${text.replace(/'/g,"\\'")}')">Reply</div>
    <div onclick="copyMessage('${text.replace(/'/g,"\\'")}')">Copy</div>
  `;

  document.body.appendChild(menu);

  const rect = event.target.getBoundingClientRect();
  menu.style.top = rect.bottom + window.scrollY + "px";
  menu.style.left = rect.left + window.scrollX - 60 + "px";
};

document.addEventListener("click", closeMsgMenus);

/* ================= MOBILE SWIPE TO REPLY ================= */
let touchStartX = 0;

window.handleTouchStart = e => {
  touchStartX = e.touches[0].clientX;
};

window.handleTouchEnd = (e, sender, text) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx > 80) startReply(sender, text);
};

/* ================= SMART AUTO-SCROLL ================= */
function isAtBottom(el) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
}

/* ================= MESSAGES + SEEN ================= */
const q = query(messagesRef, orderBy("time"));

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
          onclick="toggleReaction('${d.id}', '${emoji}')">
          ${emoji} ${reactions[emoji].length}
        </span>`;
    });

    box.innerHTML += `
      <div class="msg-row ${isMe ? "me-row" : "other-row"}">
        <div class="msg-top">
          <span class="msg-dots"
            onclick="openMsgMenu(event,'${m.sender}','${m.text.replace(/'/g,"\\'")}')">⋮</span>
        </div>

        <div class="bubble ${isMe ? "me" : "other"}"
          onclick="openReactionPicker('${d.id}')"
          ontouchstart="handleTouchStart(event)"
          ontouchend="handleTouchEnd(event,'${m.sender}','${m.text.replace(/'/g,"\\'")}')">
          ${replyHTML}
          ${m.text}
        </div>

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

