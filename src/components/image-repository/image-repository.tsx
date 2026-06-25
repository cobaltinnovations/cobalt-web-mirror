import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import SvgIcon from '@/components/svg-icon';
import useHandleError from '@/hooks/use-handle-error';

import ImageRepositoryAddImage from './image-repository-add-image';
import ImageRepositoryBrowseImages from './image-repository-browse-images';
import ImageRepositorySelectedImage, { ImageRepositorySelectedImageRef } from './image-repository-selected-image';
import ImageRepositoryUploadImage from './image-repository-upload-image';
import {
	IMAGE_REPOSITORY_SCREEN_ID,
	ImageRepositoryCroppedImage,
	ImageRepositoryImage,
	ImageRepositorySelectedImage as ImageRepositorySelectedImageModel,
} from './image-repository.types';

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
	[IMAGE_REPOSITORY_SCREEN_ID.UPLOAD_IMAGE]: 'Add Image',
};

const modalBodyClassNameByScreenId: Record<IMAGE_REPOSITORY_SCREEN_ID, string | undefined> = {
	[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: undefined,
	[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: undefined,
	[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: 'p-0',
	[IMAGE_REPOSITORY_SCREEN_ID.UPLOAD_IMAGE]: undefined,
};

interface ImageRepositoryProps extends ModalProps {
	//
}

const ImageRepository: FC<ImageRepositoryProps> = ({ children, dialogClassName, onHide, show, ...modalProps }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const selectedImageCropperRef = useRef<ImageRepositorySelectedImageRef>(null);
	const selectedImageUrlRef = useRef<string>();
	const [activeScreenId, setActiveScreenId] = useState<IMAGE_REPOSITORY_SCREEN_ID>(
		IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES
	);
	const [selectedImage, setSelectedImage] = useState<ImageRepositorySelectedImageModel>();
	const [croppedImage, setCroppedImage] = useState<ImageRepositoryCroppedImage>();
	const [uploadedImage, setUploadedImage] = useState<ImageRepositoryImage>();
	const [isPreparingCrop, setIsPreparingCrop] = useState(false);
	const [isUploadingImage, setIsUploadingImage] = useState(false);

	const revokeSelectedImageUrl = useCallback(() => {
		if (!selectedImageUrlRef.current) {
			return;
		}

		URL.revokeObjectURL(selectedImageUrlRef.current);
		selectedImageUrlRef.current = undefined;
	}, []);

	const resetFlow = useCallback(() => {
		revokeSelectedImageUrl();
		setSelectedImage(undefined);
		setCroppedImage(undefined);
		setUploadedImage(undefined);
		setIsPreparingCrop(false);
		setIsUploadingImage(false);
	}, [revokeSelectedImageUrl]);

	const handleNavigate = useCallback((nextScreenId: IMAGE_REPOSITORY_SCREEN_ID) => {
		setActiveScreenId(nextScreenId);
	}, []);

	const handleReturnToLibrary = useCallback(() => {
		resetFlow();
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
	}, [resetFlow]);

	const handleHide = useCallback(() => {
		resetFlow();
		onHide?.();
	}, [onHide, resetFlow]);

	const handleFileSelected = useCallback(
		(file: File) => {
			const imageUrl = URL.createObjectURL(file);

			revokeSelectedImageUrl();
			selectedImageUrlRef.current = imageUrl;
			setSelectedImage({
				file,
				imageName: file.name,
				imageUrl,
				imageAltText: '',
			});
			setCroppedImage(undefined);
			setUploadedImage(undefined);
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE);
		},
		[revokeSelectedImageUrl]
	);

	const handleImageUploaded = useCallback((image: ImageRepositoryImage) => {
		setUploadedImage(image);
	}, []);

	const handleSelectedImageChange = useCallback((image: ImageRepositorySelectedImageModel) => {
		setSelectedImage(image);
	}, []);

	const handleCropComplete = useCallback(async () => {
		if (!selectedImageCropperRef.current) {
			return;
		}

		try {
			setIsPreparingCrop(true);
			const nextCroppedImage = await selectedImageCropperRef.current.getCroppedImage();

			if (!nextCroppedImage) {
				return;
			}

			setCroppedImage(nextCroppedImage);
			setUploadedImage(undefined);
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.UPLOAD_IMAGE);
		} catch (error) {
			handleError(error);
		} finally {
			setIsPreparingCrop(false);
		}
	}, [handleError]);

	useEffect(() => {
		if (show) {
			resetFlow();
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
		}
	}, [resetFlow, show]);

	useEffect(() => {
		return () => {
			revokeSelectedImageUrl();
		};
	}, [revokeSelectedImageUrl]);

	useEffect(() => {
		if (activeScreenId === IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE && !selectedImage) {
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE);
		}
	}, [activeScreenId, selectedImage]);

	useEffect(() => {
		if (activeScreenId === IMAGE_REPOSITORY_SCREEN_ID.UPLOAD_IMAGE && !croppedImage) {
			setActiveScreenId(
				selectedImage ? IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE : IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE
			);
		}
	}, [activeScreenId, croppedImage, selectedImage]);

	const screenByScreenId = useMemo<Record<IMAGE_REPOSITORY_SCREEN_ID, ReactNode>>(
		() => ({
			[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: (
				<ImageRepositoryBrowseImages onNavigate={handleNavigate} selectedImage={selectedImage} />
			),
			[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: (
				<ImageRepositoryAddImage
					onNavigate={handleNavigate}
					onFileSelected={handleFileSelected}
					selectedImage={selectedImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: (
				<ImageRepositorySelectedImage
					ref={selectedImageCropperRef}
					onNavigate={handleNavigate}
					onSelectedImageChange={handleSelectedImageChange}
					selectedImage={selectedImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.UPLOAD_IMAGE]: (
				<ImageRepositoryUploadImage
					onNavigate={handleNavigate}
					onImageUploaded={handleImageUploaded}
					onUploadStatusChange={setIsUploadingImage}
					selectedImage={selectedImage}
					croppedImage={croppedImage}
				/>
			),
		}),
		[
			croppedImage,
			handleFileSelected,
			handleImageUploaded,
			handleNavigate,
			handleSelectedImageChange,
			selectedImage,
		]
	);

	const footerByScreenId = useMemo<Record<IMAGE_REPOSITORY_SCREEN_ID, ReactNode>>(
		() => ({
			[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: (
				<Button variant="outline-primary" onClick={handleHide}>
					Cancel
				</Button>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: (
				<Button className="d-flex align-items-center" variant="outline-primary" onClick={handleReturnToLibrary}>
					<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
					Library
				</Button>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: (
				<div className="d-flex justify-content-between w-100">
					<Button
						className="d-flex align-items-center"
						variant="outline-primary"
						onClick={handleReturnToLibrary}
					>
						<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
						Library
					</Button>
					<Button variant="primary" onClick={handleCropComplete} disabled={!selectedImage || isPreparingCrop}>
						Add Image
					</Button>
				</div>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.UPLOAD_IMAGE]: (
				<Button
					className="d-flex align-items-center"
					variant="outline-primary"
					onClick={handleReturnToLibrary}
					disabled={isUploadingImage && !uploadedImage}
				>
					<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
					Library
				</Button>
			),
		}),
		[
			handleCropComplete,
			handleHide,
			handleReturnToLibrary,
			isPreparingCrop,
			isUploadingImage,
			selectedImage,
			uploadedImage,
		]
	);

	return (
		<Modal
			{...modalProps}
			show={show}
			onHide={handleHide}
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
