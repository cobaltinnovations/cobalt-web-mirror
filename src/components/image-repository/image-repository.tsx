import useTrackModalView from '@/hooks/use-track-modal-view';
import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useMemo, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import ImageRepositoryScreenOne from './image-repository-screen-one';
import ImageRepositoryScreenThree from './image-repository-screen-three';
import ImageRepositoryScreenTwo from './image-repository-screen-two';
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
		IMAGE_REPOSITORY_SCREEN_ID.SCREEN_ONE
	);

	useTrackModalView('ImageRepository', props.show);

	const handleNavigate = useCallback((nextScreenId: IMAGE_REPOSITORY_SCREEN_ID) => {
		setActiveScreenId(nextScreenId);
	}, []);

	const screenByScreenId = useMemo<Record<IMAGE_REPOSITORY_SCREEN_ID, ReactNode>>(
		() => ({
			[IMAGE_REPOSITORY_SCREEN_ID.SCREEN_ONE]: <ImageRepositoryScreenOne onNavigate={handleNavigate} />,
			[IMAGE_REPOSITORY_SCREEN_ID.SCREEN_TWO]: <ImageRepositoryScreenTwo onNavigate={handleNavigate} />,
			[IMAGE_REPOSITORY_SCREEN_ID.SCREEN_THREE]: <ImageRepositoryScreenThree onNavigate={handleNavigate} />,
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
