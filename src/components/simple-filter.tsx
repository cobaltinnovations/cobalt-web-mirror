import React, { PropsWithChildren } from 'react';
import { Button, Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as ArrowDown } from '@/assets/icons/icon-arrow-down.svg';

interface UseStylesProps {
	dialogWidth: number;
}

const useStyles = createUseThemedStyles((theme) => ({
	modal: {
		width: '90%',
		height: '100%',
		maxWidth: ({ dialogWidth }: UseStylesProps) => dialogWidth,
		margin: '0 auto',
		'& .modal-content': {
			maxHeight: '90vh',
		},
		'& .cobalt-modal__body': {
			padding: 24,
		},
		'& .cobalt-modal__footer': {
			padding: '12px 16px',
		},
	},
	button: {
		minHeight: 40,
		borderRadius: 500,
		appearance: 'none',
		alignItems: 'center',
		display: 'inline-flex',
		padding: '0 12px 0 20px',
		backgroundColor: 'transparent',
		border: `2px solid ${theme.colors.p500}`,
		'& span': {
			fontSize: '1.4rem',
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
		padding: '0 20px',
		backgroundColor: theme.colors.p500,
		'& span, & svg': {
			color: theme.colors.n0,
		},
	},
}));

export interface SimpleFilterProps {
	title: string;
	show: boolean;
	onHide(): void;
	onClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onClear(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	onApply(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void;
	activeLength?: number;
	dialogWidth?: number;
	className?: string;
}

const SimpleFilter = ({
	title,
	show,
	onHide,
	onClick,
	onClear,
	onApply,
	activeLength,
	dialogWidth = 220,
	className,
	children,
}: PropsWithChildren<SimpleFilterProps>) => {
	const classes = useStyles({ dialogWidth });

	return (
		<>
			<Modal show={show} dialogClassName={classes.modal} centered onHide={onHide}>
				<Modal.Body>{children}</Modal.Body>
				<Modal.Footer className="text-right">
					{!!activeLength && (
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
						[classes.buttonActive]: activeLength,
					},
					className
				)}
				onClick={onClick}
			>
				<span>{title}</span>
				{activeLength && activeLength > 0 ? (
					<span>&nbsp;&bull; {activeLength}</span>
				) : (
					<ArrowDown className="ms-1" width={24} height={24} />
				)}
			</button>
		</>
	);
};

export interface SimpleFilterModel<T> {
	id: T;
	title: string;
	searchParam: string;
	value: string[];
	options: {
		title: string;
		value: string;
	}[];
	isShowing: boolean;
}

export default SimpleFilter;
