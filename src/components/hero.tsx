import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import Color from 'color';

import colors from '@/jss/colors';
import { boxShadow } from '@/jss/mixins';

const useHeroStyles = createUseStyles({
	hero: ({ variant }: any) => {
		let variantColor = colors.white;

		switch (variant) {
			case 'primary':
				variantColor = colors.primary;
				break;
			case 'secondary':
				variantColor = colors.secondary;
				break;
			case 'success':
				variantColor = colors.success;
				break;
			case 'danger':
				variantColor = colors.danger;
				break;
			case 'warning':
				variantColor = colors.warning;
				break;
			case 'info':
				variantColor = colors.info;
				break;
			case 'light':
				variantColor = colors.light;
				break;
			case 'dark':
				variantColor = colors.dark;
				break;
			default:
				variantColor = colors.white;
		}

		return {
			padding: 25,
			...boxShadow,
			borderRadius: 4,
			backgroundColor: variantColor,
			'& button': {
				color: variantColor,
				backgroundColor: colors.white,
				'&:hover': {
					backgroundColor: Color(variantColor)
						.lighten(0.64)
						.hex(),
				},
				'&:active': {
					backgroundColor: Color(variantColor)
						.lighten(0.48)
						.hex(),
				},
			},
		};
	},
});

interface HeroProps {
	variant?: string;
	className?: string;
}

const Hero: FC<HeroProps> = (props) => {
	const classes = useHeroStyles({ variant: props.variant });

	return <div className={classNames(classes.hero, props.className)}>{props.children}</div>;
};

export default Hero;
