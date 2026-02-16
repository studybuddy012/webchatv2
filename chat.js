// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
// import {
//   getFirestore,
//   collection,
//   addDoc,
//   query,
//   orderBy,
//   onSnapshot,
//   doc,
//   setDoc,
//   updateDoc,
//   getDoc,
//   where
// } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// /* ================= FIREBASE ================= */
// const firebaseConfig = {
//   apiKey: "AIzaSyDtmTgb_1K7bm5bf8NyLvx68Eh_CGM_jKE",
//   authDomain: "webchat-1bfe4.firebaseapp.com",
//   projectId: "webchat-1bfe4",
//   storageBucket: "webchat-1bfe4.firebasestorage.app",
//   messagingSenderId: "262087743590",
//   appId: "1:262087743590:web:53934198aca60e81acf5a7"
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// /* ================= USER ================= */
// let username = localStorage.getItem("username");
// if (!username) location.href = "index.html";

// const otherKey = username === "pratham" ? "Adhya" : "pratham";
// const otherUser = otherKey;

// document.getElementById("chat-name").textContent = otherUser;

// window.logout = () => {
//   localStorage.removeItem("username");
//   location.href = "index.html";
// };

// /* ================= REFS ================= */
// const messagesRef = collection(db, "messages");
// const typingRef = doc(db, "typing", "status");

// /* ================= REPLY ================= */
// let replyData = null;

// window.clearReply = () => {
//   replyData = null;
//   document.getElementById("reply-box").classList.add("hidden");
// };

// window.startReply = (sender, text) => {
//   replyData = { sender, text };
//   document.getElementById("reply-text").textContent = `${sender}: ${text}`;
//   document.getElementById("reply-box").classList.remove("hidden");
// };
// import { getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// window.exportChat = async () => {
//   const snap = await getDocs(query(messagesRef, orderBy("time")));

//   let text = "PRIVATE CHAT EXPORT\n";
//   text += "=====================\n\n";

//   snap.forEach(doc => {
//     const m = doc.data();

//     const date = new Date(m.time).toLocaleString();
//     text += `[${date}] ${m.sender}: ${m.text}\n`;
//   });

//   const blob = new Blob([text], { type: "text/plain" });
//   const a = document.createElement("a");

//   a.href = URL.createObjectURL(blob);
//   a.download = "chat_backup.txt";
//   a.click();

//   URL.revokeObjectURL(a.href);
// };
// /* ================= SEND MESSAGE ================= */
// window.sendMessage = async () => {
//   const input = document.getElementById("msg");
//   const text = input.value.trim();
//   if (!text) return;

//   await addDoc(messagesRef, {
//     sender: username,
//     text,
//     time: Date.now(),
//     seen: false,
//     reactions: {},
//     replyTo: replyData
//   });

//   await setDoc(typingRef, { [username]: false }, { merge: true });
//   clearReply();
//   input.value = "";
// };

// document.getElementById("msg").addEventListener("keydown", e => {
//   if (e.key === "Enter") sendMessage();
// });

// /* ================= TYPING ================= */
// let typingTimeout;

// document.getElementById("msg").addEventListener("input", () => {
//   setDoc(typingRef, { [username]: true }, { merge: true });

//   clearTimeout(typingTimeout);
//   typingTimeout = setTimeout(() => {
//     setDoc(typingRef, { [username]: false }, { merge: true });
//   }, 800);
// });

// onSnapshot(typingRef, snap => {
//   if (!snap.exists()) return;
//   document.getElementById("typing").textContent =
//     snap.data()[otherKey] ? "typing…" : "";
// });

// /* ================= PRESENCE ================= */
// const presenceRef = doc(db, "presence", username);

// setDoc(presenceRef, { online: true, lastSeen: Date.now() }, { merge: true });

// document.addEventListener("visibilitychange", () => {
//   setDoc(presenceRef, {
//     online: document.visibilityState === "visible",
//     lastSeen: Date.now()
//   }, { merge: true });
// });

