export const mockAuth = {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
  };
  
  export const mockFirestore = {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    set: jest.fn(),
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ username: "testUser" }) }),
    add: jest.fn().mockResolvedValue({ id: 'event123' }),
    where: jest.fn().mockReturnThis(),
    getDocs: jest.fn().mockResolvedValue([]),
  };
  
  export const mockFirebase = {
    auth: () => mockAuth,
    firestore: () => mockFirestore,
  };
  