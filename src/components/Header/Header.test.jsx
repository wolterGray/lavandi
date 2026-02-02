import {describe, it, expect} from 'vitest';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Header from './Header.jsx';

describe('Header mobile menu', () => {
  it('closes when Escape key is pressed', async () => {
    const navItems = [{label: 'Home', path: 'home'}];
    render(<Header navItems={navItems} />);

    const openButton = screen.getByLabelText('Меню');
    fireEvent.click(openButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, {key: 'Escape'});

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });
});