// const otherPresenceRef = doc(db, "presence", otherKey);

// onSnapshot(otherPresenceRef, snap => {
//   if (!snap.exists()) return;
//   const data = snap.data();
//   const el = document.getElementById("user-status");

//   if (data.online) {
//     el.textContent = "Online";
//     el.className = "status-text status-online";
//   } else {
//     const t = new Date(data.lastSeen).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit"
//     });
//     el.textContent = `Last seen ${t}`;
//     el.className = "status-text";
//   }
// });

// /* ================= REACTIONS ================= */
// window.toggleReaction = async (msgId, emoji) => {
//   const msgRef = doc(db, "messages", msgId);
//   const snap = await getDoc(msgRef);
//   if (!snap.exists()) return;

//   const data = snap.data();
//   const reactions = data.reactions || {};
//   const users = reactions[emoji] || [];

//   if (users.includes(username)) {
//     reactions[emoji] = users.filter(u => u !== username);
//     if (reactions[emoji].length === 0) delete reactions[emoji];
//   } else {
//     reactions[emoji] = [...users, username];
//   }

//   await updateDoc(msgRef, { reactions });
// };

// /* ================= SMART AUTO-SCROLL ================= */
// function isAtBottom(el) {
//   return el.scrollHeight - el.scrollTop - el.clientHeight < 60;
// }

// /* ================= MESSAGES (LAST 2 DAYS ONLY) ================= */

// const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);

// const q = query(
//   messagesRef,
//   where("time", ">", twoDaysAgo),  // 🔥 FILTER
//   orderBy("time")
// );

// onSnapshot(q, snap => {
//   const box = document.getElementById("messages");
//   const shouldScroll = isAtBottom(box);
//   box.innerHTML = "";

//   const docs = snap.docs;
//   let unseenRefs = [];
//   let lastMyMsgIndex = -1;

//   docs.forEach((d, i) => {
//     if (d.data().sender === username) lastMyMsgIndex = i;
//   });

//   docs.forEach((d, i) => {
//     const m = d.data();
//     const isMe = m.sender === username;

//     if (!isMe && !m.seen) unseenRefs.push(d.ref);

//     const time = new Date(m.time).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit"
//     });

//     const replyHTML = m.replyTo
//       ? `<div class="reply-preview"><b>${m.replyTo.sender}</b>: ${m.replyTo.text}</div>`
//       : "";

//     const reactions = m.reactions || {};
//     let reactionsHTML = "";
//     Object.keys(reactions).forEach(emoji => {
//       reactionsHTML += `
//         <span class="reaction"
//           onclick="toggleReaction('${d.id}','${emoji}')">
//           ${emoji} ${reactions[emoji].length}
//         </span>`;
//     });

//     box.innerHTML += `
//       <div class="msg-row ${isMe ? "me-row" : "other-row"}">
//         <div class="bubble ${isMe ? "me" : "other"}">${replyHTML}${m.text}</div>
//         <div class="time-text">${time}</div>
//         ${
//           isMe && i === lastMyMsgIndex && m.seen
//             ? `<div class="seen-text">Seen</div>`
//             : ``
//         }
//         ${reactionsHTML ? `<div class="reactions">${reactionsHTML}</div>` : ``}
//       </div>
//     `;
//   });

//   unseenRefs.forEach(ref => updateDoc(ref, { seen: true }));

//   if (shouldScroll) {
//     box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
//   }
// });

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
  where   // ✅ added for filtering
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

if (!username)
  location.href = "index.html";


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


/* ✅ PERFORMANCE FILTER (ONLY LAST 2 DAYS) */

const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);


const q = query(

  messagesRef,

  where("time", ">=", twoDaysAgo), // ✅ filter

  orderBy("time")

);


/* ================= REPLY ================= */

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


  await setDoc(

    typingRef,
    { [username]: false },
    { merge: true }

  );


  clearReply();

  input.value = "";

};


