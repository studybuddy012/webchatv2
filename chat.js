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
//   where // ✅ REQUIRED
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

// if (!username)
//   location.href = "index.html";


// const otherKey =
// username === "pratham"
// ? "Adhya"
// : "pratham";


// document.getElementById("chat-name")
// .textContent = otherKey;


// window.logout = () => {

//   localStorage.removeItem("username");

//   location.href = "index.html";

// };


// /* ================= REFS ================= */

// const messagesRef =
// collection(db, "messages");

// const typingRef =
// doc(db, "typing", "status");

// /*==================export chat system==================*/ 
// window.exportChat = async () => {

//   const snap = await getDocs(q);

//   let text = "";

//   snap.forEach(doc => {

//     const m = doc.data();

//     const time = new Date(m.time)
//       .toLocaleString();

//     text += `[${time}] ${m.sender}: ${m.text}\n`;

//   });

//   const blob = new Blob([text], { type: "text/plain" });

//   const a = document.createElement("a");

//   a.href = URL.createObjectURL(blob);

//   a.download = "chat.txt";

//   a.click();

// };

// /* ================= ONLY LAST 2 DAYS ================= */

// const twoDaysAgo =
// Date.now()
// -
// (2 * 24 * 60 * 60 * 1000);


// const q =
// query(

//   messagesRef,

//   where("time", ">=", twoDaysAgo),

//   orderBy("time")

// );


// /* ================= SEND MESSAGE ================= */

// window.sendMessage =
// async () => {

//   const input =
//   document.getElementById("msg");

//   const text =
//   input.value.trim();

//   if (!text) return;


//   await addDoc(
//     messagesRef,
//     {

//       sender: username,
//       text,
//       time: Date.now(),
//       seen: false,
//       reactions: {},
//       replyTo: null

//     }
//   );


//   await setDoc(
//     typingRef,
//     { [username]: false },
//     { merge: true }
//   );


//   input.value = "";

// };


// document.getElementById("msg")
// .addEventListener(
// "keydown",
// e => {

//   if (e.key === "Enter")
//     sendMessage();

// });


// /* ================= TYPING ================= */

// let typingTimeout;


// document.getElementById("msg")
// .addEventListener(
// "input",
// () => {

//   setDoc(
//     typingRef,
//     { [username]: true },
//     { merge: true }
//   );


//   clearTimeout(
//     typingTimeout
//   );


//   typingTimeout =
//   setTimeout(
//   () => {

//     setDoc(
//       typingRef,
//       { [username]: false },
//       { merge: true }
//     );

//   },
//   800);

// });


// onSnapshot(
// typingRef,
// snap => {

//   if (!snap.exists())
//     return;


//   document.getElementById("typing")
//   .textContent =

//     snap.data()[otherKey]
//     ? "typing…"
//     : "";

// });


// /* ================= ONLINE / LAST SEEN ================= */

// const presenceRef =
// doc(db, "presence", username);


// setDoc(
// presenceRef,
// {
//   online: true,
//   lastSeen: Date.now()
// },
// { merge: true }
// );


// document.addEventListener(
// "visibilitychange",
// () => {

//   if (
//     document.visibilityState
//     === "hidden"
//   ) {

//     setDoc(
//       presenceRef,
//       {
//         online: false,
//         lastSeen: Date.now()
//       },
//       { merge: true }
//     );

//   }
//   else {

//     setDoc(
//       presenceRef,
//       {
//         online: true,
//         lastSeen: Date.now()
//       },
//       { merge: true }
//     );

//   }

// });


// const otherPresenceRef =
// doc(db, "presence", otherKey);


// onSnapshot(
// otherPresenceRef,
// snap => {

//   if (!snap.exists())
//     return;


//   const data =
//   snap.data();


//   const el =
//   document.getElementById(
//     "user-status"
//   );


//   if (data.online) {

//     el.textContent =
//     "Online";

//     el.className =
//     "status-text status-online";

//   }
//   else {

//     const t =
//     new Date(data.lastSeen)
//     .toLocaleTimeString([], {

//       hour: "2-digit",
//       minute: "2-digit"

