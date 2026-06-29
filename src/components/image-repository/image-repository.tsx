import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import SvgIcon from '@/components/svg-icon';

import ImageRepositoryAddImage from './image-repository-add-image';
import ImageRepositoryBrowseImages from './image-repository-browse-images';
import ImageRepositoryCropImage, { ImageRepositoryCropImageRef } from './image-repository-crop-image';
import ImageRepositorySelectedImage from './image-repository-selected-image';
import {
	IMAGE_REPOSITORY_CROP_RATIO,
	IMAGE_REPOSITORY_SCREEN_ID,
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
	[IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE]: 'Add Image',
	[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: 'Add Image',
};

const modalBodyClassNameByScreenId: Record<IMAGE_REPOSITORY_SCREEN_ID, string | undefined> = {
	[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: undefined,
	[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: undefined,
	[IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE]: 'p-0',
	[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: 'p-0',
};

interface ImageRepositoryProps extends ModalProps {
	//
}

const ImageRepository: FC<ImageRepositoryProps> = ({ children, dialogClassName, onHide, show, ...modalProps }) => {
	const classes = useStyles();
	const cropImageRef = useRef<ImageRepositoryCropImageRef>(null);
	const selectedImageUrlRef = useRef<string>();
	const [activeScreenId, setActiveScreenId] = useState<IMAGE_REPOSITORY_SCREEN_ID>(
		IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES
	);
	const [repositoryImageId, setRepositoryImageId] = useState<string>();
	const [selectedImage, setSelectedImage] = useState<ImageRepositorySelectedImageModel>();
	const [initialCropRatio, setInitialCropRatio] = useState(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
	const [isUploadingImage, setIsUploadingImage] = useState(false);
	const [isSelectedRepositoryImageVariantAvailable, setIsSelectedRepositoryImageVariantAvailable] = useState(false);

	const revokeSelectedImageUrl = useCallback(() => {
		if (!selectedImageUrlRef.current) {
			return;
		}

		URL.revokeObjectURL(selectedImageUrlRef.current);
		selectedImageUrlRef.current = undefined;
	}, []);

	const resetFlow = useCallback(() => {
		revokeSelectedImageUrl();
		setRepositoryImageId(undefined);
		setSelectedImage(undefined);
		setInitialCropRatio(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
		setIsUploadingImage(false);
		setIsSelectedRepositoryImageVariantAvailable(false);
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
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
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
			setInitialCropRatio(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE);
		},
		[revokeSelectedImageUrl]
	);

	const handleImageUploaded = useCallback(() => {
		handleHide();
	}, [handleHide]);

	const handleRepositoryImageSelected = useCallback((nextRepositoryImageId: string) => {
		setRepositoryImageId(nextRepositoryImageId);
		setIsSelectedRepositoryImageVariantAvailable(false);
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE);
	}, []);

	const handleRepositoryImageRecrop = useCallback(
		(image: ImageRepositorySelectedImageModel, cropRatio: IMAGE_REPOSITORY_CROP_RATIO) => {
			revokeSelectedImageUrl();
			setSelectedImage(image);
			setInitialCropRatio(cropRatio);
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE);
		},
		[revokeSelectedImageUrl]
	);

	const handleSelectedImageChange = useCallback((image: ImageRepositorySelectedImageModel) => {
		setSelectedImage(image);
	}, []);

	const handleCropComplete = useCallback(() => {
		if (!cropImageRef.current) {
			return;
		}

		cropImageRef.current.startUpload();
	}, []);

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
		if (activeScreenId === IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE && !selectedImage) {
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE);
		}
	}, [activeScreenId, selectedImage]);

	useEffect(() => {
		if (activeScreenId === IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE && !repositoryImageId) {
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
		}
	}, [activeScreenId, repositoryImageId]);

	const screenByScreenId = useMemo<Record<IMAGE_REPOSITORY_SCREEN_ID, ReactNode>>(
		() => ({
			[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: (
				<ImageRepositoryBrowseImages
					onNavigate={handleNavigate}
					onRepositoryImageSelected={handleRepositoryImageSelected}
					selectedImage={selectedImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: (
				<ImageRepositoryAddImage
					onNavigate={handleNavigate}
					onFileSelected={handleFileSelected}
					selectedImage={selectedImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE]: (
				<ImageRepositoryCropImage
					ref={cropImageRef}
					onNavigate={handleNavigate}
					onImageUploaded={handleImageUploaded}
					onSelectedImageChange={handleSelectedImageChange}
					onUploadStatusChange={setIsUploadingImage}
					initialCropRatio={initialCropRatio}
					selectedImage={selectedImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: (
				<ImageRepositorySelectedImage
					onNavigate={handleNavigate}
					onRepositoryImageRecrop={handleRepositoryImageRecrop}
					onRepositoryImageVariantAvailabilityChange={setIsSelectedRepositoryImageVariantAvailable}
					repositoryImageId={repositoryImageId}
					selectedImage={selectedImage}
				/>
			),
		}),
		[
			handleFileSelected,
			handleImageUploaded,
			handleNavigate,
			handleRepositoryImageRecrop,
			handleRepositoryImageSelected,
			handleSelectedImageChange,
			initialCropRatio,
			repositoryImageId,
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
				<Button variant="outline-primary" onClick={handleReturnToLibrary}>
					<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
					Library
				</Button>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE]: (
				<div className="d-flex justify-content-between w-100">
					<Button variant="outline-primary" onClick={handleReturnToLibrary} disabled={isUploadingImage}>
						<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
						Library
					</Button>
					<Button
						variant="primary"
						onClick={handleCropComplete}
						disabled={!selectedImage || isUploadingImage}
					>
						Add Image
					</Button>
				</div>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: (
				<div className="d-flex justify-content-between w-100">
					<Button variant="outline-primary" onClick={handleReturnToLibrary}>
						<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
						Library
					</Button>
					<Button
						variant="primary"
						onClick={handleHide}
						disabled={!isSelectedRepositoryImageVariantAvailable}
					>
						Add Image
					</Button>
				</div>
			),
		}),
		[
			handleCropComplete,
			handleHide,
			handleReturnToLibrary,
			isSelectedRepositoryImageVariantAvailable,
			isUploadingImage,
			selectedImage,
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
