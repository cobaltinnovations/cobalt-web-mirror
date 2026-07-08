import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { CobaltError } from '@/lib/http-client';
import { FILE_UPLOAD_TYPE_ID, type ImageModel, type PresignedUploadModel } from '@/lib/models';
import { mediaService } from '@/lib/services/media-service';

import 'react-image-crop/dist/ReactCrop.css';
import {
	ImageRepositoryCropSelection,
	ImageRepositoryScreenProps,
	ImageRepositoryUploadAsset,
	ImageRepositoryUploadPayload,
} from './image-repository.types';
import { getAcceptableImageRepositoryCropRatios, getResolvedImageRepositoryCropRatio } from './image-repository-ratios';
import { getContainedImageSize, getImageUploadPayload, getInitialCrop } from './image-repository.utils';
import ImageRepositoryUploader, { IMAGE_REPOSITORY_UPLOAD_STATUS } from './image-repository-uploader';

function waitForNextFrame(): Promise<void> {
	return new Promise((resolve) => {
		window.requestAnimationFrame(() => {
			resolve();
		});
	});
}

function uploadBlobToPresignedUrl(
	blob: Blob,
	presignedUpload: PresignedUploadModel,
	onProgress: (percentage: number) => void,
	onXhrCreated: (xhr: XMLHttpRequest) => void
): Promise<string> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		onXhrCreated(xhr);

		xhr.upload.addEventListener('progress', (event) => {
			if (event.lengthComputable) {
				onProgress(Math.round((event.loaded * 100) / event.total));
			}
		});

		xhr.addEventListener('load', () => {
			resolve(presignedUpload.accessUrl);
		});

		xhr.addEventListener('error', () => {
			reject(CobaltError.fromValidationFailed('There was an error uploading your image.'));
		});

		xhr.addEventListener('abort', () => {
			reject(CobaltError.fromCancelledRequest());
		});

		xhr.open(presignedUpload.httpMethod, presignedUpload.url, true);

		for (const httpHeaderName in presignedUpload.httpHeaders) {
			xhr.setRequestHeader(httpHeaderName, presignedUpload.httpHeaders[httpHeaderName]);
		}

		xhr.send(blob);
	});
}

interface UploadMediaImageAssetOptions {
	asset: ImageRepositoryUploadAsset;
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	sourceImageId?: string;
	imageAltText?: string;
	imageHash?: string;
	onProgress(percentage: number): void;
	onXhrCreated(xhr: XMLHttpRequest): void;
}

export async function uploadMediaImageAsset({
	asset,
	fileUploadTypeId,
	sourceImageId,
	imageAltText,
	imageHash,
	onProgress,
	onXhrCreated,
}: UploadMediaImageAssetOptions): Promise<ImageModel> {
	const { mediaImageUploadResult } = await mediaService
		.getPresignedUpload({
			fileUploadTypeId,
			filename: asset.imageName,
			contentType: asset.blob.type,
			filesize: asset.blob.size,
			width: asset.width,
			height: asset.height,
			sourceImageId,
			imageAltText,
			...(fileUploadTypeId === FILE_UPLOAD_TYPE_ID.IMAGE_RAW && imageHash ? { imageHash } : {}),
		})
		.fetch();

	await uploadBlobToPresignedUrl(
		asset.blob,
		mediaImageUploadResult.fileUploadResult.presignedUpload,
		onProgress,
		onXhrCreated
	);

	const { image } = await mediaService.setImageAsUploaded(mediaImageUploadResult.imageId).fetch();

	return image;
}

interface UploadImageRepositoryPayloadOptions {
	imageUploadPayload: ImageRepositoryUploadPayload;
	isCurrentUpload(): boolean;
	onProgress(percentage: number): void;
	onXhrCreated(xhr: XMLHttpRequest): void;
}

