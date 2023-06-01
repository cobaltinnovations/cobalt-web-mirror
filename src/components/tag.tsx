import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

interface UseStylesProps {
	variant?: string;
}

const useTagStyles = createUseThemedStyles((theme) => {
	const defaultColors = {
		textColor: theme.colors.n900,
		backgroundColor: theme.colors.n0,
	};

	const variantColors: Record<string, typeof defaultColors> = {
		primary: {
			textColor: theme.colors.n0,
			backgroundColor: theme.colors.p500,
		},
		secondary: {
			textColor: theme.colors.n0,
			backgroundColor: theme.colors.a500,
		},
		success: {
			textColor: theme.colors.n0,
			backgroundColor: theme.colors.s500,
		},
		danger: {
			textColor: theme.colors.n0,
			backgroundColor: theme.colors.d500,
		},
		warning: {
			textColor: theme.colors.n900,
			backgroundColor: theme.colors.w500,
		},
		info: {
			textColor: theme.colors.n0,
			backgroundColor: theme.colors.i500,
		},
		light: {
			textColor: theme.colors.n900,
			backgroundColor: theme.colors.n0,
		},
		dark: {
			textColor: theme.colors.n0,
			backgroundColor: theme.colors.n900,
		},
	};

	return {
		tag: {
			color: ({ variant }: UseStylesProps) =>
				variant && !!variantColors[variant].textColor
					? variantColors[variant].textColor
					: defaultColors.textColor,
			display: 'flex',
			borderRadius: 4,
			paddingBottom: 2,
			padding: '0 10px',
			backgroundColor: ({ variant }: UseStylesProps) =>
				variant && !!variantColors[variant].backgroundColor
					? variantColors[variant].backgroundColor
					: defaultColors.backgroundColor,
		},
	};
});

interface TagProps extends PropsWithChildren {
	variant?: string;
	className?: string;
}

const Tag: FC<TagProps> = (props) => {
	const classes = useTagStyles({ variant: props.variant });

	return (
		<div className={classNames(classes.tag, props.className)}>
			<small className="font-heading-bold">{props.children}</small>
		</div>
	);
};

export default Tag;
