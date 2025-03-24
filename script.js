import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

window.createNewEvent = async function(eventName, date, time, location, description, visibility, invitedEmails) {
    try {
        if (!auth.currentUser) {
            alert("You must be logged in to create an event.");
            return;
        }
        const eventsCollection = collection(db, 'events'); // Get a reference to the 'events' collection
        const eventData = {
            name: eventName,
            date: date,
            time: time,
            location: location,
            description: description,
            organizerId: auth.currentUser.uid, // Associate the event with the logged-in user's ID
            timestamp: new Date(),
            visibility: visibility
        };

        if (visibility === 'private' && invitedEmails) {
            // For now, let's just store the raw email strings
            eventData.invitedEmails = invitedEmails.split(',').map(email => email.trim());
        }

        await addDoc(eventsCollection, eventData);
        console.log("Event created successfully!");
        alert(`Event created successfully! Visibility: ${visibility}`); // Updated success message
        // Optionally, clear the form fields after successful creation
        document.querySelector('#create-event-section form').reset();
    } catch (error) {
        console.error("Error creating event: ", error);
        alert("Failed to create event.");
    }
};

window.loadEvents = async function() {
    try {
        const eventsCollection = collection(db, 'events');
        const querySnapshot = await getDocs(eventsCollection);

        const calendarEvents = [];

        querySnapshot.forEach((doc) => {
            const eventData = doc.data();
            const date = eventData.date;
            const time = eventData.time;
            const dateTimeStr = `${date}T${time}`;
            const eventDate = new Date(dateTimeStr);

            calendarEvents.push({
                date: eventDate,
                title: eventData.name,
                description: `${eventData.time} - ${eventData.description}`
            });
        });

        // Access the global calendar instance and set the events
        if (window.myCalendar && window.myCalendar.setEvents) {
            window.myCalendar.setEvents(calendarEvents);
            console.log("Events loaded onto the calendar.");
        } else {
            console.warn("Calendar instance not found or setEvents method is not available.");
        }

    } catch (error) {
        console.error("Error loading events for calendar: ", error);
    }
};

window.loadMyEvents = async function() {
    const myEventsList = document.getElementById('my-events-list');
    if (!myEventsList) return;
    myEventsList.innerHTML = 'Loading your events...';

    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const eventsCollection = collection(db, 'events');
            const q = query(eventsCollection, where("organizerId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                let html = '<ul>';
                querySnapshot.forEach((doc) => {
                    const eventData = doc.data();
                    const eventId = doc.id; // Get the document ID for identifying the event
                    html += `<li>
                        <strong>${eventData.name}</strong><br>
                        Date: ${eventData.date}, Time: ${eventData.time}<br>
                        Location: ${eventData.location || 'Not specified'}<br>
                        Description: ${eventData.description || 'No description'}
                        <button onclick="window.viewAttendees('${eventId}')">View Attendees</button>
                    </li>`;
                });
                html += '</ul>';
                myEventsList.innerHTML = html;
            } else {
                myEventsList.innerHTML = '<p>You haven\'t created any events yet.</p>';
            }
        }

    } catch (error) {
        console.error("Error loading your events: ", error);
        myEventsList.innerHTML = '<p>Failed to load your events.</p>';
    }
};

window.loadAllEventsList = async function() {
    const viewEventsSection = document.getElementById('view-events-section');
    if (!viewEventsSection) return;
    const calendarDiv = document.getElementById('calendar'); // Using the same div for now
    if (!calendarDiv) return;
    calendarDiv.innerHTML = 'Loading events...';

    try {
        const eventsCollection = collection(db, 'events');
        const querySnapshot = await getDocs(eventsCollection);

        const auth = getAuth();
        const user = auth.currentUser;

        if (!querySnapshot.empty) {
            let html = '<ul>';
            querySnapshot.forEach((doc) => {
                const eventData = doc.data();
                const eventId = doc.id;
                html += `<li>
                    <strong>${eventData.name}</strong><br>
                    Date: ${eventData.date}, Time: ${eventData.time}<br>
                    Location: ${eventData.location || 'Not specified'}<br>
                    Description: ${eventData.description || 'No description'}<br>
                    ${user ? `<button onclick="window.rsvpToEvent('${eventId}')">RSVP</button>` : 'Log in to RSVP'}
                </li>`;
            });
            html += '</ul>';
            calendarDiv.innerHTML = html;
        } else {
            calendarDiv.innerHTML = '<p>No events found.</p>';
        }

    } catch (error) {
        console.error("Error loading all events: ", error);
        calendarDiv.innerHTML = '<p>Failed to load events.</p>';
    }
};

window.rsvpToEvent = async function(eventId) {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        try {
            const attendeesCollection = collection(db, 'events', eventId, 'attendees');
            // Add the user's ID as the document ID in the attendees subcollection
            await setDoc(doc(attendeesCollection, user.uid), {});
            alert('You have RSVP\'d to this event!'); // Basic feedback for now
            // You might want to update the button state or refresh the event list here
        } catch (error) {
            console.error("Error RSVPing to event: ", error);
            alert('Failed to RSVP. Please try again.');
        }
    } else {
        alert('You must be logged in to RSVP.'); // This should ideally not happen due to the button condition
    }
};

// Function to load and display events the user has RSVP'd to
window.loadRsvpEvents = async function() {
    const rsvpEventsList = document.getElementById('rsvp-events-list');
    if (!rsvpEventsList) return;
    rsvpEventsList.innerHTML = 'Loading RSVP\'d events...';

    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
            const eventsCollection = collection(db, 'events');
            const q = query(eventsCollection, where("attendees", "array-contains", user.uid)); // Corrected query
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                let html = '<ul>';
                querySnapshot.forEach((doc) => {
                    const eventData = doc.data();
                    html += `<li>
                        <strong>${eventData.name}</strong><br>
                        Date: ${eventData.date}, Time: ${eventData.time}<br>
                        Location: ${eventData.location || 'Not specified'}<br>
                        Description: ${eventData.description || 'No description'}
                    </li>`;
                });
                html += '</ul>';
                rsvpEventsList.innerHTML = html;
            } else {
                rsvpEventsList.innerHTML = '<p>You haven\'t RSVP\'d to any events yet.</p>';
            }
        } else {
            rsvpEventsList.innerHTML = '<p>You are not logged in.</p>';
        }

    } catch (error) {
        console.error("Error loading RSVP'd events: ", error);
        rsvpEventsList.innerHTML = '<p>Failed to load RSVP\'d events.</p>';
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
        window.loadAllEventsList();
    } else if (sectionId === 'my-events-section') {
        window.loadMyEvents();
    } else if (sectionId === 'rsvp-section') { // Updated condition for the RSVP section
        window.loadRsvpEvents(); // We'll create this function next
    }
};

// Initially show the "View Events" section
document.addEventListener('DOMContentLoaded', function() {
    window.showSection('view-events-section');
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


