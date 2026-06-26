import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { createUseThemedStyles } from '@/jss/theme';
import { PresignedUploadModel } from '@/lib/models';
import { FILE_UPLOAD_TYPE_ID, ImageModel, mediaService } from '@/lib/services/media-service';

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
} from './image-repository.types';
import ImageRepositoryUploader, { IMAGE_REPOSITORY_UPLOAD_STATUS } from './image-repository-uploader';

const uploadStepsCount = 3;

const aspectByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, number> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: 16 / 9,
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: 4 / 3,
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: 1,
};

const fileUploadTypeIdByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, FILE_UPLOAD_TYPE_ID> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: FILE_UPLOAD_TYPE_ID.IMAGE_16X9,
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: FILE_UPLOAD_TYPE_ID.IMAGE_4X3,
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: FILE_UPLOAD_TYPE_ID.IMAGE_1X1,
};

const thumbnailFileUploadTypeIdByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, FILE_UPLOAD_TYPE_ID> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_16X9,
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_4X3,
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: FILE_UPLOAD_TYPE_ID.IMAGE_THUMBNAIL_1X1,
};

const ratioDimensionsByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, { width: number; height: number }> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: { width: 16, height: 9 },
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: { width: 4, height: 3 },
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: { width: 1, height: 1 },
};

const thumbnailWidthByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, number> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: 320,
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: 320,
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: 320,
};

const fileNameSuffixByCropRatio: Record<IMAGE_REPOSITORY_CROP_RATIO, string> = {
	[IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE]: '16x9',
	[IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE]: '4x3',
	[IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE]: '1x1',
};

