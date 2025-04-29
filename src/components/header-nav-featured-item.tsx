import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React from 'react';
import { Link, To } from 'react-router-dom';

export interface NavFeaturedItem {
	isLegacy: boolean;
	subtitle: string;
	imageUrl?: string;
	imageAlt?: string;
	name: string;
	descriptionHtml: string;
	linkTo: To;
	topicCenterId: string;
	pageId: string;
}

interface HeaderNavFeaturedItemProps {
	featuredItem: NavFeaturedItem;
	mobileNav?: boolean;
	onImageClick?: () => void;
	className?: string;
}

interface UseStylesProps {
	mobileNav?: boolean;
}

const useFeaturedItemStyles = createUseThemedStyles((theme) => ({
	featuredItemContainer: {
		width: ({ mobileNav }: UseStylesProps) => (mobileNav ? '100%' : 304),
		borderTopRightRadius: ({ mobileNav }: UseStylesProps) => (mobileNav ? 0 : 8),
		borderBottomRightRadius: 8,
		borderBottomLeftRadius: ({ mobileNav }: UseStylesProps) => (mobileNav ? 8 : 0),
		textWrap: 'wrap',
	},
	featuredItemImage: {
		width: ({ mobileNav }: UseStylesProps) => (mobileNav ? '100%' : 240),
		borderRadius: 12,
		backgroundColor: theme.colors.n100,
	},
	featuredItemDescriptionWrapper: {
		'& p:last-of-type': {
			marginBottom: 0,
		},
	},
}));

export const HeaderNavFeaturedItem = ({
	featuredItem,
	mobileNav,
	onImageClick,
	className,
}: HeaderNavFeaturedItemProps) => {
	const classes = useFeaturedItemStyles({ mobileNav });

	return (
		<Link
			className={classNames(classes.featuredItemContainer, 'm-0 d-block text-decoration-none', className)}
			to={featuredItem.linkTo}
			onClick={() => {
				onImageClick?.();
			}}
		>
			<p className="text-n500 mb-5">{featuredItem.subtitle}</p>

			<div className="h-auto p-0 m-0 mb-6">
				<img className={classes.featuredItemImage} src={featuredItem.imageUrl} alt={featuredItem.imageAlt} />
			</div>

			<p className="mb-1 text-dark fw-semibold">{featuredItem.name}</p>

			<div
				className={classNames(classes.featuredItemDescriptionWrapper, 'text-dark')}
				dangerouslySetInnerHTML={{
					__html: featuredItem.descriptionHtml,
				}}
			/>
		</Link>
	);
};
