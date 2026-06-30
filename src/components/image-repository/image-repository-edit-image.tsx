import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import ReactCrop from 'react-image-crop';

import InputHelper from '@/components/input-helper';
import InlineAlert from '@/components/inline-alert';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { CobaltError } from '@/lib/http-client';

import 'react-image-crop/dist/ReactCrop.css';
import {
	IMAGE_REPOSITORY_CROP_RATIO,
	ImageRepositoryCropSelection,
	ImageRepositoryScreenProps,
	ImageRepositorySelectedImage as ImageRepositorySelectedImageModel,
} from './image-repository.types';
import { getImageUploadPayload, getInitialCrop, uploadImageRepositoryPayload } from './image-repository-crop-image';
import ImageRepositoryUploader, { IMAGE_REPOSITORY_UPLOAD_STATUS } from './image-repository-uploader';

export interface ImageRepositoryEditImageRef {
	startUpload(): void;
}

type ImageRepositoryEditImageProps = Pick<
	ImageRepositoryScreenProps,
	'initialCropRatio' | 'selectedImage' | 'onImageUploaded' | 'onSelectedImageChange' | 'onUploadStatusChange'
>;

const useStyles = createUseThemedStyles((theme) => ({
	editImageScreen: {
		position: 'relative',
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr) 320px',
		height: 575,
	},
	cropperPanel: {
		minWidth: 0,
		display: 'flex',
		alignItems: 'stretch',
		justifyContent: 'center',
		borderRight: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.n900,
	},
	cropperStage: {
		width: '100%',
		height: '100%',
		display: 'flex',
		alignItems: 'stretch',
		justifyContent: 'center',
		overflow: 'hidden',
		'& .ReactCrop': {
			width: '100%',
			height: '100%',
			display: 'block',
			backgroundColor: theme.colors.n900,
		},
		'& .ReactCrop > div': {
			width: '100%',
			height: '100%',
		},
		'& .ReactCrop__image': {
			width: '100%',
			height: '100%',
			maxWidth: 'none',
			maxHeight: 'none',
			display: 'block',
			objectFit: 'cover',
		},
		'& .ReactCrop__crop-selection': {
			border: `1px dashed ${theme.colors.n0}`,
		},
	},
	metadataPanel: {
		display: 'flex',
		flexDirection: 'column',
		padding: 24,
		backgroundColor: theme.colors.n0,
		overflowY: 'auto',
	},
	uploadOverlay: {
		position: 'absolute',
		inset: 0,
		zIndex: 2,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		pointerEvents: 'auto',
		'&::before': {
			content: '""',
			position: 'absolute',
			inset: 0,
			backgroundColor: theme.colors.n0,
			opacity: 0.82,
		},
	},
	uploadOverlayContent: {
		position: 'relative',
		zIndex: 1,
	},
}));

