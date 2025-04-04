it('logs in a user with correct credentials', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u456' } });
    await loginUser('test@example.com', 'pass123');
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'pass123');
  });
  
  