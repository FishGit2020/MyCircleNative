const mockAuth = jest.fn(() => ({
  onAuthStateChanged: jest.fn((cb) => {
    cb(null);
    return jest.fn();
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  currentUser: null,
}));
mockAuth.GoogleAuthProvider = { credential: jest.fn() };

module.exports = { __esModule: true, default: mockAuth };