export async function uploadImageRepositoryPayload({
	imageUploadPayload,
	isCurrentUpload,
	onProgress,
	onXhrCreated,
}: UploadImageRepositoryPayloadOptions): Promise<ImageModel | undefined> {
	const uploadStepsCount = imageUploadPayload.rawImage ? 3 : 2;
	let uploadStepIndex = 0;
	let sourceImageId = imageUploadPayload.sourceImageId;

	const setStepProgress = (stepIndex: number, stepProgress: number) => {
		if (!isCurrentUpload()) {
			return;
		}

		onProgress(Math.round(((stepIndex + stepProgress / 100) / uploadStepsCount) * 100));
	};

	if (imageUploadPayload.rawImage) {
		const rawImage = await uploadMediaImageAsset({
			asset: imageUploadPayload.rawImage,
			fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_RAW,
			imageAltText: imageUploadPayload.imageAltText,
			imageHash: imageUploadPayload.rawImage.imageHash,
			onProgress: (percentage) => {
				setStepProgress(uploadStepIndex, percentage);
			},
			onXhrCreated,
		});

		if (!isCurrentUpload()) {
			return;
		}

		sourceImageId = rawImage.imageId;
		uploadStepIndex += 1;
	}

	if (!sourceImageId) {
		throw CobaltError.fromValidationFailed('There was an error preparing your image.');
	}

	const croppedImage = await uploadMediaImageAsset({
		asset: imageUploadPayload.croppedImage,
		fileUploadTypeId: imageUploadPayload.croppedImage.fileUploadTypeId,
		sourceImageId,
		imageAltText: imageUploadPayload.imageAltText,
		onProgress: (percentage) => {
			setStepProgress(uploadStepIndex, percentage);
		},
		onXhrCreated,
	});

	if (!isCurrentUpload()) {
		return;
	}

	uploadStepIndex += 1;

	await uploadMediaImageAsset({
		asset: imageUploadPayload.croppedImage.thumbnail,
		fileUploadTypeId: imageUploadPayload.croppedImage.thumbnail.fileUploadTypeId,
		sourceImageId: croppedImage.imageId,
		imageAltText: imageUploadPayload.imageAltText,
		onProgress: (percentage) => {
			setStepProgress(uploadStepIndex, percentage);
		},
		onXhrCreated,
	});

	return croppedImage;
}

export interface ImageRepositoryCropImageRef {
	startUpload(): void;
}

type ImageRepositoryCropImageProps = Pick<
	ImageRepositoryScreenProps,
	| 'acceptableCropSizes'
	| 'initialCropRatio'
	| 'selectedImage'
	| 'onImageUploaded'
	| 'onSelectedImageChange'
	| 'onUploadStatusChange'
>;

