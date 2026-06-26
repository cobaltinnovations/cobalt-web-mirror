import { FILE_UPLOAD_TYPE_ID } from '@/lib/services/media-service';

export enum IMAGE_REPOSITORY_SCREEN_ID {
	BROWSE_IMAGES = 'BROWSE_IMAGES',
	ADD_IMAGE = 'ADD_IMAGE',
	SELECTED_IMAGE = 'SELECTED_IMAGE',
	UPLOAD_IMAGE = 'UPLOAD_IMAGE',
}

export interface ImageRepositorySelectedImage {
	file: File;
	imageName: string;
	imageUrl: string;
	imageAltText: string;
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
	rawImage: ImageRepositoryUploadAsset;
	croppedImage: ImageRepositoryCroppedImage;
	imageAltText: string;
}

export interface ImageRepositoryScreenProps {
	onNavigate(nextScreenId: IMAGE_REPOSITORY_SCREEN_ID): void;
	onFileSelected?(file: File): void;
	onImageUploaded?(): void;
	onSelectedImageChange?(image: ImageRepositorySelectedImage): void;
	onUploadStatusChange?(isUploading: boolean): void;
	selectedImage?: ImageRepositorySelectedImage;
	imageUploadPayload?: ImageRepositoryUploadPayload;
}
