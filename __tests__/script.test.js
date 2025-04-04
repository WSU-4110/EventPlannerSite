it('records RSVP for a user', async () => {
    setDoc.mockResolvedValue();
    await rsvpToEvent('event456', 'user789');
    expect(setDoc).toHaveBeenCalled();
  });
  
  
  