import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('shows the TapGo home heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'TapGo' })).toBeInTheDocument();
  });
});
