import React, { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Col, Form, Modal, ModalProps, Row } from 'react-bootstrap';
import classNames from 'classnames';
import {
	AnalyticsNativeEventTypeId,
	Content,
	ContentStatusId,
	GROUP_SESSION_STATUS_ID,
	GroupSessionsRowModel,
	isGroupSessionsRow,
	isMailingListRow,
	isOneColumnImageRow,
	isResourcesRow,
	isTagGroupRow,
	isTagRow,
	isThreeColumnImageRow,
	isTwoColumnImageRow,
	MailingListEntryTypeId,
	MailingListRowModel,
	OneColumnImageRowModel,
	PageRowMailingListModel,
	PageRowUnionModel,
	PageSiteLocationModel,
	ResourcesRowModel,
	Tag,
	TagGroupRowModel,
	TagRowModel,
	ThreeColumnImageRowModel,
	TwoColumnImageRowModel,
} from '@/lib/models';
import useHandleError from '@/hooks/use-handle-error';
import ResourceLibraryCard from '@/components/resource-library-card';
import StudioEvent from '@/components/studio-event';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import { resourceLibraryCarouselConfig } from '@/pages/resource-library';
import { WysiwygDisplay } from '@/components/wysiwyg-basic';
import { analyticsService, mailingListsService, resourceLibraryService } from '@/lib/services';
import AsyncWrapper from '@/components/async-page';
import { TopicCenterGroupSession } from '@/components/topic-center-group-session';
import InputHelper from '@/components/input-helper';
import LoadingButton from '@/components/loading-button';

interface RowRendererProps<T = PageRowUnionModel> {
	pageId: string;
	pageRow: T;
	contentsByTagGroupId: Record<string, Content[]>;
	tagsByTagId: Record<string, Tag>;
	enableAnalytics: boolean;
	livePageSiteLocations: PageSiteLocationModel[];
	className?: string;
}

