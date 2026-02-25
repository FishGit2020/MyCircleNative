const mockFirestore = jest.fn(() => ({
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn().mockResolvedValue({ exists: false, data: () => null }),
      set: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      onSnapshot: jest.fn((cb) => {
        cb({ exists: false, data: () => null });
        return jest.fn();
      }),
    })),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({ docs: [], empty: true }),
    onSnapshot: jest.fn((cb) => {
      cb({ docs: [], empty: true });
      return jest.fn();
    }),
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
  })),
}));
mockFirestore.FieldValue = {
  serverTimestamp: jest.fn(() => new Date()),
  delete: jest.fn(),
};

module.exports = { __esModule: true, default: mockFirestore };
