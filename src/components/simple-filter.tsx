import React, { PropsWithChildren } from 'react';
import { Button, Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		width: '90%',
		maxWidth: 220,
		'& .cobalt-modal__body': {
			padding: 24,
		},
		'& .cobalt-modal__footer': {
			padding: '12px 16px',
		},
	},
	button: {
		borderRadius: 500,
		appearance: 'none',
		alignItems: 'center',
		display: 'inline-flex',
		padding: '6px 12px 6px 20px',
		backgroundColor: 'transparent',
		border: `2px solid ${theme.colors.p500}`,
		'& span': {
			fontSize: '1.6rem',
			lineHeight: '2.0rem',
			whiteSpace: 'nowrap',
			...theme.fonts.bodyBold,
			color: theme.colors.p500,
		},
		'& svg': {
			color: theme.colors.p500,
		},
		'&:focus': {
			outline: 'none',
		},
		'&:hover': {
			backgroundColor: theme.colors.p500,
			'& span, & svg': {
				color: theme.colors.n0,
			},
		},
	},
	buttonActive: {
		backgroundColor: theme.colors.p500,
		'& span, & svg': {
			color: theme.colors.n0,
		},
	},
}));

interface Props {
	title: string;
	show: boolean;
	onHide(): void;
	onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onClear(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onApply(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	active?: boolean;
	className?: string;
}

const SimpleFilter = ({
	title,
	show,
	onHide,
	onClick,
	onClear,
	onApply,
	active,
	className,
	children,
}: PropsWithChildren<Props>) => {
	const classes = useStyles();

	return (
		<>
			<Modal show={show} dialogClassName={classes.modal} centered onHide={onHide}>
				<Modal.Body>{children}</Modal.Body>
				<Modal.Footer className="text-right">
					{active && (
						<Button size="sm" variant="outline-primary" onClick={onClear}>
							Clear
						</Button>
					)}

					<Button size="sm" className="ms-2" variant="primary" onClick={onApply}>
						Apply
					</Button>
				</Modal.Footer>
			</Modal>

			<button
				className={classNames(
					classes.button,
					{
						[classes.buttonActive]: active,
					},
					className
				)}
				onClick={onClick}
			>
				<span>{title}</span>
				<ArrowDown className="ms-1" width={24} height={24} />
			</button>
		</>
	);
};

export default SimpleFilter;
