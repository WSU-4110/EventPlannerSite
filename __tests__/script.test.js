it('creates a public event without invited users', async () => {
    addDoc.mockResolvedValue({ id: 'event789' });
    await createNewEvent('Party', '2025-04-10', '18:00', 'Club', 'Fun night', 'public', '');
    expect(addDoc).toHaveBeenCalled();
  });  
  
  