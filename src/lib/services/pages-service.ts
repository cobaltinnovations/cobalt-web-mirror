import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import {
	BACKGROUND_COLOR_ID,
	OneColumnImageRowModel,
	PAGE_STATUS_ID,
	PageDetailModel,
	PageModel,
	PageSectionModel,
	ResourcesRowModel,
	ThreeColumnImageRowModel,
	TwoColumnImageRowModel,
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
	createOneColumnRow(pageSectionId: string) {
		return httpSingleton.orchestrateRequest<{
			pageRow: OneColumnImageRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/custom-one-column`,
			data: { columnOne: {} },
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
	createThreeColumnRow(pageSectionId: string) {
		return httpSingleton.orchestrateRequest<{
			pageRow: ThreeColumnImageRowModel;
		}>({
			method: 'POST',
			url: `/pages/row/${pageSectionId}/custom-three-column`,
			data: { columnOne: {}, columnTwo: {}, columnThree: {} },
		});
	},
};
