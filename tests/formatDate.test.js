function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

test('formats date string to human-readable format', () => {
  const input = '2023-10-05';
  const output = formatDate(input);
  expect(typeof output).toBe('string');
  expect(output).toMatch(/October 4, 2023|4 October 2023/); // Handles different locales
});