//     });


//     el.textContent =
//     "Last seen " + t;

//     el.className =
//     "status-text";

//   }

// });


// /* ================= LOAD MESSAGES ================= */

// function isAtBottom(el) {

//   return el.scrollHeight
//   - el.scrollTop
//   - el.clientHeight < 60;

// }


// onSnapshot(
// q,
// snap => {

//   const box =
//   document.getElementById(
//     "messages"
//   );


//   const shouldScroll =
//   isAtBottom(box);


//   box.innerHTML = "";


//   let unseenRefs = [];

//   let lastMyMsgIndex = -1;


//   snap.docs.forEach(
//   (d,i) => {

//     if (
//       d.data().sender
//       === username
//     )
//       lastMyMsgIndex = i;

//   });


//   snap.docs.forEach(
//   (d,i) => {

//     const m = d.data();

//     const isMe =
//     m.sender === username;


//     if (!isMe && !m.seen)
//       unseenRefs.push(d.ref);


//     const time =
//     new Date(m.time)
//     .toLocaleTimeString([], {

//       hour: "2-digit",
//       minute: "2-digit"

//     });


//     box.innerHTML += `

//       <div class="msg-row ${isMe ? "me-row" : "other-row"}">

//         <div class="bubble ${isMe ? "me" : "other"}">

//           ${m.text}

//         </div>

//         <div class="time-text">

//           ${time}

//         </div>

//         ${
//           isMe
//           &&
//           i === lastMyMsgIndex
//           &&
//           m.seen

//           ? `<div class="seen-text">Seen</div>`
//           : ""
//         }

//       </div>

//     `;

//   });


//   unseenRefs.forEach(
//   ref =>
//   updateDoc(
//     ref,
//     { seen: true }
//   ));


//   if (shouldScroll)
//     box.scrollTo({

//       top:
//       box.scrollHeight,

//       behavior:
//       "smooth"

//     });

// });


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
//   getDocs,
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

// if (!username)
//   location.href = "index.html";


// const otherKey =
// username === "pratham"
// ? "Adhya"
// : "pratham";


// document.getElementById("chat-name")
// .textContent = otherKey;


// window.logout = () => {

//   localStorage.removeItem("username");

//   location.href = "index.html";

// };


// /* ================= REFS ================= */

// const messagesRef =
// collection(db, "messages");

// const typingRef =
// doc(db, "typing", "status");


// /* ================= LOAD ONLY LAST 2 DAYS ================= */

// const twoDaysAgo =
// Date.now()
// -
// (2 * 24 * 60 * 60 * 1000);


// const q =
// query(
//   messagesRef,
//   where("time", ">=", twoDaysAgo),
//   orderBy("time")
// );


// /* ================= EXPORT CHAT ================= */

// window.exportChat = async () => {

//   const snap =
//   await getDocs(q);

//   let text =
//   "Chat Export\n\n";


//   snap.forEach(doc => {

//     const m = doc.data();

//     const time =
//     new Date(m.time)
//     .toLocaleString();

//     text +=
//     `[${time}] ${m.sender}: ${m.text}\n`;

//   });


//   const blob =
//   new Blob(
//     [text],
//     { type: "text/plain" }
//   );


//   const a =
//   document.createElement("a");

//   a.href =
//   URL.createObjectURL(blob);

//   a.download =
//   "chat.txt";

//   a.click();

// };


// /* ================= SEND MESSAGE ================= */

// window.sendMessage =
// async () => {

//   const input =
//   document.getElementById("msg");

//   const text =
//   input.value.trim();

//   if (!text) return;


//   await addDoc(
//     messagesRef,
//     {

//       sender: username,
//       text,
//       time: Date.now(),
//       seen: false

//     }
//   );


//   await setDoc(
//     typingRef,
//     { [username]: false },
//     { merge: true }
//   );


//   input.value = "";

// };


// document.getElementById("msg")
// .addEventListener(
// "keydown",
// e => {

//   if (e.key === "Enter")
//     sendMessage();

// });


// /* ================= TYPING ================= */

// let typingTimeout;


