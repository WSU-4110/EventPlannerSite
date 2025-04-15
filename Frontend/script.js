import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";
import { getFirestore, collection, doc, setDoc, addDoc, getDocs, getDoc, query, where } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";


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
const storage = getStorage(app);

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

window.agendaItems = [];

window.addAgendaItem = function () {
  const time = document.getElementById("agenda-time").value;
  const item = document.getElementById("agenda-item").value;

  if (!time || !item) return alert("Please fill out both time and item fields.");

  window.agendaItems.push({ time, item });
  document.getElementById("agenda-time").value = "";
  document.getElementById("agenda-item").value = "";
  window.renderAgendaList();
};

window.renderAgendaList = function () {
  const container = document.getElementById("agenda-list");
  container.innerHTML = "";
  window.agendaItems.forEach((a, i) => {
    container.innerHTML += `<li>${a.time} - ${a.item}</li>`;
  });
};

// Update createNewEvent to store agenda array
window.createNewEvent = async function(eventName, date, time, location, description, visibility, invitedEmails) {
  try {
    if (!auth.currentUser) {
      alert("You must be logged in to create an event.");
      return;
    }

    const eventsCollection = collection(db, 'events');
    const eventData = {
      name: eventName,
      date: date,
      time: time,
      location: location,
      description: description,
      organizerId: auth.currentUser.uid,
      timestamp: new Date(),
      visibility: visibility,
      agenda: window.agendaItems || []
    };

    if (visibility === 'private' && invitedEmails) {
      eventData.invitedEmails = invitedEmails.split(',').map(email => email.trim());
    }

    const newEventRef = await addDoc(eventsCollection, eventData);

    const fileInput = document.getElementById('event-resource');
    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const storageRef = ref(storage, `event_resources/${newEventRef.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);
      await setDoc(newEventRef, { resourceUrl: fileURL }, { merge: true });
    }

    alert(`Event created successfully! Visibility: ${visibility}`);
    document.querySelector('#create-event-section form').reset();
    window.agendaItems = [];
    document.getElementById("agenda-list").innerHTML = "";
  } catch (error) {
    console.error("Error creating event: ", error);
    alert("Failed to create event.");
  }
};

// Update event renderers to show agenda if present
function renderAgendaHTML(agendaArray) {
  if (!agendaArray || !agendaArray.length) return "";
  return '<strong>Agenda:</strong><ul>' +
    agendaArray.map(a => `<li>${a.time} - ${a.item}</li>`).join('') +
    '</ul>';
}


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

// Insert into script.js after window.loadMyEvents definition

window.editEvent = async function(eventId) {
    try {
      const docRef = doc(db, 'events', eventId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newName = prompt("Edit Event Name:", data.name);
        const newDate = prompt("Edit Date:", data.date);
        const newTime = prompt("Edit Time:", data.time);
        const newLocation = prompt("Edit Location:", data.location);
        const newDescription = prompt("Edit Description:", data.description);
  
        if (newName && newDate && newTime) {
          await updateDoc(docRef, {
            name: newName,
            date: newDate,
            time: newTime,
            location: newLocation,
            description: newDescription
          });
          alert("Event updated successfully.");
          window.loadMyEvents();
        }
      }
    } catch (error) {
      console.error("Error editing event:", error);
    }
  };
  
  window.deleteEvent = async function(eventId) {
    const confirmDelete = confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;
  
    try {
      await deleteDoc(doc(db, 'events', eventId));
      alert("Event deleted successfully.");
      window.loadMyEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };
  
  window.uploadGalleryImages = async function(eventId) {
    const fileInput = document.getElementById(`gallery-input-${eventId}`);
    if (!fileInput || fileInput.files.length === 0) return;
  
    const storageRefBase = ref(storage, `event_galleries/${eventId}`);
    const uploadedUrls = [];
  
    try {
      for (const file of fileInput.files) {
        const imageRef = ref(storageRefBase, file.name);
        await uploadBytes(imageRef, file);
        const url = await getDownloadURL(imageRef);
        uploadedUrls.push(url);
      }
  
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      if (eventDoc.exists()) {
        const currentGallery = eventDoc.data().gallery || [];
        await updateDoc(eventRef, { gallery: [...currentGallery, ...uploadedUrls] });
        alert('Images uploaded to gallery.');
        window.loadMyEvents();
      }
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      alert('Failed to upload images.');
    }
  };
  
  // Modify loadMyEvents to show image gallery upload + preview
  window.loadMyEvents = async function () {
    const myEventsList = document.getElementById('my-events-list');
    if (!myEventsList) return;
    myEventsList.innerHTML = 'Loading your events...';
  
    try {
      const user = auth.currentUser;
  
      if (user) {
        const eventsCollection = collection(db, 'events');
        const q = query(eventsCollection, where("organizerId", "==", user.uid));
        const querySnapshot = await getDocs(q);
  
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
              ${eventData.resourceUrl ? `<a href="${eventData.resourceUrl}" target="_blank">Download Resource</a><br>` : ''}
              <button onclick="window.viewAttendees('${eventId}')">View Attendees</button>
              <button onclick="window.editEvent('${eventId}')">Edit</button>
              <button onclick="window.deleteEvent('${eventId}')">Delete</button><br>
              <label>Upload Gallery Images:</label>
              <input type="file" id="gallery-input-${eventId}" multiple>
              <button onclick="window.uploadGalleryImages('${eventId}')">Upload</button>
              ${eventData.gallery ? eventData.gallery.map(url => `<img src="${url}" style="max-width: 100px; margin: 5px;">`).join('') : ''}
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
  
  
    

  window.loadAllEventsList = async function () {
    const calendarDiv = document.getElementById('calendar');
    if (!calendarDiv) return;
  
    const searchInputId = 'event-search-input';
    if (!document.getElementById(searchInputId)) {
      const input = document.createElement('input');
      input.type = 'text';
      input.id = searchInputId;
      input.placeholder = 'Search events...';
      input.style.marginBottom = '10px';
      input.style.display = 'block';
      input.oninput = () => window.filterEvents();
      calendarDiv.before(input);
    }
  
    const querySnapshot = await getDocs(collection(db, 'events'));
    const auth = getAuth();
    const user = auth.currentUser;
  
    window._allEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    window.renderEventList(window._allEvents, calendarDiv, user);
  };
  
  
  
  // New function to render events (used by filter and initial load)
  window.renderEventList = function (eventList, targetElement, user) {
    let html = '<ul>';
    eventList.forEach(event => {
      const mailSubject = encodeURIComponent(`RSVP Confirmation for ${event.name}`);
      const mailBody = encodeURIComponent(`Thanks for RSVP'ing to ${event.name} on ${event.date} at ${event.time}.`);
  
      html += `<li>
        <strong>${event.name}</strong><br>
        Date: ${event.date}, Time: ${event.time}<br>
        Location: ${event.location || 'Not specified'}<br>
        Description: ${event.description || 'No description'}<br>
        ${user ? `<button onclick="window.rsvpToEvent('${event.id}')">RSVP</button>` : 'Log in to RSVP'}<br>
        <a href="mailto:${user?.email}?subject=${mailSubject}&body=${mailBody}">Send RSVP Email</a><br>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(event.name)}" target="_blank">Share on X</a> |
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank">Facebook</a> |
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank">LinkedIn</a><br>
        <textarea id="feedback-comment-${event.id}" placeholder="Leave feedback" rows="2" style="width:100%;"></textarea>
        <select id="feedback-rating-${event.id}">
          <option value="">Rating</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <button onclick="window.submitFeedback('${event.id}')">Submit Feedback</button>
        <div id="feedback-list-${event.id}" style="margin-top:10px;"></div>
        <script>window.loadFeedbackForEvent('${event.id}');</script>
      </li>`;
    });
    html += '</ul>';
    targetElement.innerHTML = html;
  };
  
  // Search filter function
  window.filterEvents = function () {
    const searchTerm = document.getElementById('event-search-input').value.toLowerCase();
    const calendarDiv = document.getElementById('calendar');
    if (!calendarDiv) return;
  
    const filtered = window.allEvents.filter(event => {
      return (
        event.name.toLowerCase().includes(searchTerm) ||
        (event.location && event.location.toLowerCase().includes(searchTerm)) ||
        event.date.includes(searchTerm)
      );
    });
  
    const auth = getAuth();
    const user = auth.currentUser;
    window.renderEventList(filtered, calendarDiv, user);
  };
  

