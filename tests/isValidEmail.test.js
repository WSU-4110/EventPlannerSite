function isValidEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  test('validates correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });
  
  test('invalidates wrong email', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
  });