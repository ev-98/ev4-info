// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export const commentColors = ['#04D391', '#FF9900', '#FF0000', '#1181F1', '#FFFF00'];

export function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function loadComments(commentListId) {
    const commentList = document.getElementById(commentListId);
    if (!commentList) return;

    const q = query(collection(db, "comments"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    commentList.innerHTML = snapshot.docs.map(doc => {
        const c = doc.data();
        const time = c.timestamp?.toDate().toLocaleString();
        return `
        <div style="margin-bottom: 8px;">
            <div style="color: ${c.color}; font-weight: bold; font-size: 0.9em;">
                Anonymous on ${time}
            </div>
            <p style="margin: 2px 0 0 0;">${escapeHTML(c.text).replace(/\n/g, '<br>')}</p>
        </div>`;
    }).join("");
}

export function initFeedbackPage(commentInputId, submitButtonId, commentListId) {
    const btn = document.getElementById(submitButtonId);
    const input = document.getElementById(commentInputId);
    if (!btn || !input) return;

    loadComments(commentListId);

    if (!btn.dataset.bound) {
        btn.addEventListener("click", async () => {
            const text = input.value.trim();
            if (!text) return;
            const color = commentColors[Math.floor(Math.random() * commentColors.length)];
            await addDoc(collection(db, "comments"), {
                text,
                color,
                timestamp: serverTimestamp()
            });
            input.value = "";
            loadComments(commentListId);
        });
        btn.dataset.bound = "true";
    }
}
