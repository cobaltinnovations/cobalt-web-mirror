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
	IMAGE_REPOSITORY_CROP_RATIO,
	ImageRepositoryCrop,
	ImageRepositoryCropSelection,
	ImageRepositoryCroppedImage,
	ImageRepositoryScreenProps,
	ImageRepositorySelectedImage as ImageRepositorySelectedImageModel,
	ImageRepositoryUploadAsset,
	ImageRepositoryUploadPayload,
	getAcceptableImageRepositoryCropRatios,
	getResolvedImageRepositoryCropRatio,
} from './image-repository.types';
import { getSha256Hash } from './image-repository.utils';
import ImageRepositoryUploader, { IMAGE_REPOSITORY_UPLOAD_STATUS } from './image-repository-uploader';

interface CropRatioConfig {
	aspect: number;
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	thumbnailFileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	ratioDimensions: {
		width: number;
		height: number;
	};
	thumbnailWidth: number;
}

export const cropRatioConfigByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, CropRatioConfig> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: {
		aspect: 16 / 9,
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_16X9,
		thumbnailFileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_16X9,
		ratioDimensions: { width: 16, height: 9 },
		thumbnailWidth: 320,
	},
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: {
		aspect: 4 / 3,
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_4X3,
		thumbnailFileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_4X3,
		ratioDimensions: { width: 4, height: 3 },
		thumbnailWidth: 320,
	},
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: {
		aspect: 1,
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_1X1,
		thumbnailFileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_1X1,
		ratioDimensions: { width: 1, height: 1 },
		thumbnailWidth: 320,
	},
};

const INITIAL_CROP_MAX_SIZE_PERCENT = 70;

export const getInitialCrop = (
	cropRatio: IMAGE_REPOSITORY_CROP_RATIO,
	imageWidth?: number,
	imageHeight?: number
): ReactCrop.Crop => {
	const aspect = cropRatioConfigByCropRatio[cropRatio].aspect;

	if (!imageWidth || !imageHeight) {
		return {
			unit: '%' as '%',
			x: 15,
			y: 15,
			width: INITIAL_CROP_MAX_SIZE_PERCENT,
			aspect,
		};
	}

	const renderedAspect = imageWidth / imageHeight;
	let width = INITIAL_CROP_MAX_SIZE_PERCENT;
	let height = (width * renderedAspect) / aspect;

	if (height > INITIAL_CROP_MAX_SIZE_PERCENT) {
		height = INITIAL_CROP_MAX_SIZE_PERCENT;
		width = (height * aspect) / renderedAspect;
	}

	return {
		unit: '%' as '%',
		x: (100 - width) / 2,
		y: (100 - height) / 2,
		width,
		height,
		aspect,
	};
};

function waitForNextFrame(): Promise<void> {
	return new Promise((resolve) => {
		window.requestAnimationFrame(() => {
			resolve();
		});
	});
}

function loadImage(imageUrl: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.crossOrigin = 'anonymous';

		image.onload = () => {
			resolve(image);
		};

		image.onerror = () => {
			reject(CobaltError.fromValidationFailed('There was an error preparing your image.'));
		};

		image.src = imageUrl;
	});
}

function stripExtension(filename: string): string {
	const lastDotIndex = filename.lastIndexOf('.');

	if (lastDotIndex <= 0) {
		return filename;
	}

	return filename.slice(0, lastDotIndex);
}

function resolvePixelCrop(crop: ImageRepositoryCrop, cropSelection: ImageRepositoryCropSelection): ImageRepositoryCrop {
	const isPercentCrop = crop.unit === '%';
	const x = crop.x ?? 0;
	const y = crop.y ?? 0;
	const width = crop.width ?? 0;
	const height = crop.height ?? (crop.aspect && width ? width / crop.aspect : 0);

	if (!isPercentCrop) {
		return {
			...crop,
			unit: 'px',
			x,
			y,
			width,
			height,
		};
	}

	const pixelWidth = (width / 100) * cropSelection.imageRenderedWidth;
	const pixelHeight = crop.height
		? ((crop.height ?? 0) / 100) * cropSelection.imageRenderedHeight
		: crop.aspect
		? pixelWidth / crop.aspect
		: 0;

	return {
		...crop,
		unit: 'px',
		x: (x / 100) * cropSelection.imageRenderedWidth,
		y: (y / 100) * cropSelection.imageRenderedHeight,
		width: pixelWidth,
		height: pixelHeight,
	};
}

