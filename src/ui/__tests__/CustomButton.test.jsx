// @vitest-environment jsdom

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CustomButton from '../CustomButton';

describe('CustomButton', () => {
  it('renders anchor with proper attributes and children', () => {
    render(<CustomButton>Test link</CustomButton>);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://lavandi.booksy.com/a/');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.textContent).toContain('Test link');
  });
});
