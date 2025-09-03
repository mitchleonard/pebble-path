import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Home } from '@/screens/Home';

describe('Home screen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<Home />);
    expect(getByText('breakfast')).toBeInTheDocument();
  });
});


