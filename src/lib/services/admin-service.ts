import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	AdminContent,
	Content,
	ContentStatusId,
	ContentStatus,
	ContentTypeId,
	PresignedUploadModel,
	TagGroup,
	Tag,
} from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

export interface CreateContentRequest {
	contentTypeId?: ContentTypeId;
	title?: string;
	author?: string;
	url?: string;
	imageUrl?: string;
	durationInMinutes?: string;
	description?: string;
	publishStartDate?: string;
	publishEndDate?: string;
	publishRecurring?: boolean;
	tagIds?: string[];
	searchTerms?: string;
	sharedFlag?: boolean;
	contentStatusId?: ContentStatusId;
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
	DATE_ADDED_DESCENDING = 'DATE_ADDED_DESCENDING',
	DATE_ADDED_ASCENDING = 'DATE_ADDED_ASCENDING',
	PUBLISH_DATE_DESCENDING = 'PUBLISH_DATE_DESCENDING',
	PUBLISH_DATE_ASCENDING = 'PUBLISH_DATE_ASCENDING',
	EXP_DATE_DESCENDING = 'EXP_DATE_DESCENDING',
	EXP_DATE_ASCENDING = 'EXP_DATE_ASCENDING',
}

interface AdminContentParams {
	page?: number;
	contentTypeId?: ContentTypeId;
	institutionId?: string;
	contentStatusId?: ContentStatusId;
	search?: string;
}

interface AdminContentResponse {
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

interface ContentIdResponse {
	contentId: string;
}

interface GetPreSignedUploadUrlRequestBody {
	contentType: string;
	filename: string;
}

interface GetPreSignedUploadUrlResponseBody {
	presignedUpload: PresignedUploadModel;
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

	fetchContentTags() {
		return httpSingleton.orchestrateRequest<ContentTagsResponse>({
			method: 'get',
			url: '/admin/content-tags',
		});
	},

	getPreSignedUploadUrl(data: GetPreSignedUploadUrlRequestBody) {
		return httpSingleton.orchestrateRequest<GetPreSignedUploadUrlResponseBody>({
			method: 'post',
			url: 'admin/content/image-presigned-upload',
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
		return httpSingleton.orchestrateRequest<ContentIdResponse>({
			method: 'delete',
			url: `/admin/content/${contentId}/remove`,
		});
	},
};
