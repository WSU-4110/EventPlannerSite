import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

//firebase config
const firebaseConfig = {
    apiKey: "AIzaSyB78Zxb1syQWWtf-bPDzGdhClkmBZsKkWM",
    authDomain: "eventplannersite-7e4a1.firebaseapp.com",
    projectId: "eventplannersite-7e4a1",
    storageBucket: "eventplannersite-7e4a1.firebasestorage.app",
    messagingSenderId: "107253360225",
    appId: "1:107253360225:web:7cbdea05d0d78e68576c20",
    measurementId: "G-JNNSMNC46Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

async function registerUser(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Registration successful:", user);
        // Optionally, store the username in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            username: username
        });
        window.location.href = './planner.html'; // Redirect to the planner page
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Registration error:", errorCode, errorMessage);
        alert("Registration failed: " + errorMessage);
        // Handle errors (e.g., display error message to the user)
    }
}

async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Login successful:", user);
        window.location.href = './planner.html'; // Redirect to the planner page
    } catch (error) {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Login error:", errorCode, errorMessage);
        alert("Login failed: " + errorMessage);
        // Handle errors (e.g., display error message to the user)
     }
}

async function createNewEvent(eventName, date, time, location, description) {
    try {
        if (!auth.currentUser) {
            alert("You must be logged in to create an event.");
            return;
        }
        const eventsCollection = collection(db, 'events'); // Get a reference to the 'events' collection
        await addDoc(eventsCollection, { // Add a new document to the collection
            name: eventName,
            date: date,
            time: time,
            location: location,
            description: description,
            organizerId: auth.currentUser.uid, // Associate the event with the logged-in user's ID
            timestamp: new Date()
        });
        console.log("Event created successfully!");
        alert("Event created successfully!");
        // Optionally, clear the form fields after successful creation
        document.querySelector('#create-event-section form').reset();
    } catch (error) {
        console.error("Error creating event: ", error);
        alert("Failed to create event.");
    }
}

// Script from login.html
window.showRegisterForm = function() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
};

window.showLoginForm = function() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
};

// Script from planner.html
// Is currently in planner.html

// Initially show the "View Events" section or any default section
// Is currently in planner.html