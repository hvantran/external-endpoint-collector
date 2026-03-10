import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from './App';

test('renders app with router', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  // App should render without crashing
  expect(document.body).toBeInTheDocument();
});
