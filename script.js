function registerUser(email, password, username) {
  return `User ${username} registered with ${email}`;
}

function loginUser(email, password) {
  return email === 'test@example.com' && password === '1234';
}

function createNewEvent(name, date) {
  return `Event '${name}' on ${date} created`;
}

function getUserEvents(userId) {
  return [`Event 1 for ${userId}`, `Event 2 for ${userId}`];
}

function getAllEvents() {
  return ['Event A', 'Event B', 'Event C'];
}

function rsvpToEvent(eventId, userId) {
  return `User ${userId} RSVPed to ${eventId}`;
}

module.exports = {
  registerUser,
  loginUser,
  createNewEvent,
  getUserEvents,
  getAllEvents,
  rsvpToEvent
};