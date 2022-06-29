import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useTagStyles = createUseThemedStyles((theme) => ({
	tag: ({ variant }: any) => {
		let textColor = theme.colors.dark;
		let backgroundColor = theme.colors.white;

		switch (variant) {
			case 'primary':
				textColor = theme.colors.white;
				backgroundColor = theme.colors.primary;
				break;
			case 'secondary':
				textColor = theme.colors.white;
				backgroundColor = theme.colors.secondary;
				break;
			case 'success':
				textColor = theme.colors.white;
				backgroundColor = theme.colors.success;
				break;
			case 'danger':
				textColor = theme.colors.white;
				backgroundColor = theme.colors.danger;
				break;
			case 'warning':
				textColor = theme.colors.dark;
				backgroundColor = theme.colors.warning;
				break;
			case 'info':
				textColor = theme.colors.white;
				backgroundColor = theme.colors.info;
				break;
			case 'light':
				textColor = theme.colors.dark;
				backgroundColor = theme.colors.light;
				break;
			case 'dark':
				textColor = theme.colors.white;
				backgroundColor = theme.colors.dark;
				break;
			default:
				textColor = theme.colors.dark;
				backgroundColor = theme.colors.white;
		}

		return {
			color: textColor,
			display: 'flex',
			borderRadius: 4,
			paddingBottom: 2,
			padding: '0 10px',
			backgroundColor: backgroundColor,
		};
	},
}));

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
