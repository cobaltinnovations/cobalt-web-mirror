import { httpSingleton } from '@/lib/singletons/http-singleton';
import { Content, PresignedUploadModel } from '@/lib/models';

export interface ContentListFormat {
	contentTypeLabelId: string;
	description: string;
}

interface ContentListResponse {
	content: Content[];
	additionalContent: Content[];
	formats: ContentListFormat[];
}

interface ContentResponse {
	content: Content;
}

interface GetPresignedUploadUrlRequestBody {
	contentType: string;
	filename: string;
}

interface GetPresignedUploadUrlResponseBody {
	presignedUpload: PresignedUploadModel;
}

interface FetchContentListQueryParams {
	format?: string;
	maxLengthMinutes?: number;
}

export const contentService = {
	fetchContentList(queryParameters?: FetchContentListQueryParams) {
		let queryString;
		let url = '/content';

		if (queryParameters) {
			queryString = new URLSearchParams(queryParameters as Record<string, string>);
		}

		if (queryString) {
			url = url.concat(`?${queryString}`);
		}

		return httpSingleton.orchestrateRequest<ContentListResponse>({
			method: 'get',
			url,
		});
	},
	fetchContent(contentId: string) {
		return httpSingleton.orchestrateRequest<ContentResponse>({
			method: 'get',
			url: `/content/${contentId}`,
		});
	},
	getPresignedUploadUrl(data: GetPresignedUploadUrlRequestBody) {
		return httpSingleton.orchestrateRequest<GetPresignedUploadUrlResponseBody>({
			method: 'post',
			url: '/content/image-presigned-upload',
			data,
		});
	},
};
