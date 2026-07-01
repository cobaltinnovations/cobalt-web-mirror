import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	FILE_UPLOAD_TYPE_ID,
	type ImageDetailModel,
	type ImageListModel,
	type ImageModel,
	type MediaImageUploadResult,
} from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils/url-utils';

export interface GetPresignedUploadRequestBody {
	fileUploadTypeId: FILE_UPLOAD_TYPE_ID;
	filename: string;
	contentType: string;
	filesize: number;
	width: number;
	height: number;
	imageHash?: string;
	sourceImageId?: string;
	imageAltText?: string;
}

export enum MEDIA_IMAGE_SCOPE_ID {
	RESOURCE = 'RESOURCE',
	GROUP_SESSION = 'GROUP_SESSION',
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
	getImages(queryParameters?: { searchQuery?: string; mediaImageScopeId?: MEDIA_IMAGE_SCOPE_ID }) {
		return httpSingleton.orchestrateRequest<{ images: ImageListModel[] }>({
			method: 'GET',
			url: buildQueryParamUrl('/media/images', queryParameters),
		});
	},
	getImage(imageId: string) {
		return httpSingleton.orchestrateRequest<ImageDetailModel>({
			method: 'GET',
			url: `/media/images/${imageId}`,
		});
	},
	detectDuplicate(data: { imageHash: string }) {
		return httpSingleton.orchestrateRequest<{ duplicate: boolean; imageIds: string[]; duplicateCount: number }>({
			method: 'POST',
			url: '/media/images/duplicate-detection',
			data,
		});
	},
};
