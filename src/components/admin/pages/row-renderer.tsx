import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import {
	AnalyticsNativeEventTypeId,
	Content,
	ContentStatusId,
	GROUP_SESSION_STATUS_ID,
	GroupSessionsRowModel,
	isGroupSessionsRow,
	isOneColumnImageRow,
	isResourcesRow,
	isTagGroupRow,
	isTagRow,
	isThreeColumnImageRow,
	isTwoColumnImageRow,
	OneColumnImageRowModel,
	PageRowUnionModel,
	ResourcesRowModel,
	Tag,
	TagGroupRowModel,
	TagRowModel,
	ThreeColumnImageRowModel,
	TwoColumnImageRowModel,
} from '@/lib/models';
import ResourceLibraryCard from '@/components/resource-library-card';
import StudioEvent from '@/components/studio-event';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import { resourceLibraryCarouselConfig } from '@/pages/resource-library';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { analyticsService, resourceLibraryService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { TopicCenterGroupSession } from '@/components/topic-center-group-session';

interface RowRendererProps<T = PageRowUnionModel> {
	pageId: string;
	pageRow: T;
	contentsByTagGroupId: Record<string, Content[]>;
	tagsByTagId: Record<string, Tag>;
	enableAnalytics: boolean;
	className?: string;
}

const ResourcesRowRenderer = ({
	pageId,
	pageRow,
	className,
	tagsByTagId,
	enableAnalytics,
}: RowRendererProps<ResourcesRowModel>) => {
	return (
		<Row className={className}>
			{pageRow.contents.map((content) => {
				const expired = content.contentStatusId !== ContentStatusId.LIVE;

				return (
					<Col key={content.contentId} xs={12} md={6} lg={4} className="mb-8">
						<ResourceLibraryCard
							key={content.contentId}
							expired={expired}
							linkTo={`/resource-library/${content.contentId}`}
							className="h-100"
							imageUrl={content.imageUrl}
							badgeTitle={content.newFlag ? 'New' : ''}
							title={content.title}
							author={content.author}
							description={content.description}
							tags={content.tagIds.map((tagId) => tagsByTagId?.[tagId] ?? null).filter(Boolean)}
							contentTypeId={content.contentTypeId}
							duration={content.durationInMinutesDescription}
							trackEvent={() => {
								if (!enableAnalytics) {
									return;
								}

								analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_CONTENT, {
									pageId,
									contentId: content.contentId,
								});
							}}
							trackTagEvent={(tag) => {
								if (!enableAnalytics) {
									return;
								}

								analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_TAG, {
									pageId,
									tagId: tag.tagId,
								});
							}}
						/>
					</Col>
				);
			})}
		</Row>
	);
};

const GroupSessionsRowRenderer = ({
	pageId,
	pageRow,
	className,
	enableAnalytics,
}: RowRendererProps<GroupSessionsRowModel>) => {
	const navigate = useNavigate();

	return (
		<Row className={className}>
			{pageRow.groupSessions.length < 3 ? (
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
					{pageRow.groupSessions.map((groupSession, groupSessionIndex) => {
						const isLast = pageRow.groupSessions.length - 1 === groupSessionIndex;
						const expired = groupSession.groupSessionStatusId !== GROUP_SESSION_STATUS_ID.ADDED;

						return (
							<TopicCenterGroupSession
								key={groupSession.groupSessionId}
								expired={expired}
								className={classNames({
									'mb-8': !isLast,
								})}
								title={groupSession.title}
								titleSecondary={groupSession.appointmentTimeDescription}
								titleTertiary={`with ${groupSession.facilitatorName}`}
								description={groupSession.description}
								badgeTitle={
									groupSession.seatsAvailable && groupSession.seatsAvailable <= 20
										? groupSession.seatsAvailableDescription
										: ''
								}
								buttonTitle="Learn More"
								onClick={() => {
									navigate(`/group-sessions/${groupSession.urlName}`);

									if (!enableAnalytics) {
										return;
									}

									analyticsService.persistEvent(
										AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_GROUP_SESSION,
										{
											pageId,
											groupSessionId: groupSession.groupSessionId,
										}
									);
								}}
								imageUrl={groupSession.imageUrl}
							/>
						);
					})}
				</Col>
			) : (
				<>
					{pageRow.groupSessions.map((groupSession) => {
						const expired = groupSession.groupSessionStatusId !== GROUP_SESSION_STATUS_ID.ADDED;

						return (
							<Col key={groupSession.groupSessionId} xs={12} md={6} lg={4} className="mb-8">
								<Link
									className="d-block text-decoration-none h-100"
									to={`/group-sessions/${groupSession.urlName}`}
									onClick={() => {
										if (!enableAnalytics) {
											return;
										}

										analyticsService.persistEvent(
											AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_GROUP_SESSION,
											{
												pageId,
												groupSessionId: groupSession.groupSessionId,
											}
										);
									}}
								>
									<StudioEvent className="h-100" expired={expired} studioEvent={groupSession} />
								</Link>
							</Col>
						);
					})}
				</>
			)}
		</Row>
	);
};

