jest.mock('@mycircle/shared', () => ({
  useTranslation: () => ({ t: (key: string) => key, locale: 'en', setLocale: jest.fn() }),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
}));

jest.mock('../hooks/useCloudFiles', () => ({
  useCloudFiles: () => ({
    myFiles: [],
    sharedFiles: [],
    loading: false,
    uploadFile: jest.fn(),
    deleteFile: jest.fn(),
    toggleShare: jest.fn(),
  }),
}));

jest.mock('../components/FileList', () => 'FileList');

import CloudFilesScreen from '../CloudFilesScreen';

describe('CloudFilesScreen', () => {
  it('exports a React component', () => {
    expect(CloudFilesScreen).toBeDefined();
    expect(typeof CloudFilesScreen).toBe('function');
  });
});
