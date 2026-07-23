import React, { PropsWithChildren, useState } from 'react';
import { Button, Collapse } from 'react-bootstrap';
import classNames from 'classnames';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from '@/components/svg-icon';

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
	collapseButtonContent: {
		minWidth: 0,
		display: 'flex',
		alignItems: 'center',
	},
	leadingElement: {
		display: 'flex',
		flexShrink: 0,
		marginRight: 12,
		alignItems: 'center',
	},
	title: {
		minWidth: 0,
	},
}));

interface CollapseButtonProps {
	title: string;
	initialShow?: boolean;
	leadingElement?: JSX.Element;
}

export const CollapseButton = ({
	title,
	initialShow,
	leadingElement,
	children,
}: PropsWithChildren<CollapseButtonProps>) => {
	const classes = useStyles();
	const [show, setShow] = useState(initialShow);

	return (
		<>
			<Button
				className={classes.collapseButton}
				bsPrefix="collapse-button"
				onClick={(event) => {
					if ((event.target as HTMLElement).closest('[data-collapse-ignore-click="true"]')) {
						return;
					}

					setShow(!show);
				}}
			>
				<div className={classes.collapseButtonContent}>
					{leadingElement && (
						<div className={classes.leadingElement} data-collapse-ignore-click="true">
							{leadingElement}
						</div>
					)}
					<span className={classNames(classes.title, 'text-truncate')}>{title}</span>
				</div>
				<SvgIcon
					kit="far"
					icon="chevron-down"
					size={16}
					className="d-flex text-n500"
					style={{ transform: `scaleY(${show ? -1 : 1})` }}
				/>
			</Button>
			<Collapse in={show}>
				<div>{children}</div>
			</Collapse>
		</>
	);
};
