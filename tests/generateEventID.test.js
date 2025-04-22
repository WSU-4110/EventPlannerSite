function generateEventID(title, date) {
    return `${title.replace(/\s+/g, '-').toLowerCase()}-${new Date(date).getTime()}`;
  }
  
test('generates event ID correctly', () => {
    const id = generateEventID('My Event', '2023-10-05');
    expect(id).toMatch(/my-event-\d+/);
  });

