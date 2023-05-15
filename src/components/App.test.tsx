import { render, screen } from '@testing-library/react';
import App from './App';
import * as go from 'gojs';

go.Palette.useDOM(false);

const trees = [{
  id: 'satyr',
  code: '',
  marriages: []
}]

// Mock FamilyDiagram
jest.mock('./FamilyDiagram', () => () => {
  return <svg />;
});

test('renders app contents', () => {
  render(<App trees={trees} />);
  const element = screen.getByText(/satyr Family/i);
  expect(element).toBeInTheDocument();
});
