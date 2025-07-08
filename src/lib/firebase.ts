// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBb_WthbevKH_du9gtwC_DZdAvjAYaFAr4",
  authDomain: "musicapp-e347f.firebaseapp.com",
  projectId: "musicapp-e347f",
  storageBucket: "musicapp-e347f.firebasestorage.app",
  messagingSenderId: "25742129852",
  appId: "1:25742129852:web:4de8d318d167a1db7aaeb9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
