import type { PresignedUploadModel } from './presigned-upload-models';

export enum FILE_UPLOAD_TYPE_ID {
	IMAGE_RAW = 'IMAGE_RAW',
	IMAGE_4X3 = 'IMAGE_4X3',
	IMAGE_16X9 = 'IMAGE_16X9',
	IMAGE_1X1 = 'IMAGE_1X1',
	IMAGE_THUMBNAIL_4X3 = 'IMAGE_THUMBNAIL_4X3',
	IMAGE_THUMBNAIL_16X9 = 'IMAGE_THUMBNAIL_16X9',
	IMAGE_THUMBNAIL_1X1 = 'IMAGE_THUMBNAIL_1X1',
}

export enum FILE_UPLOAD_STATUS_ID {
	CREATED = 'CREATED',
	UPLOADED = 'UPLOADED',
	ABANDONED = 'ABANDONED',
}

export interface ImageModel {
	imageId: string;
	fileUploadId: string;
	sourceImageId: string | null;
	institutionId: string;
	createdByAccountId: string;
	fileUploadStatusId: FILE_UPLOAD_STATUS_ID;
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	width: number;
	height: number;
	imageAltText?: string;
	filename: string;
	filesizeInBytes: string;
	contentType: string;
	url: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
	thumbnail?: ImageModel;
}

export interface MediaImageUploadResult {
	imageId: string;
	fileUploadId: string;
	fileUploadResult: {
		fileUploadId: string;
		presignedUpload: PresignedUploadModel;
	};
}

export enum IMAGE_TYPE {
	RAW = 'RAW',
	CROP = 'CROP',
	THUMBNAIL = 'THUMBNAIL',
}

export interface ImageVariantModel {
	imageId: string;
	sourceImageId: string | null;
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	imageType: IMAGE_TYPE;
	aspectRatio: string | null;
	thumbnail: boolean;
}

export interface ImageListModel {
	thumbnail: ImageModel;
	sourceImageId: string;
	variants: ImageVariantModel[];
}

export interface ImageDetailModel {
	image: ImageModel;
	variants: ImageModel[];
}
