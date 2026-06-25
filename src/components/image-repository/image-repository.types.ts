export enum IMAGE_REPOSITORY_SCREEN_ID {
	BROWSE_IMAGES = 'BROWSE_IMAGES',
	ADD_IMAGE = 'ADD_IMAGE',
	SELECTED_IMAGE = 'SELECTED_IMAGE',
	UPLOAD_IMAGE = 'UPLOAD_IMAGE',
}

export interface ImageRepositoryImage {
	fileUploadId: string;
	imageName: string;
	imageUrl: string;
	imageAltText: string;
}

export interface ImageRepositorySelectedImage {
	file: File;
	imageName: string;
	imageUrl: string;
	imageAltText: string;
}

export interface ImageRepositoryCroppedImage {
	blob: Blob;
	imageName: string;
	imageAltText: string;
}

export interface ImageRepositoryScreenProps {
	onNavigate(nextScreenId: IMAGE_REPOSITORY_SCREEN_ID): void;
	onFileSelected?(file: File): void;
	onImageUploaded?(image: ImageRepositoryImage): void;
	onSelectedImageChange?(image: ImageRepositorySelectedImage): void;
	onUploadStatusChange?(isUploading: boolean): void;
	selectedImage?: ImageRepositorySelectedImage;
	croppedImage?: ImageRepositoryCroppedImage;
}
