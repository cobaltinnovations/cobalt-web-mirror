import React, { useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';
import { AnalyticsNativeEventTypeId, BACKGROUND_COLOR_ID, Content, PageDetailModel, Tag } from '@/lib/models';
import PageHeader from '@/components/page-header';
import { getRendererForPageRow } from '@/components/admin/pages';
import { analyticsService, resourceLibraryService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';

interface PagePreviewProps {
	page: PageDetailModel;
	enableAnalytics: boolean;
}

export const PagePreview = ({ page, enableAnalytics }: PagePreviewProps) => {
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
			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_PAGE, { pageId: page.pageId });
		}
	}, [enableAnalytics, page.pageId]);

	return (
		<AsyncWrapper fetchData={fetchData}>
			<PageHeader
				className="bg-p700 text-white"
				title={<h1>{page.headline ?? 'No hero headline'}</h1>}
				descriptionHtml={page.description ?? 'No hero description'}
				imageAlt={page.imageAltText ?? ''}
				imageUrl={page.imageUrl ?? ''}
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