function getCanvasBlob(canvas: HTMLCanvasElement): Promise<{ blob: Blob; extension: string }> {
	return new Promise((resolve, reject) => {
		const ctx = canvas.getContext('2d');
		let hasTransparency = false;

		try {
			if (ctx) {
				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const data = imageData.data;

				for (let i = 3; i < data.length; i += 4) {
					if (data[i] < 255) {
						hasTransparency = true;
						break;
					}
				}
			}
		} catch {
			hasTransparency = false;
		}

		const mimeType = hasTransparency ? 'image/png' : 'image/jpeg';
		const extension = hasTransparency ? 'png' : 'jpg';
		const quality = hasTransparency ? 1.0 : 0.9;

		canvas.toBlob(
			(blob) => {
				if (!blob) {
					return reject(
						CobaltError.fromValidationFailed(
							'Error cropping image, please recrop your image and try again.'
						)
					);
				}

				resolve({ blob, extension });
			},
			mimeType,
			quality
		);
	});
}

function getAspectOutputDimensions(
	sourceWidth: number,
	sourceHeight: number,
	cropRatio: IMAGE_REPOSITORY_CROP_RATIO
): { width: number; height: number } {
	const ratioDimensions = cropRatioConfigByCropRatio[cropRatio].ratioDimensions;
	let width = Math.max(
		ratioDimensions.width,
		Math.floor(sourceWidth / ratioDimensions.width) * ratioDimensions.width
	);
	let height = (width / ratioDimensions.width) * ratioDimensions.height;

	if (height > sourceHeight) {
		height = Math.max(
			ratioDimensions.height,
			Math.floor(sourceHeight / ratioDimensions.height) * ratioDimensions.height
		);
		width = (height / ratioDimensions.height) * ratioDimensions.width;
	}

	return {
		width: Math.round(width),
		height: Math.round(height),
	};
}

async function getCroppedImageAsset(
	image: HTMLImageElement,
	imageName: string,
	cropSelection: ImageRepositoryCropSelection
): Promise<ImageRepositoryCroppedImage | undefined> {
	const cropCanvas = document.createElement('canvas');
	const ctx = cropCanvas.getContext('2d');

	if (!ctx) {
		return;
	}

	const pixelCrop = resolvePixelCrop(cropSelection.crop, cropSelection);
	const cropX = pixelCrop.x ?? 0;
	const cropY = pixelCrop.y ?? 0;
	const cropWidth = pixelCrop.width ?? 0;
	const cropHeight = pixelCrop.height ?? 0;
	const scaleX = cropSelection.imageNaturalWidth / cropSelection.imageRenderedWidth;
	const scaleY = cropSelection.imageNaturalHeight / cropSelection.imageRenderedHeight;
	const sourceWidth = cropWidth * scaleX;
	const sourceHeight = cropHeight * scaleY;
	const outputDimensions = getAspectOutputDimensions(sourceWidth, sourceHeight, cropSelection.cropRatio);
	const cropRatioConfig = cropRatioConfigByCropRatio[cropSelection.cropRatio];

	cropCanvas.width = outputDimensions.width;
	cropCanvas.height = outputDimensions.height;

	ctx.drawImage(
		image,
		cropX * scaleX,
		cropY * scaleY,
		sourceWidth,
		sourceHeight,
		0,
		0,
		outputDimensions.width,
		outputDimensions.height
	);

	const cropBlobResult = await getCanvasBlob(cropCanvas);
	const thumbnailCanvas = document.createElement('canvas');
	const thumbnailCtx = thumbnailCanvas.getContext('2d');

	if (!thumbnailCtx) {
		return;
	}

	const thumbnailWidth = cropRatioConfig.thumbnailWidth;
	const ratioDimensions = cropRatioConfig.ratioDimensions;
	const thumbnailHeight = (thumbnailWidth / ratioDimensions.width) * ratioDimensions.height;

	thumbnailCanvas.width = thumbnailWidth;
	thumbnailCanvas.height = thumbnailHeight;
	thumbnailCtx.drawImage(cropCanvas, 0, 0, thumbnailWidth, thumbnailHeight);

	const thumbnailBlobResult = await getCanvasBlob(thumbnailCanvas);
	const baseImageName = stripExtension(imageName);

	return {
		blob: cropBlobResult.blob,
		imageName: `${baseImageName}.${cropBlobResult.extension}`,
		width: outputDimensions.width,
		height: outputDimensions.height,
		fileUploadTypeId: cropRatioConfig.fileUploadTypeId,
		thumbnail: {
			blob: thumbnailBlobResult.blob,
			imageName: `${baseImageName}.${thumbnailBlobResult.extension}`,
			width: thumbnailCanvas.width,
			height: thumbnailCanvas.height,
			fileUploadTypeId: cropRatioConfig.thumbnailFileUploadTypeId,
		},
	};
}

