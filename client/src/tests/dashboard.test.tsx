import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';
import { store } from '../store/store';

test('renders dashboard header', () => {
  render(
    <Provider store={store}>
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    </Provider>
  );
  expect(screen.getByText(/Dashboard/)).toBeInTheDocument();
});
