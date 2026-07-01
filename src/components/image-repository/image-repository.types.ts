import { FILE_UPLOAD_TYPE_ID, type ImageModel } from '@/lib/models';

export enum IMAGE_REPOSITORY_SCREEN_ID {
	BROWSE_IMAGES = 'BROWSE_IMAGES',
	ADD_IMAGE = 'ADD_IMAGE',
	CROP_IMAGE = 'CROP_IMAGE',
	DUPLICATE_IMAGE = 'DUPLICATE_IMAGE',
	EDIT_IMAGE = 'EDIT_IMAGE',
	SELECTED_IMAGE = 'SELECTED_IMAGE',
}

export enum IMAGE_REPOSITORY_CROP_RATIO {
	SIXTEEN_NINE = '16:9',
	FOUR_THREE = '4:3',
	ONE_ONE = '1:1',
}

export type ImageRepositorySelectableCropFileUploadTypeId =
	| FILE_UPLOAD_TYPE_ID.IMAGE_4X3
	| FILE_UPLOAD_TYPE_ID.IMAGE_16X9
	| FILE_UPLOAD_TYPE_ID.IMAGE_1X1;

const defaultSelectableCropFileUploadTypeIds: ImageRepositorySelectableCropFileUploadTypeId[] = [
	FILE_UPLOAD_TYPE_ID.IMAGE_16X9,
	FILE_UPLOAD_TYPE_ID.IMAGE_4X3,
	FILE_UPLOAD_TYPE_ID.IMAGE_1X1,
];

const cropRatioByFileUploadTypeId: Record<ImageRepositorySelectableCropFileUploadTypeId, IMAGE_REPOSITORY_CROP_RATIO> =
	{
		[FILE_UPLOAD_TYPE_ID.IMAGE_16X9]: IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE,
		[FILE_UPLOAD_TYPE_ID.IMAGE_4X3]: IMAGE_REPOSITORY_CROP_RATIO.FOUR_THREE,
		[FILE_UPLOAD_TYPE_ID.IMAGE_1X1]: IMAGE_REPOSITORY_CROP_RATIO.ONE_ONE,
	};

export function getAcceptableImageRepositoryCropRatios(
	acceptableCropSizes?: ImageRepositorySelectableCropFileUploadTypeId[]
): IMAGE_REPOSITORY_CROP_RATIO[] {
	const cropSizes =
		acceptableCropSizes && acceptableCropSizes.length > 0
			? acceptableCropSizes
			: defaultSelectableCropFileUploadTypeIds;

	return cropSizes.reduce((cropRatios, cropSize) => {
		const cropRatio = cropRatioByFileUploadTypeId[cropSize];

		if (!cropRatios.includes(cropRatio)) {
			cropRatios.push(cropRatio);
		}

		return cropRatios;
	}, [] as IMAGE_REPOSITORY_CROP_RATIO[]);
}

export function getDefaultImageRepositoryCropRatio(
	acceptableCropSizes?: ImageRepositorySelectableCropFileUploadTypeId[]
): IMAGE_REPOSITORY_CROP_RATIO {
	const acceptableCropRatios = getAcceptableImageRepositoryCropRatios(acceptableCropSizes);

	if (acceptableCropRatios.includes(IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE)) {
		return IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE;
	}

	return acceptableCropRatios[0] ?? IMAGE_REPOSITORY_CROP_RATIO.SIXTEEN_NINE;
}

export function getResolvedImageRepositoryCropRatio(
	cropRatio?: IMAGE_REPOSITORY_CROP_RATIO,
	acceptableCropSizes?: ImageRepositorySelectableCropFileUploadTypeId[]
): IMAGE_REPOSITORY_CROP_RATIO {
	const acceptableCropRatios = getAcceptableImageRepositoryCropRatios(acceptableCropSizes);

	if (cropRatio && acceptableCropRatios.includes(cropRatio)) {
		return cropRatio;
	}

	return getDefaultImageRepositoryCropRatio(acceptableCropSizes);
}

export interface ImageRepositoryCrop {
	aspect?: number;
	x: number;
	y: number;
	width: number;
	height?: number;
	unit?: 'px' | '%';
}

export interface ImageRepositoryCropSelection {
	crop: ImageRepositoryCrop;
	cropRatio: IMAGE_REPOSITORY_CROP_RATIO;
	imageRenderedWidth: number;
	imageRenderedHeight: number;
	imageNaturalWidth: number;
	imageNaturalHeight: number;
}

export interface ImageRepositorySelectedImage {
	file?: File;
	imageHash?: string;
	imageName: string;
	imageUrl: string;
	imageAltText: string;
	sourceImageId?: string;
	createdDescription?: string;
	isCreatingMissingVariant?: boolean;
}

export interface ImageRepositoryUploadAsset {
	blob: Blob;
	imageName: string;
	width: number;
	height: number;
}

export interface ImageRepositoryRawImage extends ImageRepositoryUploadAsset {
	imageHash: string;
}

export interface ImageRepositoryCroppedImage extends ImageRepositoryUploadAsset {
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	thumbnail: ImageRepositoryUploadAsset & {
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	};
}

export interface ImageRepositoryUploadPayload {
	rawImage?: ImageRepositoryRawImage;
	sourceImageId?: string;
	croppedImage: ImageRepositoryCroppedImage;
	imageAltText: string;
}

export interface ImageRepositoryScreenProps {
	onNavigate(nextScreenId: IMAGE_REPOSITORY_SCREEN_ID): void;
	onFileSelected?(file: File): void;
	onImageUploaded?(image: ImageModel): void;
	onRepositoryImageEdit?(image: ImageRepositorySelectedImage, cropRatio: IMAGE_REPOSITORY_CROP_RATIO): void;
	onRepositoryImageSelected?(imageId: string): void;
	onRepositoryImageVariantAvailabilityChange?(isAvailable: boolean): void;
	onRepositoryImageVariantChange?(image?: ImageModel): void;
	onSelectedImageChange?(image: ImageRepositorySelectedImage): void;
	onUploadStatusChange?(isUploading: boolean): void;
	acceptableCropSizes?: ImageRepositorySelectableCropFileUploadTypeId[];
	initialCropRatio?: IMAGE_REPOSITORY_CROP_RATIO;
	repositoryImageId?: string;
	selectedImage?: ImageRepositorySelectedImage;
}
