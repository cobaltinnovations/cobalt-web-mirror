import { createUseThemedStyles } from '@/jss/theme';
import React, { FC } from 'react';
import { Button, Offcanvas, OffcanvasProps } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	previewCanvasBackdrop: {
		// required to have preview canvases open ontop of shelves
		zIndex: 1045,
	},
	previewCanvas: {
		// required to have preview canvases open ontop of shelves
		zIndex: 1046,
		'&.offcanvas.offcanvas-bottom': {
			top: 24,
			left: 24,
			right: 24,
			bottom: 0,
			height: 'auto',
			borderTopLeftRadius: 16,
			borderTopRightRadius: 16,
		},
		'& .offcanvas-title': {
			...theme.fonts.h5.default,
		},
		'& .offcanvas-header': {
			padding: '16px 40px',
			borderTopLeftRadius: 16,
			borderTopRightRadius: 16,
			backgroundColor: theme.colors.n0,
			borderBottom: `1px solid ${theme.colors.border}`,
		},
		'& .offcanvas-body': {
			padding: '32px 40px 0',
			backgroundColor: theme.colors.n50,
		},
	},
}));

interface Props extends OffcanvasProps {
	title: string;
}

export const PreviewCanvas: FC<Props> = ({ title, children, ...props }) => {
	const classes = useStyles();

	return (
		<Offcanvas
			className={classes.previewCanvas}
			placement="bottom"
			{...props}
			backdropClassName={classes.previewCanvasBackdrop}
		>
			<Offcanvas.Header>
				<Offcanvas.Title>{title}</Offcanvas.Title>
				{props.onHide && (
					<Button
						variant="link"
						className="text-decoration-none"
						onClick={() => {
							props.onHide();
						}}
					>
						Close
					</Button>
				)}
			</Offcanvas.Header>
			<Offcanvas.Body>{children}</Offcanvas.Body>
		</Offcanvas>
	);
};
