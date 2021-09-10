import React, { FC } from 'react';
import { ModalProps, Modal, Button } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useSessionCropModalStyles = createUseStyles({
	sessionRemoveImageModal: {
		width: '90%',
		maxWidth: 600,
		margin: '0 auto',
	},
	imagePreview: {
		maxWidth: '100%',
	},
});

interface SessionRemoveImageModalProps extends ModalProps {
	imageSource: string;
	onRemove(): void;
}

const SessionRemoveImageModal: FC<SessionRemoveImageModalProps> = ({ imageSource, onRemove, ...props }) => {
	const classes = useSessionCropModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.sessionRemoveImageModal} centered>
			<Modal.Header closeButton bsPrefix="cobalt-modal__header--admin">
				<Modal.Title bsPrefix="cobalt-modal__title--admin">remove post image</Modal.Title>
			</Modal.Header>
			<Modal.Body bsPrefix="cobalt-modal__body--admin--small">
				<img className={classes.imagePreview} src={imageSource} alt="" />
				<div className="mt-5">
					<p className="mb-0 font-size-xxs text-center">
						Are you sure you want to remove the image from your post? We’ll replace it with a default Cobalt
						images from our collection.
					</p>
				</div>
			</Modal.Body>
			<Modal.Footer bsPrefix="cobalt-modal__footer--admin">
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					cancel
				</Button>
				<Button variant="danger" size="sm" className="ml-3" onClick={onRemove}>
					yes, remove image
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default SessionRemoveImageModal;
