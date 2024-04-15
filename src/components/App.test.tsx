import { render, screen } from '@testing-library/react';
import App from './App';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as go from 'gojs';

go.Palette.useDOM(false);

i18n.use(initReactI18next).init({
  fallbackLng: ['dev'],
  resources: {
    dev: {
      translation: {
        'header.family': '{{name}} Family',
        'header.general_family': 'Family Grid'
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

const trees = [{
  id: 'satyr',
  code: '',
  marriages: [{
    spouse: { id: 'surtr', code: '', marriages: [] },
    children: [{
      id: 'hound',
      code: '',
      marriages: []
    }]
  }]
}]

// Mock FamilyDiagram
jest.mock('./FamilyDiagram', () => () => {
  return <svg />;
});

describe('App', () => {
  beforeEach(() => {
    localStorage.clear(); // Clear local storage before each test
  });

  test('renders app contents with split', () => {
    render(<App trees={trees} split />);
    const element = screen.getByText(/satyr Family/i);
    expect(element).toBeInTheDocument();
  });

  test('renders app contents without split', () => {
    render(<App trees={trees} split={false} />);
    const element = screen.getByText(/satyr/i);
    expect(element).toBeInTheDocument();
  });
});
