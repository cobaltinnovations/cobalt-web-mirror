import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import Color from 'color';

import { createUseThemedStyles } from '@/jss/theme';

const useHeroStyles = createUseThemedStyles((theme) => ({
	hero: ({ variant }: any) => {
		let variantColor = theme.colors.n0;

		switch (variant) {
			case 'primary':
				variantColor = theme.colors.p500;
				break;
			case 'secondary':
				variantColor = theme.colors.a500;
				break;
			case 'success':
				variantColor = theme.colors.s500;
				break;
			case 'danger':
				variantColor = theme.colors.d500;
				break;
			case 'warning':
				variantColor = theme.colors.w500;
				break;
			case 'info':
				variantColor = theme.colors.i500;
				break;
			case 'light':
				variantColor = theme.colors.n0;
				break;
			case 'dark':
				variantColor = theme.colors.n900;
				break;
			default:
				variantColor = theme.colors.n0;
		}

		return {
			padding: 25,
			boxShadow: theme.elevation.e200,
			borderRadius: 4,
			backgroundColor: variantColor,
			'& button': {
				color: variantColor,
				backgroundColor: theme.colors.n0,
				'&:hover': {
					backgroundColor: Color(variantColor).lighten(0.64).hex(),
				},
				'&:active': {
					backgroundColor: Color(variantColor).lighten(0.48).hex(),
				},
			},
		};
	},
}));

interface HeroProps extends PropsWithChildren {
	variant?: string;
	className?: string;
}

const Hero: FC<HeroProps> = (props) => {
	const classes = useHeroStyles({ variant: props.variant });

	return <div className={classNames(classes.hero, props.className)}>{props.children}</div>;
};

export default Hero;
