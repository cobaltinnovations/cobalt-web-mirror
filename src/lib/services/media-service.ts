import { httpSingleton } from '@/lib/singletons/http-singleton';
import { PresignedUploadModel } from '@/lib/models';

enum FILE_UPLOAD_TYPE_ID {
	IMAGE_RAW = 'IMAGE_RAW',
	IMAGE_4X3 = 'IMAGE_4X3',
	IMAGE_16X9 = 'IMAGE_16X9',
	IMAGE_1X1 = 'IMAGE_1X1',
	IMAGE_THUMBNAIL_4X3 = 'IMAGE_THUMBNAIL_4X3',
	IMAGE_THUMBNAIL_16X9 = 'IMAGE_THUMBNAIL_16X9',
	IMAGE_THUMBNAIL_1X1 = 'IMAGE_THUMBNAIL_1X1',
}

enum FILE_UPLOAD_STATUS_ID {
	CREATED = 'CREATED',
	UPLOADED = 'UPLOADED',
	ABANDONED = 'ABANDONED',
}

interface GetPresignedUploadRequestBody {
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	filename: string;
	contentType: string;
	filesize: number;
	width: number;
	height: number;
	sourceImageId?: string;
}

interface ImageModel {
	imageId: string;
	fileUploadId: string;
	sourceImageId: null;
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

export const mediaService = {
	getPresignedUpload(data: GetPresignedUploadRequestBody) {
		return httpSingleton.orchestrateRequest<{ presignedUpload: PresignedUploadModel }>({
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
};
