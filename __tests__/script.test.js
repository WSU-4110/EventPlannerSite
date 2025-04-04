it('loads public and invited events for the user', async () => {
    getDocs.mockResolvedValueOnce({ forEach: () => {} }); // public
    getDocs.mockResolvedValueOnce({ forEach: () => {} }); // private
    await getAllEvents();
    expect(getDocs).toHaveBeenCalledTimes(2);
  });
  
  