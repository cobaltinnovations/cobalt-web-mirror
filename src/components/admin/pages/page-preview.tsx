import Cookies from 'js-cookie';
import React, { useCallback, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';
import {
	AnalyticsNativeEventTypeId,
	BACKGROUND_COLOR_ID,
	Content,
	PageDetailModel,
	PageRowMailingListModel,
	ROW_TYPE_ID,
	Tag,
} from '@/lib/models';
import PageHeader from '@/components/page-header';
import { getRendererForPageRow, MailingListModal } from '@/components/admin/pages';
import { analyticsService, resourceLibraryService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { useSearchParams } from 'react-router-dom';

const ALREADY_SHOWED_SUB_MODAL = 'ALREADY_SHOWED_SUB_MODAL';

interface PagePreviewProps {
	page: PageDetailModel;
	enableAnalytics: boolean;
}

export const PagePreview = ({ page, enableAnalytics }: PagePreviewProps) => {
	const [searchParams] = useSearchParams();
	const alreadyShowedSubscribe = useMemo(() => Cookies.get(ALREADY_SHOWED_SUB_MODAL) === 'true', []);
	const subscribeParam = useMemo(() => searchParams.get('subscribe'), [searchParams]);
	const showSubscribeOnLoad = useMemo(
		() => subscribeParam === 'true' && !alreadyShowedSubscribe,
		[alreadyShowedSubscribe, subscribeParam]
	);
	const [showMailingListModal, setShowMailingListModal] = useState(showSubscribeOnLoad ? true : false);

	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, Content[]>>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();

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
				siteLocationIds: page.livePageSiteLocations.map((i) => i.siteLocationId),
			});
		}
	}, [enableAnalytics, page.livePageSiteLocations, page.pageId]);

	const mailingListRowData = page.pageSections
		.flatMap((ps) => ps.pageRows.find((pr) => pr.rowTypeId === ROW_TYPE_ID.MAILING_LIST))
		.filter(Boolean)[0] as PageRowMailingListModel | undefined;

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
					onEnter={() => Cookies.set(ALREADY_SHOWED_SUB_MODAL, 'true')}
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
			{(page.pageSections ?? []).map((ps) => (
				<Container
					key={ps.pageSectionId}
					fluid
					className={ps.backgroundColorId === BACKGROUND_COLOR_ID.WHITE ? 'bg-white' : 'bg-n50'}
				>
					<Container className="py-16">
						{(ps.headline || ps.description) && (
							<Row className="mb-16">
								<Col
									md={{ span: 10, offset: 1 }}
									lg={{ span: 8, offset: 2 }}
									xl={{ span: 6, offset: 3 }}
								>
									{ps.headline && (
										<h2
											className={classNames('text-center', {
												'mb-6': ps.description,
											})}
										>
											{ps.headline}
										</h2>
									)}
									{ps.description && <p className="mb-0 fs-large text-center">{ps.description}</p>}
								</Col>
							</Row>
						)}
						{ps.pageRows.map((r, rowIndex) => {
							const isLast = ps.pageRows.length - 1 === rowIndex;

							return (
								<React.Fragment key={r.pageRowId}>
									{getRendererForPageRow({
										pageId: page.pageId,
										pageRow: r,
										contentsByTagGroupId: contentsByTagGroupId ?? {},
										tagsByTagId: tagsByTagId ?? {},
										isLast,
										enableAnalytics,
										livePageSiteLocations: page.livePageSiteLocations,
									})}
								</React.Fragment>
							);
						})}
					</Container>
				</Container>
			))}
		</AsyncWrapper>
	);
};
