import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import {
	BACKGROUND_COLOR_ID,
	GroupSessionsRowModel,
	OneColumnImageRowModel,
	PAGE_STATUS_ID,
	PAGE_TYPE_ID,
	PageDetailModel,
	PageFriendlyUrlValidationResult,
	PageModel,
	PageRowUnionModel,
	PageSectionDetailModel,
	PageSectionModel,
	PresignedUploadResponse,
	ResourcesRowModel,
	TagGroupRowModel,
	ThreeColumnImageRowModel,
	TwoColumnImageRowModel,
} from '@/lib/models';

export interface GetPagesResponse {
	totalCountDescription: string;
	totalCount: number;
	pages: PageModel[];
}

export const pagesService = {
	validatePageUrl(searchParameters?: { searchQuery?: string; pageId?: string }) {
		return httpSingleton.orchestrateRequest<{
			pageUrlNameValidationResult: PageFriendlyUrlValidationResult;
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/pages/validate-url-name', searchParameters),
		});
	},
	createPage(data: {
		name: string;
		urlName: string;
		pageTypeId: string;
		pageStatusId: PAGE_STATUS_ID;
		headline?: string;
		description?: string;
		imageFileUploadId?: string;
		imageAltText?: string;
	}) {
		return httpSingleton.orchestrateRequest<{
			page: PageModel;
		}>({
			method: 'POST',
			url: '/pages',
			data,
		});
	},
	getPages(searchParameters?: { pageNumber?: string; pageSize?: string; orderBy?: string }) {
		return httpSingleton.orchestrateRequest<GetPagesResponse>({
			method: 'GET',
			url: buildQueryParamUrl('/pages', searchParameters),
		});
	},
	getPage(pageId: string) {
		return httpSingleton.orchestrateRequest<{ page: PageDetailModel }>({
			method: 'GET',
			url: `/pages/${pageId}`,
		});
	},
	deletePage(pageId: string) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'DELETE',
			url: `/pages/${pageId}`,
		});
	},
	updatePageSettings(
		pageId: string,
		data: {
			name: string;
			urlName: string;
			pageTypeId: PAGE_TYPE_ID;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			page: PageDetailModel;
		}>({
			method: 'PUT',
			url: `/pages/${pageId}/settings`,
			data,
		});
	},
	updatePageHero(
		pageId: string,
		data: {
			headline: string;
			description: string;
			imageFileUploadId: string;
			imageAltText: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			page: PageDetailModel;
		}>({
			method: 'PUT',
			url: `/pages/${pageId}/hero`,
			data,
		});
	},
	createPageSection(
		pageId: string,
		data: {
			name: string;
			headline?: string;
			description?: string;
			backgroundColorId: BACKGROUND_COLOR_ID;
			displayOrder?: number;
			pageStatusId: PAGE_STATUS_ID;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			pageSection: PageSectionModel;
		}>({
			method: 'POST',
			url: `/pages/${pageId}/section`,
			data,
		});
	},
	updatePageSection(
		pageSectionId: string,
		data: {
			name: string;
			headline: string;
			description: string;
			backgroundColorId: BACKGROUND_COLOR_ID;
			displayOrder: number;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			pageSection: PageSectionDetailModel;
		}>({
			method: 'PUT',
			url: `/pages/section/${pageSectionId}`,
			data,
		});
	},
	deletePageSection(pageSectionId: string) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'DELETE',
			url: `/pages/section/${pageSectionId}`,
		});
	},
	reorderPageSections(pageId: string, data: { pageSectionIds: string[] }) {
		return httpSingleton.orchestrateRequest<{
			pageSections: PageSectionDetailModel[];
		}>({
			method: 'PUT',
			url: `/pages/${pageId}/section`,
			data,
		});
	},
	createResourcesRow(pageSectionId: string, data: { contentIds: string[] }) {
		return httpSingleton.orchestrateRequest<{
			pageRow: ResourcesRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/content`,
			data,
		});
	},
	updateResourcesRow(pageRowId: string, data: { contentIds: string[] }) {
		return httpSingleton.orchestrateRequest<{
			pageRow: ResourcesRowModel;
		}>({
			method: 'PUT',
			url: `/pages/row/${pageRowId}/content`,
			data,
		});
	},
	deleteResourcesRowContent(pageRowId: string, contentId: string) {
		return httpSingleton.orchestrateRequest<{
			pageRow: ResourcesRowModel;
		}>({
			method: 'DELETE',
			url: `/pages/row/${pageRowId}/content/${contentId}`,
		});
	},
	createGroupSessionsRow(pageSectionId: string, data: { groupSessionIds: string[] }) {
		return httpSingleton.orchestrateRequest<{
			pageRow: GroupSessionsRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/group-session`,
			data,
		});
	},
	updateGroupSessionsRow(pageRowId: string, data: { groupSessionIds: string[] }) {
		return httpSingleton.orchestrateRequest<{
			pageRow: GroupSessionsRowModel;
		}>({
			method: 'PUT',
			url: `/pages/row/${pageRowId}/group-session`,
			data,
		});
	},
	deleteGroupSessionsRowGroupSession(pageRowId: string, groupSessionId: string) {
		return httpSingleton.orchestrateRequest<{
			pageRow: GroupSessionsRowModel;
		}>({
			method: 'DELETE',
			url: `/pages/row/${pageRowId}/group-session/${groupSessionId}`,
		});
	},
	createTagGroupRow(pageSectionId: string, data: { tagGroupId: string }) {
		return httpSingleton.orchestrateRequest<{
			pageRow: TagGroupRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/tag-group`,
			data,
		});
	},
	updateTagGroupRow(pageRowId: string, data: { tagGroupId: string }) {
		return httpSingleton.orchestrateRequest<{
			pageRow: TagGroupRowModel;
		}>({
			method: 'PUT',
			url: `/pages/row/${pageRowId}/tag-group`,
			data,
		});
	},
	createOneColumnRow(pageSectionId: string) {
		return httpSingleton.orchestrateRequest<{
			pageRow: OneColumnImageRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/custom-one-column`,
			data: { columnOne: {} },
		});
	},
	updateOneColumnRow(
		pageRowId: string,
		data: {
			columnOne: {
				headline: string;
				description: string;
				imageFileUploadId: string;
				imageAltText: string;
			};
		}
	) {
		return httpSingleton.orchestrateRequest<{
			pageRow: OneColumnImageRowModel;
		}>({
			method: 'PUT',
			url: `/pages/row/${pageRowId}/custom-one-column`,
			data,
		});
	},
	createTwoColumnRow(pageSectionId: string) {
		return httpSingleton.orchestrateRequest<{
			pageRow: TwoColumnImageRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/custom-two-column`,
			data: { columnOne: {}, columnTwo: {} },
		});
	},
	updateTwoColumnRow(
		pageRowId: string,
		data: {
			columnOne: {
				headline: string;
				description: string;
				imageFileUploadId: string;
				imageAltText: string;
			};
			columnTwo: {
				headline: string;
				description: string;
				imageFileUploadId: string;
				imageAltText: string;
			};
		}
	) {
		return httpSingleton.orchestrateRequest<{
			pageRow: TwoColumnImageRowModel;
		}>({
			method: 'PUT',
			url: `/pages/row/${pageRowId}/custom-two-column`,
			data,
		});
	},
	createThreeColumnRow(pageSectionId: string) {
		return httpSingleton.orchestrateRequest<{
			pageRow: ThreeColumnImageRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/custom-three-column`,
			data: { columnOne: {}, columnTwo: {}, columnThree: {} },
		});
	},
	updateThreeColumnRow(
		pageRowId: string,
		data: {
			columnOne: {
				headline: string;
				description: string;
				imageFileUploadId: string;
				imageAltText: string;
			};
			columnTwo: {
				headline: string;
				description: string;
				imageFileUploadId: string;
				imageAltText: string;
			};
			columnThree: {
				headline: string;
				description: string;
				imageFileUploadId: string;
				imageAltText: string;
			};
		}
	) {
		return httpSingleton.orchestrateRequest<{
			pageRow: ThreeColumnImageRowModel;
		}>({
			method: 'PUT',
			url: `/pages/row/${pageRowId}/custom-three-column`,
			data,
		});
	},
	deletePageRow(pageRowId: string) {
		return httpSingleton.orchestrateRequest<void>({
			method: 'DELETE',
			url: `/pages/row/${pageRowId}`,
		});
	},
	reorderPageSectionRows(pageSectionId: string, data: { pageRowIds: string[] }) {
		return httpSingleton.orchestrateRequest<{
			pageRows: PageRowUnionModel[];
		}>({
			method: 'PUT',
			url: `/pages/row/${pageSectionId}`,
			data,
		});
	},
	createPresignedFileUpload(data: { contentType: string; filename: string }) {
		return httpSingleton.orchestrateRequest<PresignedUploadResponse>({
			method: 'POST',
			url: '/pages/file-presigned-upload',
			data,
		});
	},
};
