import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loader from '../Loader';

describe('Loader', () => {
    it('should render the loader', () => {
        const { container } = render(<Loader />);
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
    });
});