// Updated RSVP logic with email + timestamp
window.rsvpToEvent = async function(eventId) {
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (user) {
      try {
        const attendeesCollection = collection(db, 'events', eventId, 'attendees');
        await setDoc(doc(attendeesCollection, user.uid), {
          email: user.email,
          rsvpTime: new Date()
        });
        alert('You have RSVP\'d to this event!');
      } catch (error) {
        console.error("Error RSVPing to event: ", error);
        alert('Failed to RSVP. Please try again.');
      }
    } else {
      alert('You must be logged in to RSVP.');
    }
  };
  
  // New: View attendees list
  window.viewAttendees = async function(eventId) {
    try {
      const attendeesCollection = collection(db, 'events', eventId, 'attendees');
      const snapshot = await getDocs(attendeesCollection);
  
      if (snapshot.empty) {
        alert("No one has RSVP'd yet.");
        return;
      }
  
      const attendees = snapshot.docs.map(doc => doc.data().email || '[Anonymous]');
      alert(`Attendees:\n${attendees.join('\n')}`);
    } catch (error) {
      console.error("Error loading attendees:", error);
      alert("Failed to load attendees.");
    }
  };  


// Fixed RSVP event display logic
window.loadRsvpEvents = async function () {
    const rsvpEventsList = document.getElementById('rsvp-section');
    if (!rsvpEventsList) return;
  
    rsvpEventsList.innerHTML = '<h2>RSVP</h2><p>Loading RSVP\'d events...</p>';
  
    try {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user) {
        const eventsCollection = collection(db, 'events');
        const querySnapshot = await getDocs(eventsCollection);
  
        const rsvpEvents = [];
  
        for (const eventDoc of querySnapshot.docs) {
          const attendeesCollection = collection(db, 'events', eventDoc.id, 'attendees');
          const attendeeDoc = await getDoc(doc(attendeesCollection, user.uid));
  
          if (attendeeDoc.exists()) {
            rsvpEvents.push({ id: eventDoc.id, ...eventDoc.data() });
          }
        }
  
        let html = '<h2>RSVP</h2>';
        if (rsvpEvents.length > 0) {
          html += '<ul>';
          rsvpEvents.forEach(event => {
            html += `<li>
              <strong>${event.name}</strong><br>
              Date: ${event.date}, Time: ${event.time}<br>
              Location: ${event.location || 'Not specified'}<br>
              Description: ${event.description || 'No description'}
            </li>`;
          });
          html += '</ul>';
        } else {
          html += '<p>You haven\'t RSVP\'d to any events yet.</p>';
        }
        rsvpEventsList.innerHTML = html;
      } else {
        rsvpEventsList.innerHTML = '<p>You are not logged in.</p>';
      }
  
    } catch (error) {
      console.error("Error loading RSVP\'d events: ", error);
      rsvpEventsList.innerHTML = '<p>Failed to load RSVP\'d events.</p>';
    }
  };

  window.renderEventList = function (eventList, targetElement, user) {
    let html = '<ul>';
    eventList.forEach(event => {
      const shareUrl = encodeURIComponent(window.location.href);
      const shareText = encodeURIComponent(`${event.name} on ${event.date} at ${event.time} - ${event.description}`);
  
      html += `<li>
        <strong>${event.name}</strong><br>
        Date: ${event.date}, Time: ${event.time}<br>
        Location: ${event.location || 'Not specified'}<br>
        Description: ${event.description || 'No description'}<br>
        ${user ? `<button onclick="window.rsvpToEvent('${event.id}')">RSVP</button>` : 'Log in to RSVP'}<br>
        <a href="https://twitter.com/intent/tweet?text=${shareText}%20${shareUrl}" target="_blank">Share on X</a> |
        <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank">Facebook</a> |
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank">LinkedIn</a>
      </li>`;
    });
    html += '</ul>';
    targetElement.innerHTML = html;
  };
  
  // Feedback submission
