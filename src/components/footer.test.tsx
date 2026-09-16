import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import Footer from './footer';

const mockUseMatches = jest.fn();

jest.mock('react-router-dom', () => ({
	...jest.requireActual('react-router-dom'),
	useMatches: () => mockUseMatches(),
}));

jest.mock('@/hooks/use-account', () => ({
	__esModule: true,
	default: () => ({
		account: { accountId: 'account-id' },
		institution: {
			additionalNavigationItems: [],
			features: [],
			featuresEnabled: false,
			platformName: 'Cobalt',
		},
		isIntegratedCarePatient: false,
	}),
}));

jest.mock('./footer-content', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('./footer-logo', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('./footer-nav', () => ({
	__esModule: true,
	default: () => null,
}));

jest.mock('./svg-icon', () => ({
	__esModule: true,
	default: () => null,
}));

const footerBounds = {
	x: 0,
	y: 0,
	top: 0,
	right: 0,
	bottom: 824,
	left: 0,
	width: 0,
	height: 824,
	toJSON: () => ({}),
};

afterEach(() => {
	document.body.removeAttribute('style');
	jest.restoreAllMocks();
});

it('clears the previous footer reservation when the next route hides the footer', () => {
	mockUseMatches.mockReturnValue([]);
	jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(footerBounds);

	const footer = () => (
		<CobaltThemeProvider>
			<MemoryRouter>
				<Footer />
			</MemoryRouter>
		</CobaltThemeProvider>
	);
	const { rerender } = render(footer());

	expect(document.body.style.paddingBottom).toBe('824px');
	expect(document.body.style.minBlockSize).toBe('calc(100% + 825px)');

	mockUseMatches.mockReturnValue([{ handle: { hideFooter: true } }]);
	rerender(footer());

	expect(document.body.style.paddingBottom).toBe('0px');
	expect(document.body.style.minBlockSize).toBe('100%');
});
