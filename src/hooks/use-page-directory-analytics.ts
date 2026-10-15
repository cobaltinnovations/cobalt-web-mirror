import { useCallback, useEffect, useRef } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { AnalyticsNativeEventTypeId, PAGE_LOCATION_ID, SITE_LOCATION_ID } from '@/lib/models';
import { analyticsService } from '@/lib/services/analytics-service';
import { GetPublishedPagesResponse } from '@/lib/services/pages-service';
import { getPageDirectoryRequestParameters, PAGE_DIRECTORY_PAGE_SIZE } from '@/lib/utils/page-directory-utils';

export const usePageDirectoryAnalytics = (
	pageLocationId: PAGE_LOCATION_ID,
	pagesResponse: Promise<GetPublishedPagesResponse>
) => {
	const { key: locationKey } = useLocation();
	const [searchParams] = useSearchParams();
	const parameters = getPageDirectoryRequestParameters(pageLocationId, searchParams);
	const pageNumber = Number(parameters.pageNumber);
	const searchQuery = parameters.searchQuery;
	// Reset on every visit, including visits whose results fail or never finish loading.
	const visitRef = useRef<{ key?: string; tracked: boolean }>({ tracked: false });

	useEffect(() => {
		if (visitRef.current.key !== locationKey) {
			visitRef.current = { key: locationKey, tracked: false };
		}
		let active = true;
		pagesResponse.then(
			({ totalCount }) => {
				if (!active || visitRef.current.tracked) return;
				visitRef.current.tracked = true;
				analyticsService.persistEvent(
					pageLocationId === PAGE_LOCATION_ID.FEATURED_TOPIC
						? AnalyticsNativeEventTypeId.PAGE_VIEW_FEATURED_TOPICS
						: AnalyticsNativeEventTypeId.PAGE_VIEW_COMMUNITIES,
					{
						pageLocationId,
						...(searchQuery ? { searchQuery } : {}),
						pageNumber,
						pageSize: PAGE_DIRECTORY_PAGE_SIZE,
						totalCount,
					}
				);
			},
			() => {
				// The directory error boundary handles failed requests; failed results are not viewed.
			}
		);
		return () => {
			active = false;
		};
	}, [locationKey, pageLocationId, pageNumber, pagesResponse, searchQuery]);

	return useCallback(
		(pageId: string) => {
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE, {
				source: 'DIRECTORY',
				pageId,
				pageLocationId,
				siteLocationId:
					pageLocationId === PAGE_LOCATION_ID.FEATURED_TOPIC
						? SITE_LOCATION_ID.FEATURED_TOPIC
						: SITE_LOCATION_ID.COMMUNITY,
				...(searchQuery ? { searchQuery } : {}),
				pageNumber,
				pageSize: PAGE_DIRECTORY_PAGE_SIZE,
			});
		},
		[pageLocationId, pageNumber, searchQuery]
	);
};
