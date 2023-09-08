import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import React from 'react';
import { Link, To } from 'react-router-dom';

export interface NavFeaturedItem {
	subtitle: string;
	imageUrl?: string;
	imageAlt?: string;
	name: string;
	descriptionHtml: string;
	linkTo: To;
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
		<div className={classNames(classes.featuredItemContainer, className)}>
			<p className="text-n500 mb-5">{featuredItem.subtitle}</p>

			<li>
				<Link
					className="h-auto p-0 m-0 mb-6"
					to={featuredItem.linkTo}
					onClick={() => {
						onImageClick?.();
					}}
				>
					<img
						className={classes.featuredItemImage}
						src={featuredItem.imageUrl}
						alt={featuredItem.imageAlt}
					/>
				</Link>
			</li>

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
