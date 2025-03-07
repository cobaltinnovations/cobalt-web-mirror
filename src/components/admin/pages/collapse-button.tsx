import React, { PropsWithChildren, useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useStyles = createUseThemedStyles((theme) => ({
	collapseButton: {
		border: 0,
		width: '100%',
		display: 'flex',
		padding: '24px 0',
		appearance: 'none',
		alignitems: 'center',
		color: theme.colors.n700,
		...theme.fonts.bodyBold,
		...theme.fonts.h5.default,
		backgroundColor: 'transparent',
		justifyContent: 'space-between',
		'&:hover': {
			color: theme.colors.p500,
		},
	},
}));

interface CollapseButtonProps {
	title: string;
	initialShow?: boolean;
}

export const CollapseButton = ({ title, initialShow, children }: PropsWithChildren<CollapseButtonProps>) => {
	const classes = useStyles();
	const [show, setShow] = useState(initialShow);

	return (
		<>
			<Button className={classes.collapseButton} bsPrefix="collapse-button" onClick={() => setShow(!show)}>
				{title}
				<DownChevron className="d-flex text-n500" style={{ transform: `scaleY(${show ? -1 : 1})` }} />
			</Button>
			<Collapse in={show}>
				<div>{children}</div>
			</Collapse>
		</>
	);
};