// document.getElementById("msg")
// .addEventListener(
// "input",
// () => {

//   setDoc(
//     typingRef,
//     { [username]: true },
//     { merge: true }
//   );


//   clearTimeout(
//     typingTimeout
//   );


//   typingTimeout =
//   setTimeout(
//   () => {

//     setDoc(
//       typingRef,
//       { [username]: false },
//       { merge: true }
//     );

//   },
//   800);

// });


// onSnapshot(
// typingRef,
// snap => {

//   if (!snap.exists())
//     return;


//   document.getElementById("typing")
//   .textContent =

//   snap.data()[otherKey]
//   ? "typing…"
//   : "";

// });


// /* ================= ONLINE / LAST SEEN ================= */

// const presenceRef =
// doc(db, "presence", username);


// setDoc(
// presenceRef,
// {
//   online: true,
//   lastSeen: Date.now()
// },
// { merge: true }
// );


// document.addEventListener(
// "visibilitychange",
// () => {

//   if (
//     document.visibilityState
//     === "hidden"
//   ) {

//     setDoc(
//       presenceRef,
//       {
//         online: false,
//         lastSeen: Date.now()
//       },
//       { merge: true }
//     );

//   }
//   else {

//     setDoc(
//       presenceRef,
//       {
//         online: true,
//         lastSeen: Date.now()
//       },
//       { merge: true }
//     );

//   }

// });


// const otherPresenceRef =
// doc(db, "presence", otherKey);


// onSnapshot(
// otherPresenceRef,
// snap => {

//   if (!snap.exists())
//     return;


//   const data =
//   snap.data();

//   const el =
//   document.getElementById(
//     "user-status"
//   );


//   if (data.online) {

//     el.textContent =
//     "Online";

//   }
//   else {

//     const t =
//     new Date(data.lastSeen)
//     .toLocaleTimeString([], {

//       hour: "2-digit",
//       minute: "2-digit"

//     });


//     el.textContent =
//     "Last seen " + t;

//   }

// });


// /* ================= LOAD MESSAGES ================= */

// function isAtBottom(el) {

//   return el.scrollHeight
//   - el.scrollTop
//   - el.clientHeight < 60;

// }


// onSnapshot(
// q,
// snap => {

//   const box =
//   document.getElementById(
//     "messages"
//   );


//   const shouldScroll =
//   isAtBottom(box);


//   box.innerHTML = "";


//   let unseenRefs = [];

//   let lastMyMsgIndex = -1;


//   snap.docs.forEach(
//   (d,i) => {

//     if (
//       d.data().sender
//       === username
//     )
//       lastMyMsgIndex = i;

//   });


//   snap.docs.forEach(
//   (d,i) => {

//     const m = d.data();

//     const isMe =
//     m.sender === username;


//     if (!isMe && !m.seen)
//       unseenRefs.push(d.ref);


//     const time =
//     new Date(m.time)
//     .toLocaleTimeString([], {

//       hour: "2-digit",
//       minute: "2-digit"

//     });


//     box.innerHTML += `

//       <div class="msg-row ${isMe ? "me-row" : "other-row"}">

//         <div class="bubble ${isMe ? "me" : "other"}">

//           ${m.text}

//         </div>

//         <div class="time-text">

//           ${time}

//         </div>

//         ${
//           isMe
//           &&
//           i === lastMyMsgIndex
//           &&
//           m.seen

//           ? `<div class="seen-text">Seen</div>`
//           : ""
//         }

//       </div>

//     `;

//   });


//   unseenRefs.forEach(
//   ref =>
//   updateDoc(
//     ref,
//     { seen: true }
//   ));


//   if (shouldScroll)
//     box.scrollTo({

//       top:
//       box.scrollHeight,

//       behavior:
//       "smooth"

//     });

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
  getDocs,
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

if (!username)
  location.href = "index.html";


const otherKey =
username === "pratham"
? "Adhya"
: "pratham";


document.getElementById("chat-name").textContent =
otherKey;


window.logout = () => {

  localStorage.removeItem("username");

  location.href = "index.html";

};


/* ================= REFS ================= */

const messagesRef =
collection(db, "messages");