window.submitFeedback = async function(eventId) {
    const comment = document.getElementById(`feedback-comment-${eventId}`).value;
    const rating = document.getElementById(`feedback-rating-${eventId}`).value;
    const user = auth.currentUser;
  
    if (!user || !comment) {
      alert('You must be logged in and provide a comment.');
      return;
    }
  
    try {
      const feedbackRef = collection(db, 'events', eventId, 'feedback');
      await addDoc(feedbackRef, {
        userId: user.uid,
        email: user.email,
        comment: comment,
        rating: parseInt(rating),
        timestamp: new Date()
      });
      alert('Feedback submitted!');
      window.loadAllEventsList();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback.');
    }
  };

    // Load feedback for an event
    window.loadFeedbackForEvent = async function(eventId) {
        const feedbackList = document.getElementById(`feedback-list-${eventId}`);
        if (!feedbackList) return;
      
        try {
          const feedbackRef = collection(db, 'events', eventId, 'feedback');
          const snapshot = await getDocs(feedbackRef);
          let html = '<ul>';
          snapshot.forEach(doc => {
            const data = doc.data();
            html += `<li><strong>${data.email}</strong>: ${data.comment} (Rating: ${data.rating || 'N/A'})</li>`;
          });
          html += '</ul>';
          feedbackList.innerHTML = html;
        } catch (error) {
          console.error('Error loading feedback:', error);
          feedbackList.innerHTML = '<p>Error loading feedback.</p>';
        }
      };

  // Modify renderEventList to include feedback form and display
  window.renderEventList = function (eventList, targetElement, user) {
      let html = '<ul>';
      eventList.forEach(event => {
          const shareUrl = encodeURIComponent(window.location.href);
          const shareText = encodeURIComponent(`${event.name} on ${event.date} at ${event.time} - ${event.description}`);
      
          html += `<li>
          <strong>${event.name}</strong><br>
          Date: ${event.date}, Time: ${event.time}<br>
          Location: ${event.location || 'Not specified'}<br>
          Description: ${event.description || 'No description'}<br>
          ${user ? `<button onclick="window.rsvpToEvent('${event.id}')">RSVP</button>` : 'Log in to RSVP'}<br>
          <a href="https://twitter.com/intent/tweet?text=${shareText}%20${shareUrl}" target="_blank">Share on X</a> |
          <a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank">Facebook</a> |
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}" target="_blank">LinkedIn</a><br>
          <div style="margin-top: 10px;">
              <textarea id="feedback-comment-${event.id}" placeholder="Leave feedback" rows="2" style="width:100%;"></textarea>
              <select id="feedback-rating-${event.id}">
              <option value="">Rating</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              </select>
              <button onclick="window.submitFeedback('${event.id}')">Submit Feedback</button>
              <div id="feedback-list-${event.id}" style="margin-top:10px;"></div>
              <script>window.loadFeedbackForEvent('${event.id}');</script>
          </div>
          </li>`;
      });
      html += '</ul>';
      targetElement.innerHTML = html;
      };


