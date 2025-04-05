it('registers a user and stores username in Firestore', async () => {
  createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u123' } });
  doc.mockReturnValue('docRef');
  await registerUser('test@example.com', 'pass123', 'testuser');
  expect(setDoc).toHaveBeenCalledWith('docRef', { username: 'testuser' });
});
it('logs in a user with correct credentials', async () => {
  signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u456' } });
  await loginUser('test@example.com', 'pass123');
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'pass123');
});
it('creates a public event without invited users', async () => {
  addDoc.mockResolvedValue({ id: 'event789' });
  await createNewEvent('Party', '2025-04-10', '18:00', 'Club', 'Fun night', 'public', '');
  expect(addDoc).toHaveBeenCalled();
});
it('fetches events created by the user', async () => {
  const mockQuerySnapshot = { forEach: fn => fn({ data: () => ({ name: 'Event A' }) }) };
  getDocs.mockResolvedValue(mockQuerySnapshot);
  await getUserEvents('user123');
  expect(getDocs).toHaveBeenCalled();
});
it('loads public and invited events for the user', async () => {
  getDocs.mockResolvedValueOnce({ forEach: () => {} }); // public
  getDocs.mockResolvedValueOnce({ forEach: () => {} }); // private
  await getAllEvents();
  expect(getDocs).toHaveBeenCalledTimes(2);
});
it('records RSVP for a user', async () => {
    setDoc.mockResolvedValue();
    await rsvpToEvent('event456', 'user789');
    expect(setDoc).toHaveBeenCalled();
  });
  
  
  