import React from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';
import LoadingButton from './loading-button';

const useStyles = createUseStyles({
	smallModal: {
		maxWidth: 295,
	},
	largeModal: {
		maxWidth: 480,
	},
});

export interface ConfirmDialogProps extends ModalProps {
	titleText: string;
	bodyText: string;
	dismissText: string;
	confirmText: string;
	detailText?: React.ReactNode;
	isConfirming?: boolean;
	onConfirm(): void;
	destructive?: boolean;
	size?: 'sm' | 'lg';
	displayButtonsBlock?: boolean;
	showDissmissButton?: boolean;
}

const ConfirmDialog = ({
	titleText,
	bodyText,
	dismissText,
	confirmText,
	detailText,
	onConfirm,
	isConfirming = false,
	destructive = false,
	size = 'sm',
	displayButtonsBlock,
	showDissmissButton = true,
	...props
}: ConfirmDialogProps) => {
	const classes = useStyles();

	return (
		<Modal
			{...props}
			dialogClassName={classNames({
				[classes.largeModal]: size === 'lg',
				[classes.smallModal]: size === 'sm',
			})}
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title>{titleText}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0 fw-bold">{bodyText}</p>
				{detailText && (
					<>{typeof detailText === 'string' ? <p className="mt-2">{detailText}</p> : detailText}</>
				)}
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					{showDissmissButton && (
						<Button
							className={classNames({
								'mb-2': displayButtonsBlock,
								'd-block': displayButtonsBlock,
								'w-100': displayButtonsBlock,
							})}
							variant="outline-primary"
							onClick={props.onHide}
						>
							{dismissText}
						</Button>
					)}
					<LoadingButton
						isLoading={isConfirming}
						className={classNames({
							'ms-2': !displayButtonsBlock,
							'd-block': displayButtonsBlock,
							'w-100': displayButtonsBlock,
						})}
						variant={destructive ? 'danger' : 'primary'}
						onClick={onConfirm}
					>
						{confirmText}
					</LoadingButton>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmDialog;
