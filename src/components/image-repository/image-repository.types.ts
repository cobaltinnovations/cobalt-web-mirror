export enum IMAGE_REPOSITORY_SCREEN_ID {
	BROWSE_IMAGES = 'BROWSE_IMAGES',
	ADD_IMAGE = 'ADD_IMAGE',
	SELECTED_IMAGE = 'SELECTED_IMAGE',
}

export interface ImageRepositoryImage {
	fileUploadId: string;
	imageName: string;
	imageUrl: string;
	imageAltText: string;
}

export interface ImageRepositoryScreenProps {
	onNavigate(nextScreenId: IMAGE_REPOSITORY_SCREEN_ID): void;
	onImageUploaded?(image: ImageRepositoryImage): void;
	onSelectedImageChange?(image: ImageRepositoryImage): void;
	selectedImage?: ImageRepositoryImage;
}
