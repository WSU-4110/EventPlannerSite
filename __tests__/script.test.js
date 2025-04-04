it('registers a user and stores username in Firestore', async () => {
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u123' } });
    doc.mockReturnValue('docRef');
    await registerUser('test@example.com', 'pass123', 'testuser');
    expect(setDoc).toHaveBeenCalledWith('docRef', { username: 'testuser' });
  });
  