import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyCe8-IJKGUd-yXoYR0xQKMdSuIv5YsznDE",
  authDomain: "fileuploads-be0db.firebaseapp.com",
  projectId: "fileuploads-be0db",
  storageBucket: "fileuploads-be0db.appspot.com",
  messagingSenderId: "832032829361",
  appId: "1:832032829361:web:f2079f619d4aad32ae9790",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);




// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";

// const firebaseConfig = {
//   apiKey: "AIzaSyDruGObTm-8aAbIxwSf8rKkE-J3Zf8Gad0",
//   authDomain: "beefit-e0b4c.firebaseapp.com",
//   projectId: "beefit-e0b4c",
//   storageBucket: "beefit-e0b4c.appspot.com",
//   messagingSenderId: "106797919536",
//   appId: "1:106797919536:web:0251f865a9532252b8acf5",
//   measurementId: "G-1N4DC73VFJ"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);