// Vendor registration
window.registerVendor = async function () {
  const name = document.getElementById('vendor-name').value;
  const type = document.getElementById('vendor-type').value;
  const contact = document.getElementById('vendor-contact').value;
  const website = document.getElementById('vendor-website').value;

  if (!name || !type || !contact) {
    alert('Name, type, and contact are required.');
    return;
  }

  try {
    await addDoc(collection(db, 'vendors'), {
      name: name,
      type: type,
      contact: contact,
      website: website || '',
      timestamp: new Date()
    });
    alert('Vendor registered successfully!');
    window.loadVendors();
  } catch (error) {
    console.error('Error registering vendor:', error);
    alert('Failed to register vendor.');
  }
};

// Load and display vendors with search support
window.loadVendors = async function () {
  const section = document.getElementById('vendor-directory-section');
  const searchInputId = 'vendor-search-input';
  const listContainerId = 'vendor-list';

  // Add search bar if not already present
  if (!document.getElementById(searchInputId)) {
    const searchBar = document.createElement('input');
    searchBar.type = 'text';
    searchBar.id = searchInputId;
    searchBar.placeholder = 'Search vendors by name or type';
    searchBar.style.marginBottom = '10px';
    searchBar.style.display = 'block';
    searchBar.oninput = () => window.filterVendors();
    section.appendChild(searchBar);
  }

  const snapshot = await getDocs(collection(db, 'vendors'));
  window._allVendors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  window.renderVendorList(window._allVendors);
};

