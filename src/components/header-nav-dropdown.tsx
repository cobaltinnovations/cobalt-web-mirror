import classNames from 'classnames';
import React, { PropsWithChildren, useState } from 'react';
import { Dropdown } from 'react-bootstrap';

import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down-v2.svg';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { createUseThemedStyles } from '@/jss/theme';

import { FeaturedItem, HeaderNavFeaturedItem } from './header-nav-featured-item';

interface UseStylesProps {
	hasFeaturedItem: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	dropdownMenu: {
		width: ({ hasFeaturedItem }: UseStylesProps) => (hasFeaturedItem ? 640 : 344),
	},
}));

interface HeaderNavDropdownProps {
	title: string;
	subtitle?: string;
	featuredItem: FeaturedItem | null;
	className?: string;
	children: React.ReactNode;
}

const HeaderNavDropdown = ({
	title,
	subtitle,
	featuredItem,
	className,
	children,
}: PropsWithChildren<HeaderNavDropdownProps>) => {
	const classes = useStyles({ hasFeaturedItem: !!featuredItem });
	const [show, setShow] = useState(false);

	return (
		<Dropdown className="h-100" autoClose="outside" show={show} onToggle={setShow}>
			<Dropdown.Toggle as={DropdownToggle}>
				{title}
				<DownChevron width={16} height={16} />
			</Dropdown.Toggle>
			<Dropdown.Menu
				className={classNames(classes.dropdownMenu, 'p-0')}
				as={DropdownMenu}
				flip={false}
				popperConfig={{ strategy: 'fixed' }}
				renderOnMount
			>
				<div className="d-flex">
					<div
						className={classNames({
							'px-5 py-6': featuredItem,
							'p-4': !featuredItem,
						})}
					>
						{subtitle && <p className="text-n500 px-3 mb-3">{subtitle}</p>}
						{children}
					</div>

					{featuredItem && <HeaderNavFeaturedItem className="bg-n50 px-8 py-6" featuredItem={featuredItem} />}
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default HeaderNavDropdown;
