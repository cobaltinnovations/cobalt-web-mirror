import React from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

const useStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface Props extends ModalProps {
	titleText: string;
	bodyText: string;
	dismissText: string;
	confirmText: string;
	onConfirm(): void;
	displayButtonsBlock?: boolean;
}

const ConfirmDialog = ({
	titleText,
	bodyText,
	dismissText,
	confirmText,
	onConfirm,
	displayButtonsBlock,
	...props
}: Props) => {
	const classes = useStyles();

	return (
		<Modal {...props} dialogClassName={classes.modal} centered>
			<Modal.Header closeButton>
				<Modal.Title>{titleText}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-0 fw-bold">{bodyText}</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
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
					<Button
						className={classNames({
							'ms-2': !displayButtonsBlock,
							'd-block': displayButtonsBlock,
							'w-100': displayButtonsBlock,
						})}
						variant="primary"
						onClick={onConfirm}
					>
						{confirmText}
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ConfirmDialog;
