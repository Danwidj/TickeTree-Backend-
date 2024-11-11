// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore"; 
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from 'firebase/auth';
import { ref } from 'vue';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase app and services
let db;
let auth;

try {
    const app = initializeApp(firebaseConfig);
    // console.log("Firebase app initialized");

    db = getFirestore(app);
    // console.log("Firestore initialized");

    auth = getAuth(app);
    // console.log("Firebase Auth initialized");
} catch (err) {
    console.error("Error initializing Firebase services: ", err);
}

// Exporting Firebase services
export { 
    db, 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
};

// Class to handle authentication functionality
export class AuthService {
    constructor() {
        this.user = ref(null); // Reactive reference to store the current user
    }

    // Method to observe authentication state
    observeAuthState(callback) {
        onAuthStateChanged(auth, async (user) => {
            this.user.value = user; // Update the reactive user reference
            if (user) {
                await this.fetchUserData(user.uid); // Fetch user data if logged in
            }
            callback(user); // Execute the callback with the current user
        });
    }

    // Method to fetch user data from Firestore
    async fetchUserData(uid) {
        const userDoc = doc(db, 'users', uid); // Adjust 'users' to your Firestore collection name
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
            return userSnapshot.data(); // Return user data
        } else {
            console.error('No such document!');
            return null;
        }
    }
}
