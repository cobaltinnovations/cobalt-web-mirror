import { CobaltError } from '@/lib/http-client';

import {
	ImageRepositoryCrop,
	ImageRepositoryCropSelection,
	ImageRepositoryCroppedImage,
	ImageRepositorySelectedImage as ImageRepositorySelectedImageModel,
	ImageRepositoryUploadPayload,
} from './image-repository.types';
import { IMAGE_REPOSITORY_CROP_RATIO, imageRepositoryCropRatioConfigByCropRatio } from './image-repository-ratios';

const INITIAL_CROP_MAX_SIZE_PERCENT = 70;

export const getInitialCrop = (
	cropRatio: IMAGE_REPOSITORY_CROP_RATIO,
	imageWidth?: number,
	imageHeight?: number
): ImageRepositoryCrop => {
	const aspect = imageRepositoryCropRatioConfigByCropRatio[cropRatio].aspect;

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
	const ratioDimensions = imageRepositoryCropRatioConfigByCropRatio[cropRatio].ratioDimensions;
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
	const cropRatioConfig = imageRepositoryCropRatioConfigByCropRatio[cropSelection.cropRatio];

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

export async function getSha256Hash(blob: Blob): Promise<string> {
	if (!window.crypto?.subtle) {
		throw CobaltError.fromValidationFailed('There was an error preparing your image.');
	}

	const hashBuffer = await window.crypto.subtle.digest('SHA-256', await blob.arrayBuffer());

	return Array.from(new Uint8Array(hashBuffer))
		.map((byte) => byte.toString(16).padStart(2, '0'))
		.join('');
}
