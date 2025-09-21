import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

describe('App', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<App />);
    // App should render without throwing
    expect(getByText).toBeDefined();
  });
});
