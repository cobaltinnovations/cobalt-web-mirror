import Cookies from 'js-cookie';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Container } from 'react-bootstrap';
import {
	AnalyticsNativeEventTypeId,
	BACKGROUND_COLOR_ID,
	Content,
	PageDetailModel,
	PageRowMailingListModel,
	ROW_PADDING_ID,
	ROW_TYPE_ID,
	Tag,
} from '@/lib/models';
import PageHeader from '@/components/page-header';
import { getRendererForPageRow, MailingListModal } from '@/components/admin/pages';
import { analyticsService, resourceLibraryService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { useSearchParams } from 'react-router-dom';

const cookieNameForPage = (pageId: string) => `ALREADY_SHOWED_SUB_MODAL_${pageId}`;

interface PagePreviewProps {
	page: PageDetailModel;
	enableAnalytics: boolean;
}

const ROW_PADDING_CLASS_BY_ID: Record<ROW_PADDING_ID, string> = {
	[ROW_PADDING_ID.NONE]: '',
	[ROW_PADDING_ID.SMALL]: 'py-12',
	[ROW_PADDING_ID.MEDIUM]: 'py-16',
	[ROW_PADDING_ID.LARGE]: 'py-20',
};

export const PagePreview = ({ page, enableAnalytics }: PagePreviewProps) => {
	const [searchParams] = useSearchParams();
	const livePageSiteLocationIdsRef = useRef(page.livePageSiteLocations.map((i) => i.siteLocationId));

	// Use cookieName that includes the page ID
	const cookieName = useMemo(() => cookieNameForPage(page.pageId), [page.pageId]);

	// Whether the modal has already been shown on THIS page
	const alreadyShowedSubscribe = useMemo(() => Cookies.get(cookieName) === 'true', [cookieName]);

	const subscribeParam = useMemo(() => searchParams.get('subscribe'), [searchParams]);
	const showSubscribeOnLoad = useMemo(
		() => subscribeParam === 'true' && !alreadyShowedSubscribe,
		[alreadyShowedSubscribe, subscribeParam]
	);
	const [showMailingListModal, setShowMailingListModal] = useState(showSubscribeOnLoad ? true : false);

	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, Content[]>>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();
	const pageRows = useMemo(
		() => page.pageSections.flatMap((pageSection) => pageSection.pageRows),
		[page.pageSections]
	);

	useEffect(() => {
		livePageSiteLocationIdsRef.current = page.livePageSiteLocations.map((i) => i.siteLocationId);
	}, [page.livePageSiteLocations]);

	const fetchData = useCallback(async () => {
		const [libraryResponse, filtersResponse] = await Promise.all([
			resourceLibraryService.getResourceLibrary().fetch(),
			resourceLibraryService.getResourceLibraryFilters().fetch(),
		]);

		setContentsByTagGroupId(libraryResponse.contentsByTagGroupId);
		setTagsByTagId(
			filtersResponse.tagGroups
				.map((tg) => tg.tags ?? [])
				.flat()
				.reduce(
					(accumulator, value) => ({
						...accumulator,
						[value.tagId]: value,
					}),
					{}
				)
		);

		if (enableAnalytics) {
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_PAGE, {
				pageId: page.pageId,
				siteLocationIds: livePageSiteLocationIdsRef.current,
			});
		}
	}, [enableAnalytics, page.pageId]);

	const mailingListRowData = pageRows.find((pageRow) => pageRow.rowTypeId === ROW_TYPE_ID.MAILING_LIST) as
		| PageRowMailingListModel
		| undefined;

	return (
		<AsyncWrapper fetchData={fetchData}>
			{mailingListRowData && (
				<MailingListModal
					pageRowMailingList={mailingListRowData}
					enableAnalytics={enableAnalytics}
					show={showMailingListModal}
					onHide={() => {
						setShowMailingListModal(false);
					}}
					onEnter={() => {
						// Session cookie (expires when browser tab closes)
						Cookies.set(cookieName, 'true');
					}}
				/>
			)}

			<PageHeader
				className="bg-p700 text-white"
				title={<h1>{page.headline ?? 'No hero headline'}</h1>}
				descriptionHtml={page.description ?? 'No hero description'}
				imageAlt={page.imageAltText ?? ''}
				imageUrl={page.imageUrl ?? ''}
				ctaButton={
					mailingListRowData
						? {
								title: mailingListRowData.title ?? '',
								onClick: () => {
									setShowMailingListModal(true);
								},
						  }
						: undefined
				}
			/>
			{pageRows.map((pageRow) => (
				<Container
					key={pageRow.pageRowId}
					fluid
					className={pageRow.backgroundColorId === BACKGROUND_COLOR_ID.WHITE ? 'bg-white' : 'bg-n50'}
				>
					<Container className={ROW_PADDING_CLASS_BY_ID[pageRow.paddingId ?? ROW_PADDING_ID.MEDIUM]}>
						{getRendererForPageRow({
							pageId: page.pageId,
							pageRow,
							contentsByTagGroupId: contentsByTagGroupId ?? {},
							tagsByTagId: tagsByTagId ?? {},
							enableAnalytics,
							livePageSiteLocations: page.livePageSiteLocations,
						})}
					</Container>
				</Container>
			))}
		</AsyncWrapper>
	);
};
