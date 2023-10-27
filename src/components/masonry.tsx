import React from 'react';
import ReactMasonryCss, { MasonryProps } from 'react-masonry-css';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

const useStyles = createUseStyles({
	masonry: {
		'& .masonry': {
			display: 'flex',
			marginLeft: -32,
			width: 'auto',
			'&__column': {
				paddingLeft: 32,
				backgroundClip: 'padding-box',
			},
		},
	},
});

interface Props extends Omit<MasonryProps, 'className'> {
	className?: string;
}

export const Masonry = ({ className, children, ...props }: React.PropsWithChildren<Props>) => {
	const classes = useStyles();

	return (
		<div className={classNames(classes.masonry, className)}>
			<ReactMasonryCss
				breakpointCols={{ default: 3, 992: 2 }}
				className="masonry"
				columnClassName="masonry__column"
				{...props}
			>
				{children}
			</ReactMasonryCss>
		</div>
	);
};