const ImageRepositoryEditImage = forwardRef<ImageRepositoryEditImageRef, ImageRepositoryEditImageProps>(
	({ initialCropRatio, selectedImage, onImageUploaded, onSelectedImageChange, onUploadStatusChange }, ref) => {
		const classes = useStyles();
		const handleError = useHandleError();
		const imageRef = useRef<HTMLImageElement>();
		const uploadRunIdRef = useRef(0);
		const activeUploadXhrRef = useRef<XMLHttpRequest>();
		const resolvedInitialCropRatio = useMemo(
			() => initialCropRatio ?? IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE,
			[initialCropRatio]
		);
		const [crop, setCrop] = useState<ReactCrop.Crop>(getInitialCrop(resolvedInitialCropRatio));
		const [progress, setProgress] = useState(0);
		const [uploadStatus, setUploadStatus] = useState<IMAGE_REPOSITORY_UPLOAD_STATUS>(
			IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING
		);
		const [isUploading, setIsUploading] = useState(false);

		useEffect(() => {
			setCrop(getInitialCrop(resolvedInitialCropRatio));
			setProgress(0);
			setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING);
			setIsUploading(false);
		}, [resolvedInitialCropRatio, selectedImage?.imageUrl]);

		useEffect(() => {
			return () => {
				uploadRunIdRef.current += 1;
				activeUploadXhrRef.current?.abort();
				onUploadStatusChange?.(false);
			};
		}, [onUploadStatusChange]);

		const handleImageLoaded = useCallback(
			(image: HTMLImageElement) => {
				imageRef.current = image;
				setCrop(getInitialCrop(resolvedInitialCropRatio, image.width, image.height));
				return false;
			},
			[resolvedInitialCropRatio]
		);

		const getCropSelection = useCallback((): ImageRepositoryCropSelection | undefined => {
			if (!selectedImage || !imageRef.current) {
				return;
			}

			return {
				crop: { ...crop },
				cropRatio: resolvedInitialCropRatio,
				imageRenderedWidth: imageRef.current.width,
				imageRenderedHeight: imageRef.current.height,
				imageNaturalWidth: imageRef.current.naturalWidth,
				imageNaturalHeight: imageRef.current.naturalHeight,
			};
		}, [crop, resolvedInitialCropRatio, selectedImage]);

		const handleCancelUpload = useCallback(() => {
			uploadRunIdRef.current += 1;
			activeUploadXhrRef.current?.abort();
			activeUploadXhrRef.current = undefined;
			setIsUploading(false);
			setProgress(0);
			setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING);
			onUploadStatusChange?.(false);
		}, [onUploadStatusChange]);

		const handleSelectedImageChange = useCallback(
			(nextSelectedImage: ImageRepositorySelectedImageModel) => {
				onSelectedImageChange?.(nextSelectedImage);
			},
			[onSelectedImageChange]
		);

		const startUpload = useCallback(async () => {
			if (isUploading || !selectedImage) {
				return;
			}

			console.log('startUpload 1isUploading', isUploading);
			console.log('startUpload selectedImage', selectedImage);

			const cropSelection = getCropSelection();

			console.log('startUpload cropSelection', cropSelection);

			if (!cropSelection) {
				return;
			}

			const uploadRunId = uploadRunIdRef.current + 1;
			uploadRunIdRef.current = uploadRunId;
			activeUploadXhrRef.current = undefined;

			console.log('startUpload 444444');

			const isCurrentUpload = () => uploadRunIdRef.current === uploadRunId;
			const handleXhrCreated = (xhr: XMLHttpRequest) => {
				if (isCurrentUpload()) {
					activeUploadXhrRef.current = xhr;
				}
			};

			console.log('startUpload 33333');

			try {
				setProgress(0);
				setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING);
				setIsUploading(true);
				onUploadStatusChange?.(true);
				await new Promise<void>((resolve) => {
					window.requestAnimationFrame(() => {
						resolve();
					});
				});

				console.log('startUpload 22222');

				const imageUploadPayload = await getImageUploadPayload(selectedImage, cropSelection, imageRef.current);

				console.log('startUpload imageUploadPayload', imageUploadPayload);

				if (!isCurrentUpload()) {
					return;
				}

				if (!imageUploadPayload || !imageUploadPayload.sourceImageId) {
					throw CobaltError.fromValidationFailed('There was an error preparing your image.');
				}

				setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.UPLOADING);
				await uploadImageRepositoryPayload({
					imageUploadPayload,
					isCurrentUpload,
					onProgress: setProgress,
					onXhrCreated: handleXhrCreated,
				});

				if (isCurrentUpload()) {
					activeUploadXhrRef.current = undefined;
					setProgress(100);
					setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.COMPLETE);
					setIsUploading(false);
					onUploadStatusChange?.(false);
					onImageUploaded?.();
				}
			} catch (error) {
				console.log('error', error);

				if (!isCurrentUpload()) {
					return;
				}

				activeUploadXhrRef.current = undefined;
				setProgress(0);
				setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.ERROR);
				setIsUploading(false);
				onUploadStatusChange?.(false);
				handleError(error);
			}
		}, [getCropSelection, handleError, isUploading, onImageUploaded, onUploadStatusChange, selectedImage]);

		useImperativeHandle(
			ref,
			() => ({
				startUpload,
			}),
			[startUpload]
		);

		if (!selectedImage) {
			return null;
		}

		return (
			<div className={classes.editImageScreen}>
				<div className={classes.cropperPanel}>
					<div className={classes.cropperStage}>
						<ReactCrop
							key={selectedImage.imageUrl}
							src={selectedImage.imageUrl}
							crossorigin="anonymous"
							imageAlt={selectedImage.imageAltText}
							crop={crop}
							disabled={isUploading}
							onImageLoaded={handleImageLoaded}
							onChange={(_, percentCrop) => {
								setCrop(percentCrop);
							}}
						/>
					</div>
				</div>
				<div className={classes.metadataPanel}>
					<p className="mb-4 fs-large fw-semibold">{resolvedInitialCropRatio} Image Metadata</p>
					{selectedImage.isCreatingMissingVariant && (
						<InlineAlert
							className="mb-4"
							variant="warning"
							title={`${resolvedInitialCropRatio} does not exist`}
							description="Crop and update information to create this asset."
						/>
					)}
					{selectedImage.createdDescription && (
						<p className="mb-4 text-muted">Created {selectedImage.createdDescription}</p>
					)}
					<InputHelper
						className="mb-4"
						required
						label="Name"
						value={selectedImage.imageName}
						disabled={isUploading}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							handleSelectedImageChange({
								...selectedImage,
								imageName: event.target.value,
							});
						}}
					/>
					<InputHelper
						className="mb-4"
						as="textarea"
						label="Image alt text"
						placeholder="Describe the image for screen readers"
						value={selectedImage.imageAltText}
						disabled={isUploading}
						onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
							handleSelectedImageChange({
								...selectedImage,
								imageAltText: event.target.value,
							});
						}}
					/>
					<h3 className="mb-4 fs-default fw-semibold">Where is this image used?</h3>
					<p className="mb-0 text-muted">Usage data is not available yet.</p>
				</div>
				{isUploading && (
					<div className={classes.uploadOverlay}>
						<ImageRepositoryUploader
							className={classes.uploadOverlayContent}
							progress={progress}
							uploadStatus={uploadStatus}
							onCancelUpload={handleCancelUpload}
						/>
					</div>
				)}
			</div>
		);
	}
);

ImageRepositoryEditImage.displayName = 'ImageRepositoryEditImage';

export default ImageRepositoryEditImage;