const useStyles = createUseThemedStyles((theme) => ({
	selectedImageScreen: {
		position: 'relative',
		display: 'grid',
		gridTemplateColumns: 'minmax(0, 1fr) 296px',
		minHeight: 575,
	},
	cropperColumn: {
		minWidth: 0,
		display: 'flex',
		flexDirection: 'column',
		borderRight: `1px solid ${theme.colors.border}`,
	},
	cropperStage: {
		flex: 1,
		minHeight: 520,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		backgroundColor: theme.colors.n900,
		'& .ReactCrop': {
			maxWidth: '100%',
			maxHeight: '100%',
			flex: '0 1 auto',
			backgroundColor: theme.colors.n900,
		},
		'& .ReactCrop > div': {
			width: '100%',
			height: '100%',
		},
		'& .ReactCrop__image': {
			width: '100%',
			height: '100%',
			maxWidth: '100%',
			maxHeight: '100%',
			objectFit: 'contain',
		},
		'& .ReactCrop__crop-selection': {
			border: `1px dashed ${theme.colors.n0}`,
		},
	},
	ratioControls: {
		minHeight: 54,
		display: 'flex',
		alignItems: 'center',
		gap: 18,
		padding: '12px 16px',
		borderTop: `1px solid ${theme.colors.border}`,
		backgroundColor: theme.colors.n0,
	},
	metadataPanel: {
		padding: 24,
		backgroundColor: theme.colors.n0,
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

const ImageRepositoryCropImage = forwardRef<ImageRepositoryCropImageRef, ImageRepositoryCropImageProps>(
	(
		{
			acceptableCropSizes,
			initialCropRatio,
			selectedImage,
			onImageUploaded,
			onSelectedImageChange,
			onUploadStatusChange,
		},
		ref
	) => {
		const classes = useStyles();
		const handleError = useHandleError();
		const imageRef = useRef<HTMLImageElement>();
		const cropperStageRef = useRef<HTMLDivElement>(null);
		const uploadRunIdRef = useRef(0);
		const activeUploadXhrRef = useRef<XMLHttpRequest>();
		const acceptableCropRatios = useMemo(
			() => getAcceptableImageRepositoryCropRatios(acceptableCropSizes),
			[acceptableCropSizes]
		);
		const hasMultipleSelectableCropRatios = acceptableCropRatios.length > 1;
		const resolvedInitialCropRatio = useMemo(
			() => getResolvedImageRepositoryCropRatio(initialCropRatio, acceptableCropSizes),
			[acceptableCropSizes, initialCropRatio]
		);
		const [cropRatio, setCropRatio] = useState(resolvedInitialCropRatio);
		const [crop, setCrop] = useState<ReactCrop.Crop>(getInitialCrop(resolvedInitialCropRatio));
		const [cropperImageSize, setCropperImageSize] = useState<React.CSSProperties>();
		const [progress, setProgress] = useState(0);
		const [uploadStatus, setUploadStatus] = useState<IMAGE_REPOSITORY_UPLOAD_STATUS>(
			IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING
		);
		const [isUploading, setIsUploading] = useState(false);

		useEffect(() => {
			setCropRatio(resolvedInitialCropRatio);
			setCrop(getInitialCrop(resolvedInitialCropRatio));
			setCropperImageSize(undefined);
			setProgress(0);
			setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING);
			setIsUploading(false);
		}, [resolvedInitialCropRatio, selectedImage?.imageUrl]);

		const updateCropperImageSize = useCallback((image?: HTMLImageElement) => {
			const currentImage = image ?? imageRef.current;
			const cropperStage = cropperStageRef.current;

			if (!currentImage || !cropperStage) {
				return;
			}

			const nextCropperImageSize = getContainedImageSize({
				imageWidth: currentImage.naturalWidth,
				imageHeight: currentImage.naturalHeight,
				containerWidth: cropperStage.clientWidth,
				containerHeight: cropperStage.clientHeight,
			});

			setCropperImageSize(nextCropperImageSize);

			return nextCropperImageSize;
		}, []);

		useEffect(() => {
			const cropperStage = cropperStageRef.current;

			if (!cropperStage) {
				return;
			}

			const handleResize = () => {
				updateCropperImageSize();
			};

			if (typeof ResizeObserver === 'undefined') {
				window.addEventListener('resize', handleResize);

				return () => {
					window.removeEventListener('resize', handleResize);
				};
			}

			const resizeObserver = new ResizeObserver(handleResize);
			resizeObserver.observe(cropperStage);

			return () => {
				resizeObserver.disconnect();
			};
		}, [updateCropperImageSize]);

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
				const nextCropperImageSize = updateCropperImageSize(image);
				setCrop(
					getInitialCrop(
						cropRatio,
						nextCropperImageSize?.width ?? image.width,
						nextCropperImageSize?.height ?? image.height
					)
				);
				return false;
			},
			[cropRatio, updateCropperImageSize]
		);

		const getCropSelection = useCallback((): ImageRepositoryCropSelection | undefined => {
			if (!selectedImage || !imageRef.current) {
				return;
			}

			return {
				crop: { ...crop },
				cropRatio,
				imageRenderedWidth: imageRef.current.width,
				imageRenderedHeight: imageRef.current.height,
				imageNaturalWidth: imageRef.current.naturalWidth,
				imageNaturalHeight: imageRef.current.naturalHeight,
			};
		}, [crop, cropRatio, selectedImage]);

		const handleCancelUpload = useCallback(() => {
			uploadRunIdRef.current += 1;
			activeUploadXhrRef.current?.abort();
			activeUploadXhrRef.current = undefined;
			setIsUploading(false);
			setProgress(0);
			setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING);
			onUploadStatusChange?.(false);
		}, [onUploadStatusChange]);

		const startUpload = useCallback(async () => {
			if (isUploading || !selectedImage) {
				return;
			}

			const cropSelection = getCropSelection();

			if (!cropSelection) {
				return;
			}

			const uploadRunId = uploadRunIdRef.current + 1;
			uploadRunIdRef.current = uploadRunId;
			activeUploadXhrRef.current = undefined;

			const isCurrentUpload = () => uploadRunIdRef.current === uploadRunId;
			const handleXhrCreated = (xhr: XMLHttpRequest) => {
				if (isCurrentUpload()) {
					activeUploadXhrRef.current = xhr;
				}
			};

			try {
				setProgress(0);
				setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING);
				setIsUploading(true);
				onUploadStatusChange?.(true);
				await waitForNextFrame();
				await waitForNextFrame();

				const imageUploadPayload = await getImageUploadPayload(selectedImage, cropSelection, imageRef.current);

				if (!isCurrentUpload()) {
					return;
				}

				if (!imageUploadPayload) {
					throw CobaltError.fromValidationFailed('There was an error preparing your image.');
				}

				setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.UPLOADING);
				const uploadedImage = await uploadImageRepositoryPayload({
					imageUploadPayload,
					isCurrentUpload,
					onProgress: setProgress,
					onXhrCreated: handleXhrCreated,
				});

				if (isCurrentUpload()) {
					if (!uploadedImage) {
						return;
					}

					activeUploadXhrRef.current = undefined;
					setProgress(100);
					setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.COMPLETE);
					setIsUploading(false);
					onUploadStatusChange?.(false);
					onImageUploaded?.(uploadedImage);
				}
			} catch (error) {
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
			<div className={classes.selectedImageScreen}>
				<div className={classes.cropperColumn}>
					<div ref={cropperStageRef} className={classes.cropperStage}>
						<ReactCrop
							key={selectedImage.imageUrl}
							src={selectedImage.imageUrl}
							crossorigin="anonymous"
							imageAlt={selectedImage.imageAltText}
							style={cropperImageSize}
							imageStyle={cropperImageSize}
							crop={crop}
							disabled={isUploading}
							onImageLoaded={handleImageLoaded}
							onChange={(_, percentCrop) => {
								setCrop(percentCrop);
							}}
						/>
					</div>
					{hasMultipleSelectableCropRatios && (
						<div className={classes.ratioControls}>
							<p className="mb-0 text-muted fw-bold text-uppercase">Ratio:</p>
							{acceptableCropRatios.map((ratio) => (
								<Form.Check
									key={ratio}
									inline
									className="mb-0"
									type="radio"
									name="image-repository-crop-ratio"
									id={`image-repository-crop-ratio-${ratio}`}
									label={<span className="fs-large fw-semibold">{ratio}</span>}
									checked={cropRatio === ratio}
									disabled={isUploading}
									onChange={() => {
										setCropRatio(ratio);
										setCrop(
											getInitialCrop(ratio, imageRef.current?.width, imageRef.current?.height)
										);
									}}
								/>
							))}
						</div>
					)}
				</div>
				<div className={classes.metadataPanel}>
					<h3 className="mb-4 fs-default fw-semibold">Image Metadata</h3>
					<InputHelper
						className="mb-4"
						required
						label="Image Name"
						value={selectedImage.imageName}
						disabled={isUploading}
						onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
							onSelectedImageChange?.({
								...selectedImage,
								imageName: event.target.value,
							});
						}}
					/>
					<InputHelper
						as="textarea"
						label="Image alt text"
						placeholder="Describe the image for screen readers"
						value={selectedImage.imageAltText}
						disabled={isUploading}
						onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
							onSelectedImageChange?.({
								...selectedImage,
								imageAltText: event.target.value,
							});
						}}
					/>
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

ImageRepositoryCropImage.displayName = 'ImageRepositoryCropImage';

export default ImageRepositoryCropImage;