document.getElementById("msg")
.addEventListener("keydown", e => {

  if (e.key === "Enter")
    sendMessage();

});


/* ================= TYPING ================= */

let typingTimeout;


document.getElementById("msg")
.addEventListener("input", () => {

  setDoc(
    typingRef,
    { [username]: true },
    { merge: true }
  );

  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {

    setDoc(
      typingRef,
      { [username]: false },
      { merge: true }
    );

  }, 800);

});


onSnapshot(typingRef, snap => {

  if (!snap.exists()) return;

  document.getElementById("typing").textContent =

    snap.data()[otherKey]
      ? "typing…"
      : "";

});


/* ================= ONLINE / LAST SEEN ================= */

const presenceRef = doc(db, "presence", username);


setDoc(

  presenceRef,

  {
    online: true,
    lastSeen: Date.now()
  },

  { merge: true }

);


document.addEventListener(
"visibilitychange", () => {

  if (document.visibilityState === "hidden") {

    setDoc(
      presenceRef,
      {
        online: false,
        lastSeen: Date.now()
      },
      { merge: true }
    );

  }
  else {

    setDoc(
      presenceRef,
      {
        online: true,
        lastSeen: Date.now()
      },
      { merge: true }
    );

  }

});


const otherPresenceRef =
doc(db, "presence", otherKey);


onSnapshot(otherPresenceRef, snap => {

  if (!snap.exists()) return;


  const data = snap.data();

  const el =
  document.getElementById("user-status");


  if (data.online) {

    el.textContent = "Online";

    el.className =
      "status-text status-online";

  }
  else {

    const t =
    new Date(data.lastSeen)
    .toLocaleTimeString([], {

      hour: "2-digit",
      minute: "2-digit"

    });

    el.textContent =
      `Last seen ${t}`;

    el.className =
      "status-text";

  }

});


/* ================= REACTIONS ================= */

window.toggleReaction =
async (msgId, emoji) => {

  const msgRef =
  doc(db, "messages", msgId);

  const snap =
  await getDoc(msgRef);

  if (!snap.exists()) return;


  const data = snap.data();

  const reactions =
  data.reactions || {};

  const users =
  reactions[emoji] || [];


  if (users.includes(username)) {

    reactions[emoji] =
    users.filter(
      u => u !== username
    );

    if (reactions[emoji].length === 0)
      delete reactions[emoji];

  }
  else {

    reactions[emoji] =
    [...users, username];

  }


  await updateDoc(
    msgRef,
    { reactions }
  );

};


/* ================= REACTION PICKER ================= */

window.openReactionPicker = (msgId) => {

  document
  .querySelectorAll(".reaction-picker")
  .forEach(p => p.remove());


  const picker =
  document.createElement("div");

  picker.className =
  "reaction-picker";


  const emojis =
  ["❤️","😂","😮","😢","👍"];


  emojis.forEach(emoji => {

    const span =
    document.createElement("span");

    span.textContent = emoji;

    span.onclick = () => {

      toggleReaction(msgId, emoji);

      picker.remove();

    };

    picker.appendChild(span);

  });


  document.body.appendChild(picker);


  setTimeout(
    () => picker.remove(),
    3000
  );

};


/* ================= MENU ================= */

function closeMsgMenus() {

  document
  .querySelectorAll(".msg-menu")
  .forEach(m => m.remove());

}


window.copyMessage = text => {

  navigator.clipboard.writeText(text);

  closeMsgMenus();

};


window.openMsgMenu =
(event, sender, text) => {

  event.stopPropagation();

  closeMsgMenus();


  const menu =
  document.createElement("div");

  menu.className = "msg-menu";


  menu.innerHTML = `

    <div onclick="startReply('${sender}','${text.replace(/'/g,"\\'")}')">
      Reply
    </div>

    <div onclick="copyMessage('${text.replace(/'/g,"\\'")}')">
      Copy
    </div>

  `;


  document.body.appendChild(menu);


  const rect =
  event.target.getBoundingClientRect();


  menu.style.top =
  rect.bottom +
  window.scrollY + "px";


  menu.style.left =
  rect.left +
  window.scrollX - 60 + "px";

};


