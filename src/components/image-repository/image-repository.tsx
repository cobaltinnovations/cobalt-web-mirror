import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import SvgIcon from '@/components/svg-icon';

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

const modalTitleByScreenId: Record<IMAGE_REPOSITORY_SCREEN_ID, string> = {
	[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: 'Image Repository',
	[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: 'Add Image',
	[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: 'Image Repository',
};

interface ImageRepositoryProps extends ModalProps {
	//
}

const ImageRepository: FC<ImageRepositoryProps> = ({ children, dialogClassName, onHide, show, ...modalProps }) => {
	const classes = useStyles();
	const [activeScreenId, setActiveScreenId] = useState<IMAGE_REPOSITORY_SCREEN_ID>(
		IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES
	);

	const handleNavigate = useCallback((nextScreenId: IMAGE_REPOSITORY_SCREEN_ID) => {
		setActiveScreenId(nextScreenId);
	}, []);

	useEffect(() => {
		if (show) {
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
		}
	}, [show]);

	const screenByScreenId = useMemo<Record<IMAGE_REPOSITORY_SCREEN_ID, ReactNode>>(
		() => ({
			[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: <ImageRepositoryBrowseImages onNavigate={handleNavigate} />,
			[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: <ImageRepositoryAddImage onNavigate={handleNavigate} />,
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: <ImageRepositorySelectedImage onNavigate={handleNavigate} />,
		}),
		[handleNavigate]
	);

	const footerByScreenId = useMemo<Record<IMAGE_REPOSITORY_SCREEN_ID, ReactNode>>(
		() => ({
			[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: (
				<Button variant="outline-primary" onClick={() => onHide?.()}>
					Cancel
				</Button>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: (
				<Button
					className="d-flex align-items-center"
					variant="outline-primary"
					onClick={() => {
						handleNavigate(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
					}}
				>
					<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
					Library
				</Button>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: (
				<Button
					className="d-flex align-items-center"
					variant="outline-primary"
					onClick={() => {
						handleNavigate(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
					}}
				>
					<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
					Library
				</Button>
			),
		}),
		[handleNavigate, onHide]
	);

	return (
		<Modal
			{...modalProps}
			show={show}
			onHide={onHide}
			centered
			dialogClassName={classNames(classes.imageRepositoryModal, dialogClassName)}
		>
			<Modal.Header closeButton>
				<Modal.Title>{modalTitleByScreenId[activeScreenId]}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{screenByScreenId[activeScreenId]}
				{children}
			</Modal.Body>
			<Modal.Footer className="justify-content-start">{footerByScreenId[activeScreenId]}</Modal.Footer>
		</Modal>
	);
};

export default ImageRepository;
