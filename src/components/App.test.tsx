import { render, screen } from '@testing-library/react';
import App from './App';
import * as go from 'gojs';

go.Palette.useDOM(false);

const trees = [{
  id: 'satyr',
  code: '',
  marriages: []
}]

test('renders app contents', () => {
  render(<App trees={trees} />);
  const element = screen.getByText(/satyr/i);
  expect(element).toBeInTheDocument();
});
