import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import Color from 'color';

import { boxShadow } from '@/jss/mixins';
import { createUseThemedStyles } from '@/jss/theme';

const useHeroStyles = createUseThemedStyles((theme) => ({
	hero: ({ variant }: any) => {
		let variantColor = theme.colors.white;

		switch (variant) {
			case 'primary':
				variantColor = theme.colors.primary;
				break;
			case 'secondary':
				variantColor = theme.colors.secondary;
				break;
			case 'success':
				variantColor = theme.colors.success;
				break;
			case 'danger':
				variantColor = theme.colors.danger;
				break;
			case 'warning':
				variantColor = theme.colors.warning;
				break;
			case 'info':
				variantColor = theme.colors.info;
				break;
			case 'light':
				variantColor = theme.colors.light;
				break;
			case 'dark':
				variantColor = theme.colors.dark;
				break;
			default:
				variantColor = theme.colors.white;
		}

		return {
			padding: 25,
			...boxShadow,
			borderRadius: 4,
			backgroundColor: variantColor,
			'& button': {
				color: variantColor,
				backgroundColor: theme.colors.white,
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
