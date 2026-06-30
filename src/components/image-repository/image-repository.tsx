import classNames from 'classnames';
import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import SvgIcon from '@/components/svg-icon';
import useHandleError from '@/hooks/use-handle-error';
import { mediaService } from '@/lib/services/media-service';

import ImageRepositoryAddImage from './image-repository-add-image';
import ImageRepositoryBrowseImages from './image-repository-browse-images';
import ImageRepositoryCropImage, { ImageRepositoryCropImageRef } from './image-repository-crop-image';
import ImageRepositoryDuplicateImage from './image-repository-duplicate-image';
import ImageRepositoryEditImage, { ImageRepositoryEditImageRef } from './image-repository-edit-image';
import ImageRepositorySelectedImage from './image-repository-selected-image';
import {
	IMAGE_REPOSITORY_CROP_RATIO,
	IMAGE_REPOSITORY_SCREEN_ID,
	ImageRepositorySelectedImage as ImageRepositorySelectedImageModel,
} from './image-repository.types';
import { getSha256Hash } from './image-repository.utils';

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
	[IMAGE_REPOSITORY_SCREEN_ID.DUPLICATE_IMAGE]: 'Add Image',
	[IMAGE_REPOSITORY_SCREEN_ID.EDIT_IMAGE]: 'Add Image',
	[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: 'Add Image',
};

