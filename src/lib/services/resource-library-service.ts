import { httpSingleton } from '@/lib/singletons/http-singleton';
import {
	Content,
	ContentAudienceType,
	ContentAudienceTypeGroup,
	ContentDuration,
	ContentType,
	ResourceLibrarySortColumnId,
	Tag,
	TagGroup,
} from '@/lib/models';
import { buildQueryParamUrl } from '@/lib/utils';

export const resourceLibraryService = {
	getResourceLibrary() {
		return httpSingleton.orchestrateRequest<{
			contentsByTagGroupId: Record<string, Content[]>;
			tagGroups: TagGroup[];
			tagsByTagId: Record<string, Tag>;
		}>({
			method: 'GET',
			url: '/resource-library',
		});
	},
	searchResourceLibrary(queryParameters?: {
		contentAudienceTypeId?: string;
		contentDurationId?: string[];
		contentTypeId?: string[];
		pageNumber?: number;
		pageSize?: number;
		resourceLibrarySortColumnId?: string;
		searchQuery?: string;
		tagId?: string[];
	}) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				contents: Content[];
				totalCount: number;
				totalCountDescription: string;
			};
			tagsByTagId: Record<string, Tag>;
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/resource-library/search', queryParameters),
		});
	},
	getResourceLibraryRecommendedContent(queryParameters?: {
		contentAudienceTypeId?: string;
		contentDurationId?: string[];
		contentTypeId?: string[];
		pageNumber?: number;
		pageSize?: number;
		resourceLibrarySortColumnId?: string;
		searchQuery?: string;
		tagId?: string[];
	}) {
		return httpSingleton.orchestrateRequest<{
			tagsByTagId: Record<string, Tag>;
			contentDurations: ContentDuration[];
			contentTypes: ContentType[];
			tagGroups: TagGroup[];
			findResult: {
				contents: Content[];
				totalCount: number;
				totalCountDescription: string;
			};
		}>({
			method: 'GET',
			url: buildQueryParamUrl('/resource-library/recommended', queryParameters),
		});
	},
	getResourceLibraryFilters() {
		return httpSingleton.orchestrateRequest<{
			contentAudienceTypeGroups: ContentAudienceTypeGroup[];
			contentAudienceTypes: ContentAudienceType[];
			contentDurations: ContentDuration[];
			contentTypes: ContentType[];
			resourceLibrarySortColumnIds: ResourceLibrarySortColumnId[];
			tagGroups: TagGroup[];
		}>({
			method: 'GET',
			url: '/resource-library/filters',
		});
	},
	getResourceLibraryContentByTagGroupId(
		tagGroupId: string,
		queryParameters?: {
			contentAudienceTypeId?: string;
			contentDurationId?: string[];
			contentTypeId?: string[];
			pageNumber?: number;
			pageSize?: number;
			searchQuery?: string;
			tagId?: string[];
		}
	) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				contents: Content[];
				totalCount: number;
				totalCountDescription: string;
			};
			tagGroup: TagGroup;
			tagsByTagId: Record<string, Tag>;
		}>({
			method: 'GET',
			url: buildQueryParamUrl(`/resource-library/tag-groups/${tagGroupId}`, queryParameters),
		});
	},
	getResourceLibraryTagByTagIdentifier(tagIdentifier: string) {
		return httpSingleton.orchestrateRequest<{
			contentAudienceTypes: ContentAudienceType[];
			contentDurations: ContentDuration[];
			contentTypes: ContentType[];
			tag: Tag;
			tagGroup: TagGroup;
			tagsByTagId: Record<string, Tag>;
		}>({
			method: 'GET',
			url: `/resource-library/tag-filters/${tagIdentifier}`,
		});
	},
	getResourceLibraryContentByUrlName(
		urlName: string,
		queryParameters?: {
			pageNumber?: number;
			pageSize?: number;
			contentTypeId?: string[];
			contentDurationId?: string[];
			searchQuery?: string;
			contentAudienceTypeId?: string;
		}
	) {
		return httpSingleton.orchestrateRequest<{
			findResult: {
				contents: Content[];
				totalCount: number;
				totalCountDescription: string;
			};
			tag: Tag;
			tagGroup: TagGroup;
			tagsByTagId: Record<string, Tag>;
		}>({
			method: 'GET',
			url: buildQueryParamUrl(`/resource-library/tags/${urlName}`, queryParameters),
		});
	},
	getResourceLibraryFiltersByTagGroupId(tagGroupId: string) {
		return httpSingleton.orchestrateRequest<{
			contentAudienceTypes: ContentAudienceType[];
			contentDurations: ContentDuration[];
			contentTypes: ContentType[];
			tags: Tag[];
		}>({
			method: 'GET',
			url: `/resource-library/tag-group-filters/${tagGroupId}`,
		});
	},
	getResourceLibraryContentTypes() {
		return httpSingleton.orchestrateRequest<{
			contentTypes: ContentType[];
		}>({
			method: 'GET',
			url: `/resource-library/content-types`,
		});
	},
};
