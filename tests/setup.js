require('@testing-library/jest-dom');

// Mock Leaflet for tests
global.L = {
  map: jest.fn(() => ({
    setView: jest.fn(),
    addLayer: jest.fn(),
    on: jest.fn(),
    invalidateSize: jest.fn()
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn()
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn()
  })),
  icon: jest.fn(() => ({}))
};

// Mock environment variables
process.env.PUBLIC_API_BASE_URL = 'http://localhost:3000';