const getInitialCrop = (cropRatio: IMAGE_REPOSITORY_CROP_RATIO): ReactCrop.Crop => {
	return {
		unit: '%' as '%',
		x: 15,
		y: 15,
		width: 70,
		aspect: aspectByCropRatio[cropRatio],
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

		image.onload = () => {
			resolve(image);
		};

		image.onerror = () => {
			reject({
				code: 'IMAGE_LOAD_ERROR',
				message: 'There was an error preparing your image.',
			});
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
		} catch (err) {
			hasTransparency = false;
		}

		const mimeType = hasTransparency ? 'image/png' : 'image/jpeg';
		const extension = hasTransparency ? 'png' : 'jpg';
		const quality = hasTransparency ? 1.0 : 0.9;

		canvas.toBlob(
			(blob) => {
				if (!blob) {
					return reject({
						code: 400,
						message: 'Error cropping image, please recrop your image and try again.',
					});
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
	const ratioDimensions = ratioDimensionsByCropRatio[cropRatio];
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

	const thumbnailWidth = thumbnailWidthByCropRatio[cropSelection.cropRatio];
	const ratioDimensions = ratioDimensionsByCropRatio[cropSelection.cropRatio];
	const thumbnailHeight = (thumbnailWidth / ratioDimensions.width) * ratioDimensions.height;

	thumbnailCanvas.width = thumbnailWidth;
	thumbnailCanvas.height = thumbnailHeight;
	thumbnailCtx.drawImage(cropCanvas, 0, 0, thumbnailWidth, thumbnailHeight);

	const thumbnailBlobResult = await getCanvasBlob(thumbnailCanvas);
	const baseImageName = stripExtension(imageName);
	const fileNameSuffix = fileNameSuffixByCropRatio[cropSelection.cropRatio];

	return {
		blob: cropBlobResult.blob,
		imageName: `${baseImageName}-${fileNameSuffix}.${cropBlobResult.extension}`,
		width: outputDimensions.width,
		height: outputDimensions.height,
		fileUploadTypeId: fileUploadTypeIdByCropRatio[cropSelection.cropRatio],
		thumbnail: {
			blob: thumbnailBlobResult.blob,
			imageName: `${baseImageName}-${fileNameSuffix}-thumbnail.${thumbnailBlobResult.extension}`,
			width: thumbnailCanvas.width,
			height: thumbnailCanvas.height,
			fileUploadTypeId: thumbnailFileUploadTypeIdByCropRatio[cropSelection.cropRatio],
		},
	};
}

async function getImageUploadPayload(
	selectedImage: ImageRepositorySelectedImageModel,
	cropSelection: ImageRepositoryCropSelection
): Promise<ImageRepositoryUploadPayload | undefined> {
	const image = await loadImage(selectedImage.imageUrl);
	const croppedImage = await getCroppedImageAsset(image, selectedImage.imageName, cropSelection);

	if (!croppedImage) {
		return;
	}

	return {
		rawImage: {
			blob: selectedImage.file,
			imageName: selectedImage.imageName,
			width: cropSelection.imageNaturalWidth,
			height: cropSelection.imageNaturalHeight,
		},
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
			reject({
				code: 'UPLOAD_ERROR',
				message: 'There was an error uploading your image.',
			});
		});

		xhr.addEventListener('abort', () => {
			reject({
				code: 'UPLOAD_ABORTED',
				message: 'The image upload was aborted.',
			});
		});

		xhr.open(presignedUpload.httpMethod, presignedUpload.url, true);

		for (let httpHeaderName in presignedUpload.httpHeaders) {
			xhr.setRequestHeader(httpHeaderName, presignedUpload.httpHeaders[httpHeaderName]);
		}

		xhr.send(blob);
	});
}

interface UploadMediaImageAssetOptions {
	asset: ImageRepositoryUploadAsset;
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	sourceImageId?: string;
	onProgress(percentage: number): void;
	onXhrCreated(xhr: XMLHttpRequest): void;
}

async function uploadMediaImageAsset({
	asset,
	fileUploadTypeId,
	sourceImageId,
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

export interface ImageRepositorySelectedImageRef {
	startUpload(): void;
}

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
	ratioLabel: {
		margin: 0,
		color: theme.colors.n500,
		fontSize: 16,
		fontWeight: 700,
		lineHeight: 1.2,
		textTransform: 'uppercase',
	},
	ratioOption: {
		display: 'flex',
		alignItems: 'center',
		gap: 8,
		margin: 0,
		'& .form-check-input': {
			marginRight: 0,
		},
		'& .form-check-label': {
			color: theme.colors.n900,
			fontSize: 18,
			fontWeight: 600,
			lineHeight: 1.2,
		},
	},
	metadataPanel: {
		padding: 24,
		backgroundColor: theme.colors.n0,
	},
	metadataTitle: {
		margin: '0 0 24px',
		fontSize: 16,
		fontWeight: 600,
		lineHeight: 1.4,
		color: theme.colors.n900,
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

const ImageRepositorySelectedImage = forwardRef<ImageRepositorySelectedImageRef, ImageRepositoryScreenProps>(
	({ selectedImage, onImageUploaded, onSelectedImageChange, onUploadStatusChange }, ref) => {
		const classes = useStyles();
		const handleError = useHandleError();
		const imageRef = useRef<HTMLImageElement>();
		const uploadRunIdRef = useRef(0);
		const activeUploadXhrRef = useRef<XMLHttpRequest>();
		const [cropRatio, setCropRatio] = useState(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
		const [crop, setCrop] = useState<ReactCrop.Crop>(getInitialCrop(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE));
		const [progress, setProgress] = useState(0);
		const [uploadStatus, setUploadStatus] = useState<IMAGE_REPOSITORY_UPLOAD_STATUS>(
			IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING
		);
		const [isUploading, setIsUploading] = useState(false);

		useEffect(() => {
			setCropRatio(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
			setCrop(getInitialCrop(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE));
			setProgress(0);
			setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.PREPARING);
			setIsUploading(false);
		}, [selectedImage?.imageUrl]);

		useEffect(() => {
			return () => {
				uploadRunIdRef.current += 1;
				activeUploadXhrRef.current?.abort();
				onUploadStatusChange?.(false);
			};
		}, [onUploadStatusChange]);

		const handleImageLoaded = useCallback((image: HTMLImageElement) => {
			imageRef.current = image;
			return true;
		}, []);

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
			const setStepProgress = (stepIndex: number, stepProgress: number) => {
				if (!isCurrentUpload()) {
					return;
				}

				setProgress(Math.round(((stepIndex + stepProgress / 100) / uploadStepsCount) * 100));
			};
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

				const imageUploadPayload = await getImageUploadPayload(selectedImage, cropSelection);

				if (!isCurrentUpload()) {
					return;
				}

				if (!imageUploadPayload) {
					throw new Error('There was an error preparing your image.');
				}

				setUploadStatus(IMAGE_REPOSITORY_UPLOAD_STATUS.UPLOADING);

				const rawImage = await uploadMediaImageAsset({
					asset: imageUploadPayload.rawImage,
					fileUploadTypeId: FILE_UPLOAD_TYPE_ID.IMAGE_RAW,
					onProgress: (percentage) => {
						setStepProgress(0, percentage);
					},
					onXhrCreated: handleXhrCreated,
				});

				if (!isCurrentUpload()) {
					return;
				}

				const croppedImage = await uploadMediaImageAsset({
					asset: imageUploadPayload.croppedImage,
					fileUploadTypeId: imageUploadPayload.croppedImage.fileUploadTypeId,
					sourceImageId: rawImage.imageId,
					onProgress: (percentage) => {
						setStepProgress(1, percentage);
					},
					onXhrCreated: handleXhrCreated,
				});

				if (!isCurrentUpload()) {
					return;
				}

				await uploadMediaImageAsset({
					asset: imageUploadPayload.croppedImage.thumbnail,
					fileUploadTypeId: imageUploadPayload.croppedImage.thumbnail.fileUploadTypeId,
					sourceImageId: croppedImage.imageId,
					onProgress: (percentage) => {
						setStepProgress(2, percentage);
					},
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
							imageAlt={selectedImage.imageAltText}
							crop={crop}
							disabled={isUploading}
							onImageLoaded={handleImageLoaded}
							onChange={(nextCrop) => {
								setCrop(nextCrop);
							}}
						/>
					</div>
					<div className={classes.ratioControls}>
						<p className={classes.ratioLabel}>Ratio:</p>
						{Object.values(IMAGE_REPOSITORY_CROP_RATIO).map((ratio) => (
							<Form.Check
								key={ratio}
								inline
								className={classes.ratioOption}
								type="radio"
								name="image-repository-crop-ratio"
								id={`image-repository-crop-ratio-${ratio}`}
								label={ratio}
								checked={cropRatio === ratio}
								disabled={isUploading}
								onChange={() => {
									setCropRatio(ratio);
									setCrop(getInitialCrop(ratio));
								}}
							/>
						))}
					</div>
				</div>
				<div className={classes.metadataPanel}>
					<h3 className={classes.metadataTitle}>Image Metadata</h3>
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

ImageRepositorySelectedImage.displayName = 'ImageRepositorySelectedImage';

export default ImageRepositorySelectedImage;
