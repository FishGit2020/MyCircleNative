const mockMessaging = jest.fn(() => ({
  getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn().mockResolvedValue(null),
  requestPermission: jest.fn().mockResolvedValue(1),
  hasPermission: jest.fn().mockResolvedValue(1),
}));

module.exports = { __esModule: true, default: mockMessaging };
