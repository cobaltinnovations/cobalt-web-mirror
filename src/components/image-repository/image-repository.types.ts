import { FILE_UPLOAD_TYPE_ID } from '@/lib/services/media-service';

export enum IMAGE_REPOSITORY_SCREEN_ID {
	BROWSE_IMAGES = 'BROWSE_IMAGES',
	ADD_IMAGE = 'ADD_IMAGE',
	CROP_IMAGE = 'CROP_IMAGE',
	SELECTED_IMAGE = 'SELECTED_IMAGE',
}

export enum IMAGE_REPOSITORY_CROP_RATIO {
	SIXTEEN_NINE = '16:9',
	FOUR_THREE = '4:3',
	ONE_ONE = '1:1',
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
	imageName: string;
	imageUrl: string;
	imageAltText: string;
	sourceImageId?: string;
}

export interface ImageRepositoryUploadAsset {
	blob: Blob;
	imageName: string;
	width: number;
	height: number;
}

export interface ImageRepositoryCroppedImage extends ImageRepositoryUploadAsset {
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	thumbnail: ImageRepositoryUploadAsset & {
		fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	};
}

export interface ImageRepositoryUploadPayload {
	rawImage?: ImageRepositoryUploadAsset;
	sourceImageId?: string;
	croppedImage: ImageRepositoryCroppedImage;
	imageAltText: string;
}

export interface ImageRepositoryScreenProps {
	onNavigate(nextScreenId: IMAGE_REPOSITORY_SCREEN_ID): void;
	onFileSelected?(file: File): void;
	onImageUploaded?(): void;
	onRepositoryImageSelected?(imageId: string): void;
	onRepositoryImageRecrop?(image: ImageRepositorySelectedImage, cropRatio: IMAGE_REPOSITORY_CROP_RATIO): void;
	onRepositoryImageVariantAvailabilityChange?(isAvailable: boolean): void;
	onSelectedImageChange?(image: ImageRepositorySelectedImage): void;
	onUploadStatusChange?(isUploading: boolean): void;
	initialCropRatio?: IMAGE_REPOSITORY_CROP_RATIO;
	repositoryImageId?: string;
	selectedImage?: ImageRepositorySelectedImage;
}