const TagGroupRowRenderer = ({
	pageId,
	pageRow,
	className,
	contentsByTagGroupId,
	tagsByTagId,
	enableAnalytics,
}: RowRendererProps<TagGroupRowModel>) => {
	return (
		<Row className={className}>
			<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
				<ResourceLibrarySubtopicCard
					className="h-100"
					colorId={pageRow.tagGroup.colorId}
					title={pageRow.tagGroup.name}
					description={pageRow.tagGroup.description}
					to={`/resource-library/tag-groups/${pageRow.tagGroup.urlName}`}
					onClick={() => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_TAG_GROUP, {
							pageId,
							tagId: pageRow.tagGroup.tagGroupId,
						});
					}}
				/>
			</Col>
			<Col lg={9}>
				<Carousel
					responsive={resourceLibraryCarouselConfig}
					trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
					floatingButtonGroup
				>
					{(contentsByTagGroupId?.[pageRow.tagGroup.tagGroupId] ?? []).map((content) => {
						return (
							<ResourceLibraryCard
								key={content.contentId}
								linkTo={`/resource-library/${content.contentId}`}
								className="h-100"
								imageUrl={content.imageUrl}
								badgeTitle={content.newFlag ? 'New' : ''}
								title={content.title}
								author={content.author}
								description={content.description}
								tags={content.tagIds.map((tagId) => tagsByTagId?.[tagId] ?? null).filter(Boolean)}
								contentTypeId={content.contentTypeId}
								duration={content.durationInMinutesDescription}
								trackEvent={() => {
									if (!enableAnalytics) {
										return;
									}

									analyticsService.persistEvent(
										AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_CONTENT,
										{
											pageId,
											contentId: content.contentId,
										}
									);
								}}
								trackTagEvent={(tag) => {
									if (!enableAnalytics) {
										return;
									}

									analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_TAG, {
										pageId,
										tagId: tag.tagId,
									});
								}}
							/>
						);
					})}
				</Carousel>
			</Col>
		</Row>
	);
};

const TagRowRenderer = ({
	pageId,
	pageRow,
	className,
	tagsByTagId,
	enableAnalytics,
}: RowRendererProps<TagRowModel>) => {
	const [content, setContent] = useState<Content[]>([]);

	const fetchContent = useCallback(async () => {
		if (!pageRow.tag.urlName) {
			throw new Error('pageRow.tag.urlName is undefined.');
		}

		const { findResult } = await resourceLibraryService
			.getResourceLibraryContentByUrlName(pageRow.tag.urlName, {
				pageNumber: 0,
				pageSize: 200,
			})
			.fetch();

		setContent(findResult.contents);
	}, [pageRow.tag.urlName]);

	return (
		<AsyncWrapper fetchData={fetchContent}>
			<Row className={className}>
				<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
					<ResourceLibrarySubtopicCard
						className="h-100"
						colorId={pageRow.tagGroupColorId}
						title={pageRow.tag.name}
						description={pageRow.tag.description}
						to={`/resource-library/tags/${pageRow.tag.urlName}`}
						onClick={() => {
							if (!enableAnalytics) {
								return;
							}

							analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_TAG, {
								pageId,
								tagId: pageRow.tag.tagId,
							});
						}}
					/>
				</Col>
				<Col lg={9}>
					<Carousel
						responsive={resourceLibraryCarouselConfig}
						trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
						floatingButtonGroup
					>
						{content.map((content) => {
							return (
								<ResourceLibraryCard
									key={content.contentId}
									linkTo={`/resource-library/${content.contentId}`}
									className="h-100"
									imageUrl={content.imageUrl}
									badgeTitle={content.newFlag ? 'New' : ''}
									title={content.title}
									author={content.author}
									description={content.description}
									tags={content.tagIds.map((tagId) => tagsByTagId?.[tagId] ?? null).filter(Boolean)}
									contentTypeId={content.contentTypeId}
									duration={content.durationInMinutesDescription}
									trackEvent={() => {
										if (!enableAnalytics) {
											return;
										}

										analyticsService.persistEvent(
											AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_CONTENT,
											{
												pageId,
												contentId: content.contentId,
											}
										);
									}}
									trackTagEvent={(tag) => {
										if (!enableAnalytics) {
											return;
										}

										analyticsService.persistEvent(
											AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_TAG,
											{
												pageId,
												tagId: tag.tagId,
											}
										);
									}}
								/>
							);
						})}
					</Carousel>
				</Col>
			</Row>
		</AsyncWrapper>
	);
};

const OneColRowRenderer = ({
	pageId,
	pageRow,
	className,
	enableAnalytics,
}: RowRendererProps<OneColumnImageRowModel>) => {
	return (
		<Row className={classNames('align-items-center', className)}>
			<Col xs={12} lg={6} className="mb-10 mb-lg-0">
				{pageRow.columnOne.imageUrl && (
					<img
						className="w-100"
						src={pageRow.columnOne.imageUrl}
						alt={pageRow.columnOne.imageAltText ?? ''}
					/>
				)}
			</Col>
			<Col xs={12} lg={6}>
				{pageRow.columnOne.headline && (
					<h3 className={classNames({ 'mb-6': pageRow.columnOne.description })}>
						{pageRow.columnOne.headline}
					</h3>
				)}
				{pageRow.columnOne.description && (
					<WysiwygDisplay
						html={pageRow.columnOne.description ?? ''}
						onClick={({ linkUrl, linkText }) => {
							if (!enableAnalytics) {
								return;
							}

							analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
								pageId,
								linkUrl,
								linkText,
							});
						}}
					/>
				)}
			</Col>
		</Row>
	);
};

