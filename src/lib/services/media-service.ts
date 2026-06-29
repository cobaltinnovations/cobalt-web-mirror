import { httpSingleton } from '@/lib/singletons/http-singleton';
import { PresignedUploadModel } from '@/lib/models';

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

export interface GetPresignedUploadRequestBody {
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	filename: string;
	contentType: string;
	filesize: number;
	width: number;
	height: number;
	sourceImageId?: string;
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
	filename: string;
	filesizeInBytes: string;
	contentType: string;
	url: string;
	storageBucket: string;
	storageKey: string;
	storageRegion: string;
	created: string;
	createdDescription: string;
	lastUpdated: string;
	lastUpdatedDescription: string;
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
	image: ImageModel & {
		imageAltText?: string;
	};
	variants: ImageModel[];
}

export const mediaService = {
	getPresignedUpload(data: GetPresignedUploadRequestBody) {
		return httpSingleton.orchestrateRequest<{ mediaImageUploadResult: MediaImageUploadResult }>({
			method: 'POST',
			url: '/media/images/presigned-upload',
			data,
		});
	},
	setImageAsUploaded(imageId: string) {
		return httpSingleton.orchestrateRequest<{ image: ImageModel }>({
			method: 'POST',
			url: `/media/images/${imageId}/uploaded`,
		});
	},
	getImages() {
		return httpSingleton.orchestrateRequest<{ images: ImageListModel[] }>({
			method: 'GET',
			url: '/media/images/',
		});
	},
	getImage(imageId: string) {
		return httpSingleton.orchestrateRequest<ImageDetailModel>({
			method: 'GET',
			url: `/media/images/${imageId}`,
		});
	},
};
