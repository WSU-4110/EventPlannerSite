import { registerUser } from '../script.js';

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: 'user123' } })
  )
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(() => 'mockDocRef'),
  setDoc: jest.fn(() => Promise.resolve())
}));

global.window = Object.create(window);
global.window.location = { href: '' };
global.alert = jest.fn();

describe('registerUser', () => {
  it('registers user and writes username to Firestore', async () => {
    await registerUser('test@example.com', 'password123', 'TestUser');

    const { createUserWithEmailAndPassword } = require('firebase/auth');
    const { doc, setDoc } = require('firebase/firestore');

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
    expect(doc).toHaveBeenCalledWith(expect.anything(), 'users', 'user123');
    expect(setDoc).toHaveBeenCalledWith('mockDocRef', { username: 'TestUser' });
    expect(window.location.href).toBe('./planner.html');
  });
});
