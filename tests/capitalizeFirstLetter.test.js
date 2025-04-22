function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  test('capitalizes first letter', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello');
  });
  
  test('handles empty string', () => {
    expect(capitalizeFirstLetter('')).toBe('');
  });