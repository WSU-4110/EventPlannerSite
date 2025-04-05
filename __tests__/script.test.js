const {
  registerUser,
  loginUser,
  createNewEvent,
  getUserEvents,
  getAllEvents,
  rsvpToEvent
} = require('../script.js');

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


test('registerUser works', async () => {
  await delay(25);
  expect(registerUser('test@example.com', 'pass', 'testuser')).toMatch(/registered/);
});

test('loginUser authenticates correctly', async () => {
  await delay(33);
  expect(loginUser('test@example.com', '1234')).toBe(true);
});


test('createNewEvent returns confirmation', async () => {
  await delay(50);
  expect(createNewEvent('Hackathon', '2025-04-10')).toMatch(/Hackathon/);
});


test('getUserEvents returns event list', async () => {
  await delay(15);
  expect(getUserEvents('user123')).toContain('Event 1 for user123');
});


test('getAllEvents returns public events', async () => {
  await delay(25);
  expect(getAllEvents().length).toBeGreaterThan(0);
});


test('rsvpToEvent confirms RSVP', async () => {
  await delay(20);
  expect(rsvpToEvent('event456', 'user789')).toMatch(/RSVPed/);
});