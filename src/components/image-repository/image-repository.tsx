import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import ImageRepositoryAddImage from './image-repository-add-image';
import ImageRepositoryBrowseImages from './image-repository-browse-images';
import ImageRepositorySelectedImage from './image-repository-selected-image';
import { IMAGE_REPOSITORY_SCREEN_ID } from './image-repository.types';

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
	const [activeScreenId, setActiveScreenId] = useState<IMAGE_REPOSITORY_SCREEN_ID>(
		IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES
	);

	const handleNavigate = useCallback((nextScreenId: IMAGE_REPOSITORY_SCREEN_ID) => {
		setActiveScreenId(nextScreenId);
	}, []);

	const screenByScreenId = useMemo<Record<IMAGE_REPOSITORY_SCREEN_ID, ReactNode>>(
		() => ({
			[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: <ImageRepositoryBrowseImages onNavigate={handleNavigate} />,
			[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: <ImageRepositoryAddImage onNavigate={handleNavigate} />,
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: <ImageRepositorySelectedImage onNavigate={handleNavigate} />,
		}),
		[handleNavigate]
	);

	return (
		<Modal {...props} centered dialogClassName={classNames(classes.imageRepositoryModal, props.dialogClassName)}>
			<Modal.Header closeButton>
				<Modal.Title>Image Repository</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{screenByScreenId[activeScreenId]}
				{children}
			</Modal.Body>
			<Modal.Footer className="justify-content-start">
				<Button variant="outline-primary" onClick={() => props.onHide?.()}>
					Cancel
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default ImageRepository;
