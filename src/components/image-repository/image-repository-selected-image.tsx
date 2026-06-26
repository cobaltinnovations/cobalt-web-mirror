import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Form } from 'react-bootstrap';
import ReactCrop from 'react-image-crop';

import InputHelper from '@/components/input-helper';
import { createUseThemedStyles } from '@/jss/theme';
import { FILE_UPLOAD_TYPE_ID } from '@/lib/services/media-service';

import 'react-image-crop/dist/ReactCrop.css';
import {
	ImageRepositoryCroppedImage,
	ImageRepositoryScreenProps,
	ImageRepositoryUploadPayload,
} from './image-repository.types';

enum IMAGE_REPOSITORY_CROP_RATIO {
	SIXTEEN_NINE = '16:9',
	FOUR_THREE = '4:3',
	ONE_ONE = '1:1',
}

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

function stripExtension(filename: string): string {
	const lastDotIndex = filename.lastIndexOf('.');

	if (lastDotIndex <= 0) {
		return filename;
	}

	return filename.slice(0, lastDotIndex);
}

function resolvePixelCrop(image: HTMLImageElement, crop: ReactCrop.Crop): ReactCrop.Crop {
	const isPercentCrop = crop.unit === '%';
	const x = crop.x ?? 0;
	const y = crop.y ?? 0;
	const width = crop.width ?? 0;
	const height = crop.height ?? (crop.aspect && width ? width / crop.aspect : 0);

	if (!isPercentCrop) {
		return {
			...crop,
			x,
			y,
			width,
			height,
		};
	}

	const pixelWidth = (width / 100) * image.width;
	const pixelHeight = crop.height
		? ((crop.height ?? 0) / 100) * image.height
		: crop.aspect
		? pixelWidth / crop.aspect
		: 0;

	return {
		...crop,
		unit: 'px' as 'px',
		x: (x / 100) * image.width,
		y: (y / 100) * image.height,
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
	crop: ReactCrop.Crop,
	cropRatio: IMAGE_REPOSITORY_CROP_RATIO
): Promise<ImageRepositoryCroppedImage | undefined> {
	const cropCanvas = document.createElement('canvas');
	const ctx = cropCanvas.getContext('2d');

	if (!ctx) {
		return;
	}

	const pixelCrop = resolvePixelCrop(image, crop);
	const cropX = pixelCrop.x ?? 0;
	const cropY = pixelCrop.y ?? 0;
	const cropWidth = pixelCrop.width ?? 0;
	const cropHeight = pixelCrop.height ?? 0;
	const scaleX = image.naturalWidth / image.width;
	const scaleY = image.naturalHeight / image.height;
	const sourceWidth = cropWidth * scaleX;
	const sourceHeight = cropHeight * scaleY;
	const outputDimensions = getAspectOutputDimensions(sourceWidth, sourceHeight, cropRatio);

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

	const thumbnailWidth = thumbnailWidthByCropRatio[cropRatio];
	const ratioDimensions = ratioDimensionsByCropRatio[cropRatio];
	const thumbnailHeight = (thumbnailWidth / ratioDimensions.width) * ratioDimensions.height;

	thumbnailCanvas.width = thumbnailWidth;
	thumbnailCanvas.height = thumbnailHeight;
	thumbnailCtx.drawImage(cropCanvas, 0, 0, thumbnailWidth, thumbnailHeight);

	const thumbnailBlobResult = await getCanvasBlob(thumbnailCanvas);
	const baseImageName = stripExtension(imageName);
	const fileNameSuffix = fileNameSuffixByCropRatio[cropRatio];

	return {
		blob: cropBlobResult.blob,
		imageName: `${baseImageName}-${fileNameSuffix}.${cropBlobResult.extension}`,
		width: outputDimensions.width,
		height: outputDimensions.height,
		fileUploadTypeId: fileUploadTypeIdByCropRatio[cropRatio],
		thumbnail: {
			blob: thumbnailBlobResult.blob,
			imageName: `${baseImageName}-${fileNameSuffix}-thumbnail.${thumbnailBlobResult.extension}`,
			width: thumbnailCanvas.width,
			height: thumbnailCanvas.height,
			fileUploadTypeId: thumbnailFileUploadTypeIdByCropRatio[cropRatio],
		},
	};
}

export interface ImageRepositorySelectedImageRef {
	getUploadPayload(): Promise<ImageRepositoryUploadPayload | undefined>;
}

const useStyles = createUseThemedStyles((theme) => ({
	selectedImageScreen: {
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
}));

const ImageRepositorySelectedImage = forwardRef<ImageRepositorySelectedImageRef, ImageRepositoryScreenProps>(
	({ selectedImage, onSelectedImageChange }, ref) => {
		const classes = useStyles();
		const imageRef = useRef<HTMLImageElement>();
		const [cropRatio, setCropRatio] = useState(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
		const [crop, setCrop] = useState<ReactCrop.Crop>(getInitialCrop(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE));

		useEffect(() => {
			setCropRatio(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE);
			setCrop(getInitialCrop(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE));
		}, [selectedImage?.imageUrl]);

		const handleImageLoaded = useCallback((image: HTMLImageElement) => {
			imageRef.current = image;
			return true;
		}, []);

		useImperativeHandle(
			ref,
			() => ({
				async getUploadPayload() {
					if (!selectedImage || !imageRef.current) {
						return;
					}

					const croppedImage = await getCroppedImageAsset(
						imageRef.current,
						selectedImage.imageName,
						crop,
						cropRatio
					);

					if (!croppedImage) {
						return;
					}

					return {
						rawImage: {
							blob: selectedImage.file,
							imageName: selectedImage.imageName,
							width: imageRef.current.naturalWidth,
							height: imageRef.current.naturalHeight,
						},
						croppedImage,
						imageAltText: selectedImage.imageAltText,
					};
				},
			}),
			[crop, cropRatio, selectedImage]
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
						onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
							onSelectedImageChange?.({
								...selectedImage,
								imageAltText: event.target.value,
							});
						}}
					/>
				</div>
			</div>
		);
	}
);

ImageRepositorySelectedImage.displayName = 'ImageRepositorySelectedImage';

export default ImageRepositorySelectedImage;