const TwoColRowRenderer = ({
	pageId,
	pageRow,
	className,
	enableAnalytics,
}: RowRendererProps<TwoColumnImageRowModel>) => {
	return (
		<Row className={className}>
			<Col xs={12} lg={6} className="mb-16 mb-lg-0">
				<img
					className="mb-10 w-100"
					src={pageRow.columnOne.imageUrl}
					alt={pageRow.columnOne.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnOne.headline}</h3>
				<WysiwygDisplay
					html={pageRow.columnOne.description ?? ''}
					onClick={({ linkUrl, linkText }) => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
							pageId,
							linkUrl,
							linkText,
						});
					}}
				/>
			</Col>
			<Col xs={12} lg={6}>
				<img
					className="mb-10 w-100"
					src={pageRow.columnTwo.imageUrl}
					alt={pageRow.columnTwo.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnTwo.headline}</h3>
				<WysiwygDisplay
					html={pageRow.columnTwo.description ?? ''}
					onClick={({ linkUrl, linkText }) => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
							pageId,
							linkUrl,
							linkText,
						});
					}}
				/>
			</Col>
		</Row>
	);
};

const ThreeColRowRenderer = ({
	pageId,
	pageRow,
	className,
	enableAnalytics,
}: RowRendererProps<ThreeColumnImageRowModel>) => {
	return (
		<Row className={className}>
			<Col xs={12} lg={4} className="mb-16 mb-lg-0">
				<img
					className="mb-10 w-100"
					src={pageRow.columnOne.imageUrl}
					alt={pageRow.columnOne.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnOne.headline}</h3>
				<WysiwygDisplay
					html={pageRow.columnOne.description ?? ''}
					onClick={({ linkUrl, linkText }) => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
							pageId,
							linkUrl,
							linkText,
						});
					}}
				/>
			</Col>
			<Col xs={12} lg={4} className="mb-16 mb-lg-0">
				<img
					className="mb-10 w-100"
					src={pageRow.columnTwo.imageUrl}
					alt={pageRow.columnTwo.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnTwo.headline}</h3>
				<WysiwygDisplay
					html={pageRow.columnTwo.description ?? ''}
					onClick={({ linkUrl, linkText }) => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
							pageId,
							linkUrl,
							linkText,
						});
					}}
				/>
			</Col>
			<Col xs={12} lg={4}>
				<img
					className="mb-10 w-100"
					src={pageRow.columnThree.imageUrl}
					alt={pageRow.columnThree.imageAltText ?? ''}
				/>
				<h3 className="mb-6">{pageRow.columnThree.headline}</h3>
				<WysiwygDisplay
					html={pageRow.columnThree.description ?? ''}
					onClick={({ linkUrl, linkText }) => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
							pageId,
							linkUrl,
							linkText,
						});
					}}
				/>
			</Col>
		</Row>
	);
};

export const getRendererForPageRow = ({
	pageId,
	pageRow,
	contentsByTagGroupId,
	tagsByTagId,
	isLast,
	enableAnalytics,
}: {
	pageId: string;
	pageRow: PageRowUnionModel;
	contentsByTagGroupId: Record<string, Content[]>;
	tagsByTagId: Record<string, Tag>;
	isLast: boolean;
	enableAnalytics: boolean;
}) => {
	const rowTypeMap = [
		{
			check: isResourcesRow,
			getRow: (row: any) => (
				<ResourcesRowRenderer
					pageId={pageId}
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					enableAnalytics={enableAnalytics}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isGroupSessionsRow,
			getRow: (row: any) => (
				<GroupSessionsRowRenderer
					pageId={pageId}
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					enableAnalytics={enableAnalytics}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isTagGroupRow,
			getRow: (row: any) => (
				<TagGroupRowRenderer
					pageId={pageId}
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					enableAnalytics={enableAnalytics}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isTagRow,
			getRow: (row: any) => (
				<TagRowRenderer
					pageId={pageId}
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					enableAnalytics={enableAnalytics}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isOneColumnImageRow,
			getRow: (row: any) => (
				<OneColRowRenderer
					pageId={pageId}
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					enableAnalytics={enableAnalytics}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isTwoColumnImageRow,
			getRow: (row: any) => (
				<TwoColRowRenderer
					pageId={pageId}
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					enableAnalytics={enableAnalytics}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isThreeColumnImageRow,
			getRow: (row: any) => (
				<ThreeColRowRenderer
					pageId={pageId}
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					enableAnalytics={enableAnalytics}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
	];

	for (const { check, getRow } of rowTypeMap) {
		if (check(pageRow)) {
			return getRow(pageRow);
		}
	}

	return null;
};