document.addEventListener(
"click",
closeMsgMenus
);


/* ================= SWIPE REPLY ================= */

let touchStartX = 0;


window.handleTouchStart = e => {

  touchStartX =
  e.touches[0].clientX;

};


window.handleTouchEnd =
(e, sender, text) => {

  const dx =
  e.changedTouches[0].clientX -
  touchStartX;

  if (dx > 80)
    startReply(sender, text);

};


/* ================= SCROLL ================= */

function isAtBottom(el) {

  return el.scrollHeight
       - el.scrollTop
       - el.clientHeight < 60;

}


/* ================= LOAD MESSAGES ================= */

onSnapshot(q, snap => {

  const box =
  document.getElementById("messages");


  const shouldScroll =
  isAtBottom(box);


  box.innerHTML = "";


  const docs = snap.docs;


  let unseenRefs = [];

  let lastMyMsgIndex = -1;


  docs.forEach((d, i) => {

    if (d.data().sender === username)
      lastMyMsgIndex = i;

  });


  docs.forEach((d, i) => {

    const m = d.data();

    const isMe =
    m.sender === username;


    if (!isMe && !m.seen)
      unseenRefs.push(d.ref);


    const time =
    new Date(m.time)
    .toLocaleTimeString([], {

      hour: "2-digit",
      minute: "2-digit"

    });


    const replyHTML =
    m.replyTo
    ? `<div class="reply-preview">
        <b>${m.replyTo.sender}</b>:
        ${m.replyTo.text}
      </div>`
    : "";


    const reactions =
    m.reactions || {};


    let reactionsHTML = "";


    Object.keys(reactions)
    .forEach(emoji => {

      reactionsHTML += `
        <span class="reaction"
        onclick="toggleReaction('${d.id}','${emoji}')">

        ${emoji}
        ${reactions[emoji].length}

        </span>
      `;

    });


    box.innerHTML += `

      <div class="msg-row ${isMe ? "me-row" : "other-row"}">

        <div class="msg-top">

          <span class="msg-dots"
          onclick="openMsgMenu(event,'${m.sender}','${m.text.replace(/'/g,"\\'")}')">

          ⋮

          </span>

        </div>

        <div class="bubble ${isMe ? "me" : "other"}"

        onclick="openReactionPicker('${d.id}')"

        ontouchstart="handleTouchStart(event)"

        ontouchend="handleTouchEnd(event,'${m.sender}','${m.text.replace(/'/g,"\\'")}')">

          ${replyHTML}

          ${m.text}

        </div>

        <div class="time-text">

          ${time}

        </div>

        ${
          isMe &&
          i === lastMyMsgIndex &&
          m.seen

          ? `<div class="seen-text">Seen</div>`
          : ""
        }

        ${
          reactionsHTML
          ? `<div class="reactions">${reactionsHTML}</div>`
          : ""
        }

      </div>

    `;

  });


  unseenRefs.forEach(ref =>
    updateDoc(ref, { seen: true })
  );


  if (shouldScroll) {

    box.scrollTo({

      top: box.scrollHeight,

      behavior: "smooth"

    });

  }

});


/* ================= EMOJI PICKER ================= */

const emojiBtn =
document.getElementById("emoji-btn");

const emojiPicker =
document.getElementById("emoji-picker");

const msgInput =
document.getElementById("msg");


emojiBtn.addEventListener(
"click", e => {

  e.stopPropagation();

  emojiPicker
  .classList.toggle("hidden");

});


emojiPicker
.querySelectorAll("span")
.forEach(span => {

  span.addEventListener(
  "click", () => {

    msgInput.value +=
    span.textContent;

    emojiPicker
    .classList.add("hidden");

    msgInput.focus();

  });

});


document.addEventListener(
"click",
() => emojiPicker.classList.add("hidden")
);

