import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	AdminContent,
	ContentStatusId,
	ContentStatus,
	ContentTypeId,
	TagGroup,
	Tag,
	PresignedUploadResponse,
	CONTENT_VISIBILITY_TYPE_ID,
} from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

export interface CreateContentRequest {
	contentTypeId?: ContentTypeId;
	title?: string;
	author?: string;
	url?: string;
	fileUploadId?: string;
	imageFileUploadId?: string;
	durationInMinutes?: string;
	description?: string;
	publishStartDate?: string;
	publishEndDate?: string;
	publishRecurring?: boolean;
	tagIds?: string[];
	searchTerms?: string;
	sharedFlag?: boolean;
	contentStatusId?: ContentStatusId;
	contentVisibilityTypeId?: CONTENT_VISIBILITY_TYPE_ID;
}

export interface ContentFiltersResponse {
	institutions?: InstitutionFilters[];
	contentTypes?: ContentTypeFilters[];
}

export interface ContentStatusesResponse {
	contentStatuses: ContentStatus[];
}

export interface InstitutionFilters {
	institutionId: string;
	name: string;
}

export interface ContentTypeFilters {
	contentTypeId: ContentTypeId;
	description: string;
	callToAction: string;
}

export enum AdminContentSortOrder {
	DATE_ADDED_DESC = 'DATE_ADDED_DESC',
	DATE_ADDED_ASC = 'DATE_ADDED_ASC',
	PUBLISH_DATE_DESC = 'PUBLISH_DATE_DESC',
	PUBLISH_DATE_ASC = 'PUBLISH_DATE_ASC',
	EXPIRY_DATE_DESC = 'EXPIRY_DATE_DESC',
	EXPIRY_DATE_ASC = 'EXPIRY_DATE_ASC',
}

interface AdminContentParams {
	page?: number;
	contentTypeId?: ContentTypeId;
	institutionId?: string;
	contentStatusId?: ContentStatusId;
	search?: string;
}

export interface AdminContentResponse {
	content?: AdminContent;
	adminContent?: AdminContent;
}

export interface ContentTagsResponse {
	tagGroups: TagGroup[];
	tags: Tag[];
}

export interface AdminContentListResponse {
	adminContent: AdminContent[];
	totalCount: number;
}

export interface ContentIdResponse {
	contentId: string;
}

interface GetPreSignedUploadUrlRequestBody {
	contentType: string;
	filename: string;
	filesize: number;
}

interface InstitutionsResponse {
	institutions: InstitutionFilters[];
}

export const adminService = {
	fetchInstitutions() {
		return httpSingleton.orchestrateRequest<InstitutionsResponse>({
			method: 'get',
			url: '/admin/content-institutions',
		});
	},
	fetchMyContentFilters() {
		return httpSingleton.orchestrateRequest<ContentFiltersResponse>({
			method: 'get',
			url: '/admin/my-content/filter',
		});
	},

	fetchContentStatuses() {
		return httpSingleton.orchestrateRequest<ContentStatusesResponse>({
			method: 'get',
			url: '/admin/content-statuses',
		});
	},

	fetchContent(queryParameters?: AdminContentParams) {
		return httpSingleton.orchestrateRequest<AdminContentListResponse>({
			method: 'get',
			url: buildQueryParamUrl('/admin/content', queryParameters),
		});
	},

	fetchAdminContent(contentId: string) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'get',
			url: `/admin/content/${contentId}`,
		});
	},

	createContent(data: CreateContentRequest) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'post',
			url: '/admin/content',
			data,
		});
	},

	updateContent(contentId: string, data: any) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'put',
			url: `/admin/content/${contentId}`,
			data,
		});
	},

	deleteAdminContent(contentId: string) {
		return httpSingleton.orchestrateRequest<ContentIdResponse>({
			method: 'delete',
			url: `/admin/content/${contentId}`,
		});
	},

	publishContent(contentId: string) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'put',
			url: `/admin/content/${contentId}/publish`,
		});
	},

	fetchContentTags() {
		return httpSingleton.orchestrateRequest<ContentTagsResponse>({
			method: 'get',
			url: '/admin/content-tags',
		});
	},

	getPresignedUploadUrl(data: GetPreSignedUploadUrlRequestBody) {
		return httpSingleton.orchestrateRequest<PresignedUploadResponse>({
			method: 'post',
			url: 'admin/content/image-presigned-upload',
			data,
		});
	},

	getFilePresignedUpload(data: GetPreSignedUploadUrlRequestBody) {
		return httpSingleton.orchestrateRequest<PresignedUploadResponse>({
			method: 'post',
			url: '/admin/content/file-presigned-upload',
			data,
		});
	},

	addContent(contentId: string) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'post',
			url: `/admin/content/${contentId}/add`,
		});
	},

	removeContent(contentId: string) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'delete',
			url: `/admin/content/${contentId}/remove`,
		});
	},

	forceExpireContent(contentId: string) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'PUT',
			url: `/admin/content/${contentId}/force-expire`,
		});
	},
};
