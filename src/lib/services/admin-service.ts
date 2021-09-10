import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	AdminContentRow,
	Content,
	ContentApprovalStatusId,
	ContentAvailableStatusId,
	ContentTypeId,
	ContentVisibilityTypeId,
	PersonalizationQuestion,
	PresignedUploadModel,
} from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

export interface ContentFiltersResponse {
	institutions?: InstitutionFilters[];
	visibilities?: VisibilityFilters[];
	contentTypes?: ContentTypeFilters[];
	approvalStatuses?: ApprovalStatusFilters[];
	availableStatuses?: AvailableStatusFilters[];
	myApprovalStatuses?: ApprovalStatusFilters[];
	otherApprovalStatuses?: ApprovalStatusFilters[];
}

export interface InstitutionFilters {
	institutionId: string;
	name: string;
}
interface VisibilityFilters {
	visibilityId: ContentVisibilityTypeId;
	description: string;
}
interface ContentTypeFilters {
	contentTypeId: ContentTypeId;
	description: string;
	callToAction: string;
}
interface ApprovalStatusFilters {
	approvalStatusId: ContentApprovalStatusId;
	description: string;
}

interface AvailableStatusFilters {
	availableStatusId?: ContentAvailableStatusId;
	description: string;
}

interface adminContentParams {
	page?: number;
	contentTypeId?: ContentTypeId;
	institutionId?: string;
	visibilityId?: ContentVisibilityTypeId;
	approvalStatusId?: ContentApprovalStatusId;
	search?: string;
}

interface AdminContentResponse {
	networkInstitutions?: InstitutionFilters[];
	content?: Content;
	adminContent?: AdminContentRow;
}

export interface AdminContentListResponse {
	adminContent: AdminContentRow[];
	totalCount: number;
}

interface ContentIdResponse {
	contentId: string;
}

interface ContentTags {
	assessmentQuestions?: PersonalizationQuestion[];
}

interface ContentTagsResponse {
	contentTags: ContentTags;
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

export interface ContentTypeLabel {
	contentTypeLabelId: string;
	description: string;
}

interface ContentTypeLabelsResponse {
	contentTypeLabels: ContentTypeLabel[];
}

export const adminService = {
	fetchInstitutions() {
		return httpSingleton.orchestrateRequest<InstitutionsResponse>({
			method: 'get',
			url: '/admin/content-institutions',
		});
	},
	fetchContentTypeLabels() {
		return httpSingleton.orchestrateRequest<ContentTypeLabelsResponse>({
			method: 'get',
			url: '/admin/content-type-labels',
		});
	},
	fetchMyContentFilters() {
		return httpSingleton.orchestrateRequest<ContentFiltersResponse>({
			method: 'get',
			url: '/admin/my-content/filter',
		});
	},
	fetchAvailableContentFilters() {
		return httpSingleton.orchestrateRequest<ContentFiltersResponse>({
			method: 'get',
			url: '/admin/available-content/filter',
		});
	},

	fetchMyContent(queryParameters?: adminContentParams) {
		return httpSingleton.orchestrateRequest<AdminContentListResponse>({
			method: 'get',
			url: buildQueryParamUrl('/admin/my-content', queryParameters),
		});
	},

	fetchAdminContent(contentId: string) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'get',
			url: `/admin/content/${contentId}`,
		});
	},

	createContent(data: any) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'post',
			url: '/admin/content',
			data,
		});
	},

	updateContent(contentId: string | null, data: any) {
		if (!contentId) return;
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'put',
			url: `/admin/content/${contentId}`,
			data,
		});
	},

	fetchAvailableContent(queryParameters?: adminContentParams) {
		return httpSingleton.orchestrateRequest<AdminContentListResponse>({
			method: 'get',
			url: buildQueryParamUrl('/admin/available-content', queryParameters),
		});
	},

	updateContentApprovalStatus(contentId: string, approvalStatusId: ContentApprovalStatusId) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'put',
			url: `/admin/content/${contentId}/approval-status`,
			data: { approvalStatusId },
		});
	},

	deleteAdminContent(contentId: string) {
		return httpSingleton.orchestrateRequest<ContentIdResponse>({
			method: 'delete',
			url: `/admin/content/${contentId}`,
		});
	},

	updateArchiveFlag(contentId: string, archivedFlag: boolean) {
		return httpSingleton.orchestrateRequest<AdminContentResponse>({
			method: 'put',
			url: `/admin/content/${contentId}/archive`,
			data: {
				archivedFlag,
			},
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
};
