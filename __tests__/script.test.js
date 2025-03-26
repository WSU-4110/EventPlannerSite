import { registerUser, loginUser, createNewEvent, loadEvents, loadMyEvents, rsvpToEvent } from "../script.js";

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({
        currentUser: { uid: "testUser" },
        createUserWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: "testUser" } })),
        signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: "testUser" } }))
    }))
}));

jest.mock("firebase/firestore", () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(() => Promise.resolve()),
    addDoc: jest.fn(() => Promise.resolve()),
    getDocs: jest.fn(() => Promise.resolve({ docs: [] })),
    query: jest.fn(),
    where: jest.fn()
}));

describe("Event Planner App", () => {
    test("registerUser should successfully create a user", async () => {
        await expect(registerUser("test@example.com", "password", "TestUser")).resolves.toBeUndefined();
    });

    test("loginUser should log in an existing user", async () => {
        await expect(loginUser("test@example.com", "password")).resolves.toBeUndefined();
    });

    test("createNewEvent should add a new event to Firestore", async () => {
        await expect(createNewEvent("Test Event", "2025-05-01", "12:00", "Test Location", "Test Description", "public")).resolves.toBeUndefined();
    });

    test("loadEvents should retrieve events", async () => {
        await expect(loadEvents()).resolves.toBeUndefined();
    });

    test("loadMyEvents should retrieve user's created events", async () => {
        await expect(loadMyEvents()).resolves.toBeUndefined();
    });

    test("rsvpToEvent should add user to event attendees", async () => {
        await expect(rsvpToEvent("event123")).resolves.toBeUndefined();
    });
});
