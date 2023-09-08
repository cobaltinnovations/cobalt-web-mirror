import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React from 'react';

export interface FeaturedItem {
	subtitle: string;
	imageUrl: string;
	imageAlt: string;
	name: string;
	descriptionHtml: string;
}

interface HeaderNavFeaturedItemProps {
	featuredItem: FeaturedItem;
	mobileNav?: boolean;
	className?: string;
}

interface UseStylesProps {
	mobileNav?: boolean;
}

const useFeaturedItemStyles = createUseThemedStyles((theme) => ({
	featuredItemContainer: ({ mobileNav }: UseStylesProps) => ({
		width: mobileNav ? '100%' : 304,
		borderTopRightRadius: mobileNav ? 0 : 8,
		borderBottomRightRadius: 8,
		borderBottomLeftRadius: mobileNav ? 8 : 0,
		textWrap: 'wrap',
	}),
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

export const HeaderNavFeaturedItem = ({ featuredItem, mobileNav, className }: HeaderNavFeaturedItemProps) => {
	const classes = useFeaturedItemStyles({ mobileNav });

	return (
		<div className={classNames(classes.featuredItemContainer, className)}>
			<p className="text-n500 mb-5">{featuredItem.subtitle}</p>

			<img
				className={classNames('mb-6', classes.featuredItemImage)}
				src={featuredItem.imageUrl}
				alt={featuredItem.imageAlt}
			/>

			<p className="mb-1 fw-semibold">{featuredItem.name}</p>

			<div
				className={classes.featuredItemDescriptionWrapper}
				dangerouslySetInnerHTML={{
					__html: featuredItem.descriptionHtml,
				}}
			/>
		</div>
	);
};
