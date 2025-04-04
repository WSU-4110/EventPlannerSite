it('fetches events created by the user', async () => {
    const mockQuerySnapshot = { forEach: fn => fn({ data: () => ({ name: 'Event A' }) }) };
    getDocs.mockResolvedValue(mockQuerySnapshot);
    await getUserEvents('user123');
    expect(getDocs).toHaveBeenCalled();
  });
  
  
  