import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import Home from './Home';

describe('Home dashboard view', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        count: 0,
        sessions: [],
      }),
    });
  });

  it('renders empty state when there are no sessions', async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );

    await waitFor(() =>
      expect(screen.getByText(/No sessions found/i)).toBeInTheDocument(),
    );
  });
});

