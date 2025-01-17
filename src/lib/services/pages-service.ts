import { httpSingleton } from '@/lib/singletons/http-singleton';
import { buildQueryParamUrl } from '@/lib/utils';
import { PAGE_STATUS_ID, PageModel } from '@/lib/models';

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
};
