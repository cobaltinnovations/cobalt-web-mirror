import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import SvgIcon from '@/components/svg-icon';

import ImageRepositoryAddImage from './image-repository-add-image';
import ImageRepositoryBrowseImages from './image-repository-browse-images';
import ImageRepositorySelectedImage from './image-repository-selected-image';
import { IMAGE_REPOSITORY_SCREEN_ID, ImageRepositoryImage } from './image-repository.types';

const useStyles = createUseStyles({
	imageRepositoryModal: {
		width: 1088,
		maxWidth: '90%',
	},
});

const modalTitleByScreenId: Record<IMAGE_REPOSITORY_SCREEN_ID, string> = {
	[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: 'Image Repository',
	[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: 'Add Image',
	[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: 'Add Image',
};

const modalBodyClassNameByScreenId: Record<IMAGE_REPOSITORY_SCREEN_ID, string | undefined> = {
	[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: undefined,
	[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: undefined,
	[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: 'p-0',
};

interface ImageRepositoryProps extends ModalProps {
	//
}

const ImageRepository: FC<ImageRepositoryProps> = ({ children, dialogClassName, onHide, show, ...modalProps }) => {
	const classes = useStyles();
	const [activeScreenId, setActiveScreenId] = useState<IMAGE_REPOSITORY_SCREEN_ID>(
		IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES
	);
	const [selectedImage, setSelectedImage] = useState<ImageRepositoryImage>();

	const handleNavigate = useCallback((nextScreenId: IMAGE_REPOSITORY_SCREEN_ID) => {
		setActiveScreenId(nextScreenId);
	}, []);

	const handleImageUploaded = useCallback((image: ImageRepositoryImage) => {
		setSelectedImage(image);
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE);
	}, []);

	const handleSelectedImageChange = useCallback((image: ImageRepositoryImage) => {
		setSelectedImage(image);
	}, []);

	useEffect(() => {
		if (show) {
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
			setSelectedImage(undefined);
		}
	}, [show]);

	useEffect(() => {
		if (activeScreenId === IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE && !selectedImage) {
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE);
		}
	}, [activeScreenId, selectedImage]);

	const screenByScreenId = useMemo<Record<IMAGE_REPOSITORY_SCREEN_ID, ReactNode>>(
		() => ({
			[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: (
				<ImageRepositoryBrowseImages onNavigate={handleNavigate} selectedImage={selectedImage} />
			),
			[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: (
				<ImageRepositoryAddImage
					onNavigate={handleNavigate}
					onImageUploaded={handleImageUploaded}
					selectedImage={selectedImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: (
				<ImageRepositorySelectedImage
					onNavigate={handleNavigate}
					onSelectedImageChange={handleSelectedImageChange}
					selectedImage={selectedImage}
				/>
			),
		}),
		[handleImageUploaded, handleNavigate, handleSelectedImageChange, selectedImage]
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
				<div className="d-flex justify-content-between w-100">
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
					<Button variant="primary" onClick={() => onHide?.()} disabled={!selectedImage}>
						Add Image
					</Button>
				</div>
			),
		}),
		[handleNavigate, onHide, selectedImage]
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
			<Modal.Body className={modalBodyClassNameByScreenId[activeScreenId]}>
				{screenByScreenId[activeScreenId]}
				{children}
			</Modal.Body>
			<Modal.Footer className="justify-content-start">{footerByScreenId[activeScreenId]}</Modal.Footer>
		</Modal>
	);
};

export default ImageRepository;
