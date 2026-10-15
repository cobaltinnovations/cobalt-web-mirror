import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Dropdown } from 'react-bootstrap';
import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom';

import { CobaltThemeProvider } from '@/jss/theme';
import HeaderNavDropdown from './header-nav-dropdown';
import { NavFeaturedItem } from './header-nav-featured-item';

// Jest's resolver predates the icon kit's package subpath exports.
jest.mock(
	'@awesome.me/kit-c75e843088/icons',
	() => jest.requireActual('@awesome.me/kit-c75e843088/icons/modules/index.js'),
	{ virtual: true }
);

const renderDropdown = async ({
	featuredItem = null,
	secondaryColumn,
}: {
	featuredItem?: NavFeaturedItem | null;
	secondaryColumn?: React.ReactNode;
} = {}) => {
	const onFooterClick = jest.fn();
	const onDirectoryClick = jest.fn();
	const router = createMemoryRouter(
		[
			{
				path: '*',
				element: (
					<CobaltThemeProvider>
						<HeaderNavDropdown
							title="Community"
							featuredItem={featuredItem}
							secondaryColumn={secondaryColumn}
							footerLink={{ title: 'All communities', to: '/communities', onClick: onDirectoryClick }}
							onFooterClick={onFooterClick}
						>
							<Dropdown.Item as={Link} to="/pages/parents">
								Parents
							</Dropdown.Item>
						</HeaderNavDropdown>
					</CobaltThemeProvider>
				),
			},
		],
		{ initialEntries: ['/'] }
	);

	await act(async () => {
		render(<RouterProvider router={router} />);
	});
	await act(async () => {
		fireEvent.click(screen.getByRole('button', { name: 'Community' }));
	});
	const footerLink = screen.getByRole('link', { name: 'All communities' });
	const menu = footerLink.closest('.dropdown-menu');
	expect(menu).not.toBeNull();

	return { router, menu: menu as HTMLElement, footerLink, onFooterClick, onDirectoryClick };
};

it('keeps the curated Community dropdown compact when it has a directory footer', async () => {
	const { router, menu, footerLink, onFooterClick, onDirectoryClick } = await renderDropdown();

	expect(menu).toHaveStyle({ width: '344px' });
	expect(screen.getByRole('link', { name: 'Parents' })).toHaveAttribute('href', '/pages/parents');
	expect(menu).toHaveClass('show');
	fireEvent.click(footerLink);

	await waitFor(() => expect(router.state.location.pathname).toBe('/communities'));
	expect(onDirectoryClick).toHaveBeenCalledTimes(1);
	expect(onFooterClick).toHaveBeenCalledTimes(1);
	expect(menu).not.toHaveClass('show');
	router.dispose();
});

it('keeps the two-column spotlight layout wide', async () => {
	const { router, menu } = await renderDropdown({
		featuredItem: {
			isLegacy: false,
			subtitle: 'Monthly Spotlight',
			name: 'Spotlight',
			descriptionHtml: '<p>Highlighted resources</p>',
			linkTo: '/pages/spotlight',
			topicCenterId: '',
			pageId: 'spotlight-page',
			imageUrl: '/spotlight.png',
			imageAlt: 'Spotlight image',
		},
	});

	expect(menu).toHaveStyle({ width: '640px' });
	expect(screen.getByRole('link', { name: /Monthly Spotlight/ })).toHaveAttribute('href', '/pages/spotlight');
	router.dispose();
});

it('keeps an actual secondary column wide', async () => {
	const { router, menu } = await renderDropdown({ secondaryColumn: <div>Secondary content</div> });

	expect(menu).toHaveStyle({ width: '640px' });
	expect(screen.getByText('Secondary content')).toBeInTheDocument();
	router.dispose();
});
