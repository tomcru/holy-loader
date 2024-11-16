import React from 'react';
import { render, screen } from '@testing-library/react';
import Playground from '../pages/Playground';

describe('Playground', () => {
  it('renders the Playground component', () => {
    render(<Playground />);
    const heading = screen.getByText(/Playground/i);
    expect(heading).toBeInTheDocument();
  });

  it('renders the HolyLoader component', () => {
    render(<Playground />);
    const loader = screen.getByText(/This is a simple playground page for testing HolyLoader./i);
    expect(loader).toBeInTheDocument();
  });
});