const typingRef =
doc(db, "typing", "status");


/* ================= LOAD ONLY LAST 2 DAYS ================= */

const twoDaysAgo =
Date.now() -
(2 * 24 * 60 * 60 * 1000);


const recentQuery =
query(
  messagesRef,
  where("time", ">=", twoDaysAgo),
  orderBy("time")
);


/* ================= EXPORT FULL CHAT ================= */

window.exportChat = async () => {

  const fullQuery =
  query(
    messagesRef,
    orderBy("time")
  );

  const snap =
  await getDocs(fullQuery);

  let text =
  "Full Chat Export\n\n";


  snap.forEach(doc => {

    const m = doc.data();

    const time =
    new Date(m.time)
    .toLocaleString();

    text +=
    `[${time}] ${m.sender}: ${m.text}\n`;

  });


  const blob =
  new Blob([text],
  { type: "text/plain" });


  const a =
  document.createElement("a");

  a.href =
  URL.createObjectURL(blob);

  a.download =
  "full_chat.txt";

  a.click();

};


/* ================= SEND MESSAGE ================= */

window.sendMessage =
async () => {

  const input =
  document.getElementById("msg");

  const text =
  input.value.trim();

  if (!text) return;


  await addDoc(
    messagesRef,
    {
      sender: username,
      text,
      time: Date.now(),
      seen: false
    }
  );


  await setDoc(
    typingRef,
    { [username]: false },
    { merge: true }
  );


  input.value = "";

};


document.getElementById("msg")
.addEventListener(
"keydown",
e => {

  if (e.key === "Enter")
    sendMessage();

});


/* ================= TYPING ================= */

let typingTimeout;


document.getElementById("msg")
.addEventListener(
"input",
() => {

  setDoc(
    typingRef,
    { [username]: true },
    { merge: true }
  );


  clearTimeout(
    typingTimeout
  );


  typingTimeout =
  setTimeout(
  () => {

    setDoc(
      typingRef,
      { [username]: false },
      { merge: true }
    );

  },
  800);

});


onSnapshot(
typingRef,
snap => {

  if (!snap.exists())
    return;


  document.getElementById("typing")
  .textContent =

  snap.data()[otherKey]
  ? "typing…"
  : "";

});


/* ================= ONLINE / LAST SEEN ================= */

const presenceRef =
doc(db, "presence", username);


setDoc(
presenceRef,
{
  online: true,
  lastSeen: Date.now()
},
{ merge: true }
);


document.addEventListener(
"visibilitychange",
() => {

  if (
    document.visibilityState === "hidden"
  ) {

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


onSnapshot(
otherPresenceRef,
snap => {

  if (!snap.exists())
    return;


  const data =
  snap.data();

  const el =
  document.getElementById("user-status");


  if (data.online) {

    el.textContent =
    "Online";

  }
  else {

    const t =
    new Date(data.lastSeen)
    .toLocaleTimeString([], {

      hour: "2-digit",
      minute: "2-digit"

    });

    el.textContent =
    "Last seen " + t;

  }

});


/* ================= LOAD MESSAGES ================= */

function isAtBottom(el) {

  return el.scrollHeight
  - el.scrollTop
  - el.clientHeight < 60;

}


onSnapshot(
recentQuery,
snap => {

  const box =
  document.getElementById("messages");

  const shouldScroll =
  isAtBottom(box);

  box.innerHTML = "";


  let unseenRefs = [];

  let lastMyMsgIndex = -1;


  snap.docs.forEach(
  (d,i) => {

    if (
      d.data().sender === username
    )
      lastMyMsgIndex = i;

  });


  snap.docs.forEach(
  (d,i) => {

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


    box.innerHTML += `

      <div class="msg-row ${isMe ? "me-row" : "other-row"}">

        <div class="bubble ${isMe ? "me" : "other"}">

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

      </div>

    `;

  });


  unseenRefs.forEach(
  ref =>
  updateDoc(
    ref,
    { seen: true }
  ));


  if (shouldScroll)
    box.scrollTo({

      top: box.scrollHeight,

      behavior: "smooth"

    });

});
