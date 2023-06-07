import { render, screen } from '@testing-library/react';
import App from './App';
import * as go from 'gojs';

go.Palette.useDOM(false);

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
