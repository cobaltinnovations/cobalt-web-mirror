import React, { FC, PropsWithChildren } from 'react';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';

const useTagStyles = createUseThemedStyles((theme) => ({
	tag: ({ variant }: any) => {
		let textColor = theme.colors.n900;
		let backgroundColor = theme.colors.n0;

		switch (variant) {
			case 'primary':
				textColor = theme.colors.n0;
				backgroundColor = theme.colors.p500;
				break;
			case 'secondary':
				textColor = theme.colors.n0;
				backgroundColor = theme.colors.a500;
				break;
			case 'success':
				textColor = theme.colors.n0;
				backgroundColor = theme.colors.s500;
				break;
			case 'danger':
				textColor = theme.colors.n0;
				backgroundColor = theme.colors.d500;
				break;
			case 'warning':
				textColor = theme.colors.n900;
				backgroundColor = theme.colors.w500;
				break;
			case 'info':
				textColor = theme.colors.n0;
				backgroundColor = theme.colors.i500;
				break;
			case 'light':
				textColor = theme.colors.n900;
				backgroundColor = theme.colors.n0;
				break;
			case 'dark':
				textColor = theme.colors.n0;
				backgroundColor = theme.colors.n900;
				break;
			default:
				textColor = theme.colors.n900;
				backgroundColor = theme.colors.n0;
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
