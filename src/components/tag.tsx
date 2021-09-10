import React, { FC } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import colors from '@/jss/colors';

const useTagStyles = createUseStyles({
	tag: ({ variant }: any) => {
		let textColor = colors.dark;
		let backgroundColor = colors.white;

		switch (variant) {
			case 'primary':
				textColor = colors.white;
				backgroundColor = colors.primary;
				break;
			case 'secondary':
				textColor = colors.white;
				backgroundColor = colors.secondary;
				break;
			case 'success':
				textColor = colors.white;
				backgroundColor = colors.success;
				break;
			case 'danger':
				textColor = colors.white;
				backgroundColor = colors.danger;
				break;
			case 'warning':
				textColor = colors.dark;
				backgroundColor = colors.warning;
				break;
			case 'info':
				textColor = colors.white;
				backgroundColor = colors.info;
				break;
			case 'light':
				textColor = colors.dark;
				backgroundColor = colors.light;
				break;
			case 'dark':
				textColor = colors.white;
				backgroundColor = colors.dark;
				break;
			default:
				textColor = colors.dark;
				backgroundColor = colors.white;
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
});

interface TagProps {
	variant?: string;
	className?: string;
}

const Tag: FC<TagProps> = (props) => {
	const classes = useTagStyles({ variant: props.variant });

	return (
		<div className={classNames(classes.tag, props.className)}>
			<small className="font-weight-bold">{props.children}</small>
		</div>
	);
};

export default Tag;
