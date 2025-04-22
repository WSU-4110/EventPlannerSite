function truncateText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  test('truncates text longer than maxLength', () => {
    expect(truncateText('This is a long string', 10)).toBe('This is a ...');
  });
  
  test('returns full text if under maxLength', () => {
    expect(truncateText('Short', 10)).toBe('Short');
  });