import classNames from 'classnames';
import React, { PropsWithChildren, useState } from 'react';
import { Dropdown } from 'react-bootstrap';

import {
	AnalyticsNativeEventClickthroughTopicCenterSource,
	AnalyticsNativeEventTypeId,
	SITE_LOCATION_ID,
} from '@/lib/models';
import { analyticsService } from '@/lib/services';
import SvgIcon from '@/components/svg-icon';
import { DropdownMenu, DropdownToggle } from '@/components/dropdown';
import { HeaderNavFeaturedItem, NavFeaturedItem } from '@/components/header-nav-featured-item';
import { createUseThemedStyles } from '@/jss/theme';
import { Link, To } from 'react-router-dom';

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
	titleTo?: To;
	onTitleClick?(): void;
	subtitle?: string;
	onToggle?: (show: boolean) => void;
	featuredItem: NavFeaturedItem | null;
	children: React.ReactNode;
}

const HeaderNavDropdown = ({
	title,
	titleTo,
	onTitleClick,
	subtitle,
	onToggle,
	featuredItem,
	children,
}: PropsWithChildren<HeaderNavDropdownProps>) => {
	const classes = useStyles({ hasFeaturedItem: !!featuredItem });
	const [show, setShow] = useState(false);

	return (
		<Dropdown
			className="h-100 d-flex align-items-center"
			show={show}
			onToggle={(nextShow) => {
				onToggle?.(nextShow);
				setShow(nextShow);
			}}
		>
			{titleTo && (
				<Link
					to={titleTo}
					onClick={() => {
						setShow(false);
						onTitleClick?.();
					}}
				>
					{title}
				</Link>
			)}
			<Dropdown.Toggle
				as={DropdownToggle}
				aria-label={titleTo ? `Show ${title} links` : undefined}
				className={titleTo ? 'px-1' : undefined}
			>
				{!titleTo && title}
				<SvgIcon kit="fas" icon="chevron-down" size={10} className={titleTo ? undefined : 'ms-2'} />
			</Dropdown.Toggle>
			<Dropdown.Menu
				className={classNames(classes.dropdownMenu, 'p-0')}
				as={DropdownMenu}
				flip={false}
				popperConfig={{
					strategy: 'fixed',
					modifiers: [
						{
							name: 'offset',
							options: {
								offset: ({
									popper,
									reference,
								}: {
									popper: { width: number };
									reference: { width: number };
								}) => {
									if (!featuredItem && title !== 'Community') {
										return [0, 0];
									}
									const halfPopperWidth = popper.width / 2;
									const halfRefWidth = reference.width / 2;

									return [halfRefWidth - halfPopperWidth, 0];
								},
							},
						},
					],
				}}
				renderOnMount
			>
				<div className="d-flex w-100">
					<div
						className={classNames('flex-grow-1', {
							'px-5 py-6': featuredItem,
							'p-4': !featuredItem,
						})}
					>
						{subtitle && <p className="text-n500 px-3 mb-3">{subtitle}</p>}
						{children}
					</div>

					{featuredItem && (
						<HeaderNavFeaturedItem
							className="bg-n50 px-8 py-6"
							featuredItem={featuredItem}
							onImageClick={() => {
								setShow(false);
								featuredItem.isLegacy
									? analyticsService.persistEvent(
											AnalyticsNativeEventTypeId.CLICKTHROUGH_TOPIC_CENTER,
											{
												topicCenterId: featuredItem.topicCenterId,
												source: AnalyticsNativeEventClickthroughTopicCenterSource.NAV_FEATURE,
											}
									  )
									: analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE, {
											pageId: featuredItem.pageId,
											source: AnalyticsNativeEventClickthroughTopicCenterSource.NAV_FEATURE,
											siteLocationId: SITE_LOCATION_ID.FEATURED_TOPIC,
									  });
							}}
						/>
					)}
				</div>
			</Dropdown.Menu>
		</Dropdown>
	);
};

export default HeaderNavDropdown;