window.renderVendorList = function (vendorArray) {
  const section = document.getElementById('vendor-directory-section');
  let existing = document.getElementById('vendor-list');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'vendor-list';

  if (vendorArray.length === 0) {
    container.innerHTML = '<p>No vendors match your search.</p>';
  } else {
    let html = '<h3>Registered Vendors</h3><ul>';
    vendorArray.forEach(v => {
      html += `<li>
        <strong>${v.name}</strong><br>
        Type: ${v.type}<br>
        Contact: ${v.contact}<br>
        ${v.website ? `<a href="${v.website}" target="_blank">Website</a><br>` : ''}
      </li>`;
    });
    html += '</ul>';
    container.innerHTML = html;
  }

  section.appendChild(container);
};

window.filterVendors = function () {
  const input = document.getElementById('vendor-search-input').value.toLowerCase();
  const filtered = window._allVendors.filter(v =>
    v.name.toLowerCase().includes(input) ||
    v.type.toLowerCase().includes(input)
  );
  window.renderVendorList(filtered);
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('vendor-directory-section')) {
    window.loadVendors();
  }
});

  
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('vendor-directory-section')) {
      window.loadVendors();
    }
  });

window.loadRsvpCalendar = async function () {
  const calendarEl = document.getElementById('rsvp-calendar');
  if (!calendarEl) return;

  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const allEvents = await getDocs(collection(db, 'events'));
  const rsvpEvents = [];

  for (const eventDoc of allEvents.docs) {
    const attendeesRef = doc(db, 'events', eventDoc.id, 'attendees', user.uid);
    const attendeeSnap = await getDoc(attendeesRef);
    if (attendeeSnap.exists()) {
      const data = eventDoc.data();
      rsvpEvents.push({
        id: eventDoc.id,
        title: data.name,
        start: `${data.date}T${data.time}`,
        description: data.description,
        location: data.location || ''
      });
    }
  }

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: rsvpEvents,
    eventClick: function (info) {
      const e = info.event;
      const detailDiv = document.getElementById('rsvp-detail-view');
      const html = `
        <h3>${e.title}</h3>
        <p><strong>Time:</strong> ${e.start}</p>
        <p><strong>Location:</strong> ${e.extendedProps.location}</p>
        <p>${e.extendedProps.description}</p>
        <a href="mailto:${auth.currentUser.email}?subject=RSVP Confirmation for ${e.title}&body=Thanks for RSVP'ing to ${e.title}!">Send RSVP Email</a><br>
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(e.title)}" target="_blank">Share on X</a> |
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}" target="_blank">Facebook</a> |
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" target="_blank">LinkedIn</a>
        <br><br>
        <textarea id="feedback-comment-${e.id}" placeholder="Leave feedback" rows="2" style="width:100%;"></textarea>
        <select id="feedback-rating-${e.id}">
          <option value="">Rating</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
        <button onclick="window.submitFeedback('${e.id}')">Submit Feedback</button>
        <div id="feedback-list-${e.id}" style="margin-top:10px;"></div>
        <script>window.loadFeedbackForEvent('${e.id}');</script>
      `;
      detailDiv.innerHTML = html;
    }
  });

  calendar.render();
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
  } else if (sectionId === 'rsvp-section') {
    window.loadRsvpCalendar();
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