export async function getImageUploadPayload(
	selectedImage: ImageRepositorySelectedImageModel,
	cropSelection: ImageRepositoryCropSelection,
	loadedImage?: HTMLImageElement
): Promise<ImageRepositoryUploadPayload | undefined> {
	const image = loadedImage ?? (await loadImage(selectedImage.imageUrl));
	const croppedImage = await getCroppedImageAsset(image, selectedImage.imageName, cropSelection);

	if (!croppedImage) {
		return;
	}

	const rawImage = selectedImage.file
		? {
				blob: selectedImage.file,
				imageName: selectedImage.imageName,
				width: cropSelection.imageNaturalWidth,
				height: cropSelection.imageNaturalHeight,
				imageHash: selectedImage.imageHash ?? (await getSha256Hash(selectedImage.file)),
		  }
		: undefined;

	return {
		rawImage,
		sourceImageId: selectedImage.sourceImageId,
		croppedImage,
		imageAltText: selectedImage.imageAltText,
	};
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
		alignItems: 'stretch',
		justifyContent: 'center',
		overflow: 'hidden',
		backgroundColor: theme.colors.n900,
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
			objectFit: 'cover',
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
		const uploadRunIdRef = useRef(0);
		const activeUploadXhrRef = useRef<XMLHttpRequest>();
		const acceptableCropRatios = useMemo(
			() => getAcceptableImageRepositoryCropRatios(acceptableCropSizes),
			[acceptableCropSizes]
		);
		const resolvedInitialCropRatio = useMemo(
			() => getResolvedImageRepositoryCropRatio(initialCropRatio, acceptableCropSizes),
			[acceptableCropSizes, initialCropRatio]
		);
		const [cropRatio, setCropRatio] = useState(resolvedInitialCropRatio);
		const [crop, setCrop] = useState<ReactCrop.Crop>(getInitialCrop(resolvedInitialCropRatio));
		const [progress, setProgress] = useState(0);
		const [uploadStatus, setUploadStatus] = useState<IMAGE_REPOSITORY_UPLOAD_STATUS>(
			IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING
		);
		const [isUploading, setIsUploading] = useState(false);

		useEffect(() => {
			setCropRatio(resolvedInitialCropRatio);
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
				setCrop(getInitialCrop(cropRatio, image.width, image.height));
				return false;
			},
			[cropRatio]
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
									setCrop(getInitialCrop(ratio, imageRef.current?.width, imageRef.current?.height));
								}}
							/>
						))}
					</div>
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
