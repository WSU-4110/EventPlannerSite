import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

window.registerUser = async function(email, password, username) {
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
};

window.loginUser = async function(email, password) {
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
     }
};

window.createNewEvent = async function(eventName, date, time, location, description) {
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
};

window.loadEvents = async function() {
    const eventsListDiv = document.getElementById('event-list');
    if (!eventsListDiv) return;
    eventsListDiv.innerHTML = 'Loading all events...';

    try {
        const eventsCollection = collection(db, 'events');
        const querySnapshot = await getDocs(eventsCollection); // Fetch all documents

        let eventsHTML = '';
        querySnapshot.forEach((doc) => {
            const eventData = doc.data();
            eventsHTML += `
                <div class="event-item">
                    <h3>${eventData.name}</h3>
                    <p>Date: ${eventData.date}</p>
                    <p>Time: ${eventData.time}</p>
                    <p>Location: ${eventData.location}</p>
                    <p>${eventData.description}</p>
                    <button onclick="alert('RSVP functionality needs implementation for event ID: ${doc.id}')">RSVP</button>
                </div>
            `;
        });

        if (eventsHTML === '') {
            eventsListDiv.innerHTML = '<p>No events found.</p>';
        } else {
            eventsListDiv.innerHTML = eventsHTML;
        }

    } catch (error) {
        console.error("Error loading events: ", error);
        eventsListDiv.innerHTML = '<p>Failed to load events.</p>';
    }
};

// Call this function when the "View Events" section is shown
window.showSection = function(sectionId) {
    const sections = document.querySelectorAll('.container > .section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
    }

    if (sectionId === 'view-events-section') {
        window.loadEvents(); // Call the globally accessible loadEvents function
    }
};

// Initially show the "View Events" section
document.addEventListener('DOMContentLoaded', function() {
    window.showSection('view-events-section'); // Call the globally accessible showSection
});

// Make these functions globally accessible
window.showRegisterForm = function() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
};

window.showLoginForm = function() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
};


