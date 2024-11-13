import { createUseThemedStyles } from '@/jss/theme';
import React, { FC } from 'react';
import { Offcanvas, OffcanvasProps } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	internalShelfBackdrop: {
		// required to open ontop of preview canvas
		zIndex: 1047,
	},
	internalShelf: {
		// required to open ontop of preview canvas
		zIndex: 1048,
		width: '95% !important',
		maxWidth: '800px !important',
		'& section': {
			padding: 32,
			borderBottom: `1px solid ${theme.colors.border}`,
		},
	},
}));

export const PreviewCanvasInternalShelf: FC<OffcanvasProps> = ({ children, ...props }) => {
	const classes = useStyles();

	return (
		<Offcanvas
			className={classes.internalShelf}
			placement="end"
			{...props}
			backdropClassName={classes.internalShelfBackdrop}
		>
			{children}
		</Offcanvas>
	);
};