const ResourcesRowRenderer = ({
	pageId,
	pageRow,
	className,
	tagsByTagId,
	enableAnalytics,
	livePageSiteLocations,
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
									siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
								});
							}}
							trackTagEvent={(tag) => {
								if (!enableAnalytics) {
									return;
								}

								analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_TAG, {
									pageId,
									tagId: tag.tagId,
									siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
	livePageSiteLocations,
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
											siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
												siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
	livePageSiteLocations,
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
							siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
						});
					}}
				/>
			</Col>
			<Col lg={9}>
				<Carousel responsive={resourceLibraryCarouselConfig} trackStyles={{ paddingTop: 16, paddingBottom: 8 }}>
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
											siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
										siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
	livePageSiteLocations,
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
								siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
							});
						}}
					/>
				</Col>
				<Col lg={9}>
					<Carousel
						responsive={resourceLibraryCarouselConfig}
						trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
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
												siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
												siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
	livePageSiteLocations,
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
								siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
	livePageSiteLocations,
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
							siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
							siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
	livePageSiteLocations,
}: RowRendererProps<ThreeColumnImageRowModel>) => {
	return (
		<Row className={className}>
			<Col xs={12} lg={4} className="mb-16 mb-lg-0">
				<img
					className="mb-10 w-100"
					src={pageRow.columnOne.imageUrl}
					alt={pageRow.columnOne.imageAltText ?? ''}
				/>
				<h3 className="mb-6 text-center">{pageRow.columnOne.headline}</h3>
				<WysiwygDisplay
					className="text-center"
					html={pageRow.columnOne.description ?? ''}
					onClick={({ linkUrl, linkText }) => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
							pageId,
							linkUrl,
							linkText,
							siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
				<h3 className="mb-6 text-center">{pageRow.columnTwo.headline}</h3>
				<WysiwygDisplay
					className="text-center"
					html={pageRow.columnTwo.description ?? ''}
					onClick={({ linkUrl, linkText }) => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
							pageId,
							linkUrl,
							linkText,
							siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
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
				<h3 className="mb-6 text-center">{pageRow.columnThree.headline}</h3>
				<WysiwygDisplay
					className="text-center"
					html={pageRow.columnThree.description ?? ''}
					onClick={({ linkUrl, linkText }) => {
						if (!enableAnalytics) {
							return;
						}

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.CLICKTHROUGH_PAGE_LINK, {
							pageId,
							linkUrl,
							linkText,
							siteLocationIds: livePageSiteLocations.map((i) => i.siteLocationId),
						});
					}}
				/>
			</Col>
		</Row>
	);
};

const MailingListRowRenderer = ({ pageRow, className, enableAnalytics }: RowRendererProps<MailingListRowModel>) => {
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!enableAnalytics) {
			return;
		}

		setIsLoading(true);

		try {
			await mailingListsService
				.addEntry({
					mailingListId: pageRow.mailingListId,
					mailingListEntryTypeId: MailingListEntryTypeId.EMAIL_ADDRESS,
					value: inputValue,
				})
				.fetch();

			setHasSubmitted(true);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Row className={className}>
			<Col md={{ span: 10, offset: 1 }} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
				{hasSubmitted ? (
					<>
						<h1 className="mb-6 text-center">You're subscribed!</h1>
						<p className="mb-0 text-center">
							The email address you entered will receive updates from this page.
						</p>
					</>
				) : (
					<>
						<h2 className="mb-6 text-center">{pageRow.title}</h2>
						<p className="mb-8 text-center">{pageRow.description}</p>
						<Form onSubmit={handleFormSubmit}>
							<fieldset disabled={isLoading || !enableAnalytics}>
								<InputHelper
									className="mb-4"
									type="email"
									label="Email address"
									value={inputValue}
									onChange={({ currentTarget }) => {
										setInputValue(currentTarget.value);
									}}
									required
								/>
								<div className="text-center">
									<LoadingButton isLoading={isLoading} size="lg" type="submit">
										Subscribe
									</LoadingButton>
								</div>
							</fieldset>
						</Form>
					</>
				)}
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
	livePageSiteLocations,
}: {
	pageId: string;
	pageRow: PageRowUnionModel;
	contentsByTagGroupId: Record<string, Content[]>;
	tagsByTagId: Record<string, Tag>;
	isLast: boolean;
	enableAnalytics: boolean;
	livePageSiteLocations: PageSiteLocationModel[];
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
					livePageSiteLocations={livePageSiteLocations}
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
					livePageSiteLocations={livePageSiteLocations}
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
					livePageSiteLocations={livePageSiteLocations}
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
					livePageSiteLocations={livePageSiteLocations}
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
					livePageSiteLocations={livePageSiteLocations}
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
					livePageSiteLocations={livePageSiteLocations}
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
					livePageSiteLocations={livePageSiteLocations}
					className={classNames({ 'mb-16': !isLast })}
				/>
			),
		},
		{
			check: isMailingListRow,
			getRow: (row: any) => (
				<MailingListRowRenderer
					pageId={pageId}
					pageRow={row}
					contentsByTagGroupId={contentsByTagGroupId}
					tagsByTagId={tagsByTagId}
					enableAnalytics={enableAnalytics}
					livePageSiteLocations={livePageSiteLocations}
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

interface MailingListModalProps extends ModalProps {
	pageRowMailingList: PageRowMailingListModel;
	enableAnalytics: boolean;
	onEnter?(): void;
}

export const MailingListModal = ({ pageRowMailingList, enableAnalytics, onEnter, ...props }: MailingListModalProps) => {
	const handleError = useHandleError();
	const [isLoading, setIsLoading] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [hasSubmitted, setHasSubmitted] = useState(false);

	const handleEntering = () => {
		setIsLoading(false);
		setInputValue('');
		setHasSubmitted(false);
		onEnter?.();
	};

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!enableAnalytics) {
			return;
		}

		setIsLoading(true);

		try {
			await mailingListsService
				.addEntry({
					mailingListId: pageRowMailingList.mailingListId,
					mailingListEntryTypeId: MailingListEntryTypeId.EMAIL_ADDRESS,
					value: inputValue,
				})
				.fetch();

			setHasSubmitted(true);
		} catch (error) {
			handleError(error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Modal centered {...props} onEntering={handleEntering}>
			<Modal.Header closeButton>
				<Modal.Title>{pageRowMailingList.title}</Modal.Title>
			</Modal.Header>
			<Form onSubmit={handleFormSubmit}>
				<fieldset disabled={isLoading || !enableAnalytics}>
					<Modal.Body>
						{hasSubmitted ? (
							<>
								<h4 className="mb-2 text-center">You're subscribed!</h4>
								<p className="mb-0 text-center">
									The email address you entered will receive updates from this page.
								</p>
							</>
						) : (
							<>
								<p>{pageRowMailingList.description}</p>
								<InputHelper
									type="email"
									label="Email address"
									value={inputValue}
									onChange={({ currentTarget }) => {
										setInputValue(currentTarget.value);
									}}
									required
								/>
							</>
						)}
					</Modal.Body>
					<Modal.Footer className="text-right">
						{hasSubmitted ? (
							<Button variant="outline-primary" type="button" onClick={props.onHide}>
								Close
							</Button>
						) : (
							<>
								<Button variant="outline-primary" type="button" onClick={props.onHide}>
									Cancel
								</Button>
								<LoadingButton className="ms-2" variant="primary" isLoading={isLoading} type="submit">
									Subscribe
								</LoadingButton>
							</>
						)}
					</Modal.Footer>
				</fieldset>
			</Form>
		</Modal>
	);
};
