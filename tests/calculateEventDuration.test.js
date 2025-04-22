function calculateEventDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = (end - start) / (1000 * 60); // duration in minutes
    return duration;
  }
  
test('calculates duration in minutes', () => {
    const start = '2023-10-05T10:00:00';
    const end = '2023-10-05T11:30:00';
    expect(calculateEventDuration(start, end)).toBe(90);
  });