const modalBodyClassNameByScreenId: Record<IMAGE_REPOSITORY_SCREEN_ID, string | undefined> = {
	[IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES]: 'p-0',
	[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: undefined,
	[IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE]: 'p-0',
	[IMAGE_REPOSITORY_SCREEN_ID.DUPLICATE_IMAGE]: undefined,
	[IMAGE_REPOSITORY_SCREEN_ID.EDIT_IMAGE]: 'p-0',
	[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: 'p-0',
};

interface ImageRepositoryProps extends ModalProps {
	//
}

const ImageRepository: FC<ImageRepositoryProps> = ({ children, dialogClassName, onHide, show, ...modalProps }) => {
	const classes = useStyles();
	const handleError = useHandleError();
	const cropImageRef = useRef<ImageRepositoryCropImageRef>(null);
	const editImageRef = useRef<ImageRepositoryEditImageRef>(null);
	const selectedImageUrlRef = useRef<string>();
	const duplicateDetectionRunIdRef = useRef(0);
	const [activeScreenId, setActiveScreenId] = useState<IMAGE_REPOSITORY_SCREEN_ID>(
		IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES
	);
	const [repositoryImageId, setRepositoryImageId] = useState<string>();
	const [duplicateRepositoryImageId, setDuplicateRepositoryImageId] = useState<string>();
	const [selectedImage, setSelectedImage] = useState<ImageRepositorySelectedImageModel>();
	const [initialCropRatio, setInitialCropRatio] = useState(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
	const [isDetectingDuplicateImage, setIsDetectingDuplicateImage] = useState(false);
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
		duplicateDetectionRunIdRef.current += 1;
		revokeSelectedImageUrl();
		setDuplicateRepositoryImageId(undefined);
		setRepositoryImageId(undefined);
		setSelectedImage(undefined);
		setInitialCropRatio(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
		setIsDetectingDuplicateImage(false);
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

	const handleReturnToSelectedImage = useCallback(() => {
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE);
	}, []);

	const handleHide = useCallback(() => {
		resetFlow();
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.BROWSE_IMAGES);
		onHide?.();
	}, [onHide, resetFlow]);

	const handleFileSelected = useCallback(
		async (file: File) => {
			const imageUrl = URL.createObjectURL(file);
			const duplicateDetectionRunId = duplicateDetectionRunIdRef.current + 1;

			duplicateDetectionRunIdRef.current = duplicateDetectionRunId;

			revokeSelectedImageUrl();
			selectedImageUrlRef.current = imageUrl;
			setDuplicateRepositoryImageId(undefined);
			setIsDetectingDuplicateImage(true);

			const isCurrentDuplicateDetection = () => duplicateDetectionRunIdRef.current === duplicateDetectionRunId;

			try {
				const imageHash = await getSha256Hash(file);

				if (!isCurrentDuplicateDetection()) {
					URL.revokeObjectURL(imageUrl);
					return;
				}

				setSelectedImage({
					file,
					imageHash,
					imageName: file.name,
					imageUrl,
					imageAltText: '',
				});
				setInitialCropRatio(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);

				const response = await mediaService.detectDuplicate({ imageHash }).fetch();

				if (!isCurrentDuplicateDetection()) {
					return;
				}

				setIsDetectingDuplicateImage(false);

				if (response.duplicate && response.imageIds.length > 0) {
					setDuplicateRepositoryImageId(response.imageIds[0]);
					setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.DUPLICATE_IMAGE);
					return;
				}

				setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE);
			} catch (error) {
				if (!isCurrentDuplicateDetection()) {
					return;
				}

				setIsDetectingDuplicateImage(false);
				handleError(error);
			}
		},
		[handleError, revokeSelectedImageUrl]
	);

	const handleContinueWithDuplicateUpload = useCallback(() => {
		setDuplicateRepositoryImageId(undefined);
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE);
	}, []);

	const handleUseExistingDuplicateImage = useCallback(() => {
		if (!duplicateRepositoryImageId) {
			return;
		}

		revokeSelectedImageUrl();
		setSelectedImage(undefined);
		setRepositoryImageId(duplicateRepositoryImageId);
		setDuplicateRepositoryImageId(undefined);
		setIsSelectedRepositoryImageVariantAvailable(false);
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE);
	}, [duplicateRepositoryImageId, revokeSelectedImageUrl]);

	const handleRepositoryImageSelected = useCallback((nextRepositoryImageId: string) => {
		setRepositoryImageId(nextRepositoryImageId);
		setIsSelectedRepositoryImageVariantAvailable(false);
		setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE);
	}, []);

	const handleRepositoryImageEdit = useCallback(
		(image: ImageRepositorySelectedImageModel, cropRatio: IMAGE_REPOSITORY_CROP_RATIO) => {
			revokeSelectedImageUrl();
			setSelectedImage(image);
			setInitialCropRatio(cropRatio);
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.EDIT_IMAGE);
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

	const handleEditComplete = useCallback(() => {
		if (!editImageRef.current) {
			return;
		}

		editImageRef.current.startUpload();
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
		if (activeScreenId === IMAGE_REPOSITORY_SCREEN_ID.EDIT_IMAGE && !selectedImage) {
			setActiveScreenId(IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE);
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
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.ADD_IMAGE]: (
				<ImageRepositoryAddImage disabled={isDetectingDuplicateImage} onFileSelected={handleFileSelected} />
			),
			[IMAGE_REPOSITORY_SCREEN_ID.DUPLICATE_IMAGE]: (
				<ImageRepositoryDuplicateImage
					onContinueWithUpload={handleContinueWithDuplicateUpload}
					onUseExistingImage={handleUseExistingDuplicateImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.CROP_IMAGE]: (
				<ImageRepositoryCropImage
					ref={cropImageRef}
					onImageUploaded={handleHide}
					onSelectedImageChange={handleSelectedImageChange}
					onUploadStatusChange={setIsUploadingImage}
					initialCropRatio={initialCropRatio}
					selectedImage={selectedImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.EDIT_IMAGE]: (
				<ImageRepositoryEditImage
					ref={editImageRef}
					onImageUploaded={handleHide}
					onSelectedImageChange={handleSelectedImageChange}
					onUploadStatusChange={setIsUploadingImage}
					initialCropRatio={initialCropRatio}
					selectedImage={selectedImage}
				/>
			),
			[IMAGE_REPOSITORY_SCREEN_ID.SELECTED_IMAGE]: (
				<ImageRepositorySelectedImage
					onRepositoryImageEdit={handleRepositoryImageEdit}
					onRepositoryImageVariantAvailabilityChange={setIsSelectedRepositoryImageVariantAvailable}
					repositoryImageId={repositoryImageId}
				/>
			),
		}),
		[
			handleFileSelected,
			handleHide,
			handleContinueWithDuplicateUpload,
			handleNavigate,
			handleRepositoryImageEdit,
			handleRepositoryImageSelected,
			handleSelectedImageChange,
			handleUseExistingDuplicateImage,
			initialCropRatio,
			isDetectingDuplicateImage,
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
			[IMAGE_REPOSITORY_SCREEN_ID.DUPLICATE_IMAGE]: (
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
			[IMAGE_REPOSITORY_SCREEN_ID.EDIT_IMAGE]: (
				<div className="d-flex justify-content-between w-100">
					<Button variant="outline-primary" onClick={handleReturnToSelectedImage} disabled={isUploadingImage}>
						<SvgIcon kit="far" icon="arrow-left" size={16} className="me-2" />
						Back
					</Button>
					<Button
						variant="primary"
						onClick={handleEditComplete}
						disabled={!selectedImage || isUploadingImage}
					>
						Save Image
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
			handleEditComplete,
			handleHide,
			handleReturnToLibrary,
			handleReturnToSelectedImage,
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
