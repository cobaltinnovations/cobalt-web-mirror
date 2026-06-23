import useTrackModalView from '@/hooks/use-track-modal-view';
import classNames from 'classnames';
import React, { FC } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
	imageRepositoryModal: {
		width: 1088,
		maxWidth: '90%',
	},
});

interface ImageRepositoryProps extends ModalProps {
	//
}

const ImageRepository: FC<ImageRepositoryProps> = ({ children, ...props }) => {
	const classes = useStyles();
	useTrackModalView('ImageRepository', props.show);

	return (
		<Modal {...props} centered dialogClassName={classNames(classes.imageRepositoryModal, props.dialogClassName)}>
			<Modal.Header closeButton>
				<Modal.Title>Image Repository</Modal.Title>
			</Modal.Header>
			<Modal.Body>{children}</Modal.Body>
			<Modal.Footer className="justify-content-start">
				<Button variant="outline-primary" onClick={() => props.onHide?.()}>
					Cancel
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ImageRepository;
