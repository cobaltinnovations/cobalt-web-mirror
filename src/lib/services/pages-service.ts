import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import {
	BACKGROUND_COLOR_ID,
	PAGE_STATUS_ID,
	PageDetailModel,
	PageModel,
	PageSectionModel,
	ResourcesRowModel,
} from '@/lib/models';

export interface GetPagesResponse {
	totalCountDescription: string;
	totalCount: number;
	pages: PageModel[];
}

export const pagesService = {
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
	createResourcesRow(pageSectionId: string, data: { contentIds: string[] }) {
		return httpSingleton.orchestrateRequest<{
			pageRow: ResourcesRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/content`,
			data,
		});
	},
};
