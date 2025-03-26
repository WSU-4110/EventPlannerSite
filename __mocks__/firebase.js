export const initializeApp = jest.fn(() => ({}));
export const getAuth = jest.fn(() => ({
    currentUser: { uid: "testUser" },
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn()
}));
export const getFirestore = jest.fn(() => ({}));
export const collection = jest.fn();
export const doc = jest.fn();
export const setDoc = jest.fn();
export const addDoc = jest.fn();
export const getDocs = jest.fn(() => Promise.resolve({ docs: [] }));
export const query = jest.fn();
export const where = jest.fn();
