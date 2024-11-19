import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import {
	CallToActionModel,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	TagGroup,
	Content,
	Tag,
	AnalyticsNativeEventTypeId,
	ContentAudienceType,
	ContentDuration,
	ContentType,
	ResourceLibrarySortColumnId,
} from '@/lib/models';
import { analyticsService, callToActionService, resourceLibraryService, screeningService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useAnalytics from '@/hooks/use-analytics';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import ResourceLibraryCard from '@/components/resource-library-card';
import InputHelperSearch from '@/components/input-helper-search';
import FloatingActionButton from '@/components/floating-action-button';
import CallToAction from '@/components/call-to-action';
import TabBar from '@/components/tab-bar';
import ScreeningFlowCta from '@/components/screening-flow-cta';
import MegaFilter, { FILTER_TYPE } from '@/components/mega-filter';
import NoData from '@/components/no-data';

export const resourceLibraryCarouselConfig = {
	externalMonitor: {
		breakpoint: { max: 3000, min: 1201 },
		items: 2,
		partialVisibilityGutter: 60,
	},
	desktopExtraLarge: {
		breakpoint: { max: 1200, min: 993 },
		items: 2,
		partialVisibilityGutter: 40,
	},
	desktop: {
		breakpoint: { max: 992, min: 769 },
		items: 2,
		partialVisibilityGutter: 0,
	},
	tablet: {
		breakpoint: { max: 768, min: 575 },
		items: 2,
		partialVisibilityGutter: 0,
	},
	mobile: {
		breakpoint: { max: 575, min: 0 },
		items: 1,
		partialVisibilityGutter: 0,
	},
};

const ResourceLibrary = () => {
	const { mixpanel } = useAnalytics();
	const { institution } = useAccount();

	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = useMemo(() => searchParams.get('searchQuery') ?? '', [searchParams]);
	const recommendedContent = useMemo(() => searchParams.get('recommended') === 'true', [searchParams]);
	const contentAudienceTypeIdQuery = useMemo(() => searchParams.get('contentAudienceTypeId') ?? '', [searchParams]);
	const tagIdQuery = useMemo(() => searchParams.getAll('tagId'), [searchParams]);
	const contentTypeIdQuery = useMemo(() => searchParams.getAll('contentTypeId'), [searchParams]);
	const contentDurationIdQuery = useMemo(() => searchParams.getAll('contentDurationId'), [searchParams]);
	const resourceLibrarySortColumnIdQuery = useMemo(
		() => searchParams.get('resourceLibrarySortColumnId') ?? '',
		[searchParams]
	);

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [hasCompletedScreening, setHasCompletedScreening] = useState(false);
	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);
	const [searchInputValue, setSearchInputValue] = useState('');

	const [contentAudienceTypes, setContentAudienceTypes] = useState<ContentAudienceType[]>([]);
	const [contentDurations, setContentDurations] = useState<ContentDuration[]>([]);
	const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
	const [resourceLibrarySortColumnIds, setResourceLibrarySortColumnIds] = useState<ResourceLibrarySortColumnId[]>([]);
	const [tagGroups, setTagGroups] = useState<TagGroup[]>([]);
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();

	const [contents, setContents] = useState<Content[]>([]);
	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, Content[]>>();

	const hasFilterQueryParms = useMemo(
		() =>
			!!searchQuery ||
			!!contentAudienceTypeIdQuery ||
			tagIdQuery.length > 0 ||
			contentTypeIdQuery.length > 0 ||
			contentDurationIdQuery.length > 0 ||
			!!resourceLibrarySortColumnIdQuery,
		[
			contentAudienceTypeIdQuery,
			contentDurationIdQuery.length,
			contentTypeIdQuery.length,
			resourceLibrarySortColumnIdQuery,
			searchQuery,
			tagIdQuery.length,
		]
	);

	useEffect(() => {
		if (!hasTouchScreen) {
			searchInputRef.current?.focus({ preventScroll: true });
		}
	}, [hasTouchScreen]);

	const fetchCallsToAction = useCallback(async () => {
		const response = await callToActionService
			.getCallsToAction({ callToActionDisplayAreaId: CALL_TO_ACTION_DISPLAY_AREA_ID.CONTENT_LIST })
			.fetch();

		setCallsToAction(response.callsToAction);
	}, []);

	const fetchFilters = useCallback(async () => {
		const response = await resourceLibraryService.getResourceLibraryFilters().fetch();

		setContentAudienceTypes(response.contentAudienceTypes);
		setContentDurations(response.contentDurations);
		setContentTypes(response.contentTypes);
		setResourceLibrarySortColumnIds(response.resourceLibrarySortColumnIds);
		setTagGroups(response.tagGroups);
		setTagsByTagId(
			response.tagGroups
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
	}, []);

	const checkScreenFlowStatus = useCallback(async () => {
		if (!institution?.contentScreeningFlowId) {
			return;
		}

		const { sessionFullyCompleted } = await screeningService
			.getScreeningFlowCompletionStatusByScreeningFlowId(institution.contentScreeningFlowId)
			.fetch();

		setHasCompletedScreening(sessionFullyCompleted);
	}, [institution?.contentScreeningFlowId]);

	const fetchData = useCallback(async () => {
		const queryParams = {
			contentAudienceTypeId: contentAudienceTypeIdQuery,
			contentDurationId: contentDurationIdQuery,
			contentTypeId: contentTypeIdQuery,
			pageNumber: 0,
			pageSize: 100,
			resourceLibrarySortColumnId: resourceLibrarySortColumnIdQuery,
			searchQuery,
			tagId: tagIdQuery,
		};

		if (searchQuery) {
			setSearchInputValue(searchQuery);

			const searchResponse = await resourceLibraryService.searchResourceLibrary(queryParams).fetch();

			setContents(searchResponse.findResult.contents);
			setContentsByTagGroupId(undefined);

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY, {
				mode: 'SEARCH',
				searchQuery: searchQuery,
				totalCount: searchResponse.findResult.totalCount,
			});

			return;
		}

		if (recommendedContent) {
			const recommendedResponse = await resourceLibraryService
				.getResourceLibraryRecommendedContent(queryParams)
				.fetch();

			setContents(recommendedResponse.findResult.contents);
			setContentsByTagGroupId(undefined);

			analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY, {
				mode: 'RECOMMENDED',
				totalCount: recommendedResponse.findResult.totalCount,
			});

			return;
		}

		const response = await resourceLibraryService.getResourceLibrary().fetch();

		setContents([]);
		setContentsByTagGroupId(response.contentsByTagGroupId);

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY, {
			mode: 'DEFAULT',
		});
	}, [
		contentAudienceTypeIdQuery,
		contentDurationIdQuery,
		contentTypeIdQuery,
		recommendedContent,
		resourceLibrarySortColumnIdQuery,
		searchQuery,
		tagIdQuery,
	]);

	const applyValuesToSearchParam = (values: string[], searchParam: string) => {
		searchParams.delete(searchParam);

		for (const value of values) {
			searchParams.append(searchParam, value);
		}

		setSearchParams(searchParams, { replace: true });
	};

	const handleClearFiltersButtonClick = useCallback(() => {
		searchParams.delete('searchQuery');
		searchParams.delete('contentAudienceTypeId');
		searchParams.delete('tagId');
		searchParams.delete('resourceLibrarySortColumnId');
		searchParams.delete('contentTypeId');
		searchParams.delete('contentDurationId');
		searchParams.delete('contentAudienceTypeId');

		setSearchInputValue('');
		setSearchParams(searchParams, { replace: true });
	}, [searchParams, setSearchParams]);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		searchParams.delete('recommended');

		if (searchInputValue) {
			searchParams.set('searchQuery', searchInputValue);
		} else {
			searchParams.delete('searchQuery');
		}

		setSearchParams(searchParams, { replace: true });

		if (hasTouchScreen) {
			searchInputRef.current?.blur();
		}
	};

	const clearSearch = useCallback(() => {
		setSearchInputValue('');

		searchParams.delete('searchQuery');
		setSearchParams(searchParams, { replace: true });

		if (!hasTouchScreen) {
			searchInputRef.current?.focus({ preventScroll: true });
		}
	}, [hasTouchScreen, searchParams, setSearchParams]);

	const handleKeydown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key !== 'Escape') {
				return;
			}

			clearSearch();
		},
		[clearSearch]
	);

	useEffect(() => {
		document.addEventListener('keydown', handleKeydown, false);

		return () => {
			document.removeEventListener('keydown', handleKeydown, false);
		};
	}, [handleKeydown]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Resource Library</title>
			</Helmet>

			<HeroContainer className="bg-n75">
				<h1 className="mb-4 text-center">Resource Library</h1>
				<p className="mb-6 text-center fs-large">
					A variety of self-directed digital resources, including articles, podcasts, apps, videos, worksheets
					and more, that help support general wellness and mental health education.
				</p>
				<Form onSubmit={handleSearchFormSubmit}>
					<InputHelperSearch
						ref={searchInputRef}
						placeholder="Search Resources"
						value={searchInputValue}
						onChange={({ currentTarget }) => {
							setSearchInputValue(currentTarget.value);
						}}
						onClear={clearSearch}
					/>
				</Form>
			</HeroContainer>

			<AsyncPage fetchData={fetchCallsToAction}>
				{callsToAction.length > 0 && (
					<Container className="pt-16">
						<Row>
							<Col>
								{callsToAction.map((cta, index) => {
									const isLast = callsToAction.length - 1 === index;
									return (
										<CallToAction
											key={`cta-${index}`}
											className={!isLast ? 'mb-4' : ''}
											callToAction={cta}
										/>
									);
								})}
							</Col>
						</Row>
					</Container>
				)}
			</AsyncPage>

			{institution?.userSubmittedContentEnabled && (
				<FloatingActionButton
					onClick={() => {
						mixpanel.track('Patient-Sourced Add Content Click', {});
						navigate('/cms/on-your-time/create');
					}}
				/>
			)}

			<AsyncPage fetchData={fetchFilters}>
				<Container className="pt-9 pb-5">
					<Row>
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<div></div>
								<div className="d-flex align-items-center justify-content-center">
									<div className="d-flex align-items-center">
										<span className="me-2">Show resources for</span>
										<MegaFilter
											className="me-2"
											allowCollapse={false}
											displayFooter={false}
											applyOnChange
											buttonTitle="Anyone"
											modalTitle="Show resources for..."
											value={[
												{
													id: 'contentAudienceTypeId',
													filterType: FILTER_TYPE.RADIO,
													title: 'Show resources for...',
													value: searchParams.getAll('contentAudienceTypeId'),
													options: contentAudienceTypes.map((cat) => ({
														value: cat.contentAudienceTypeId,
														title: cat.description,
													})),
												},
											]}
											onChange={(filters) => {
												filters.forEach((filter) => {
													applyValuesToSearchParam(filter.value, filter.id);
												});
											}}
										/>
									</div>
									<div className="d-flex align-items-center">
										<span className="me-2">related to</span>
										<MegaFilter
											buttonTitle="Topics"
											modalTitle="Topics"
											value={tagGroups.map((tagGroup) => ({
												id: tagGroup.tagGroupId,
												filterType: FILTER_TYPE.CHECKBOX,
												title: tagGroup.name,
												value: searchParams
													.getAll('tagId')
													.filter((v) => (tagGroup.tags ?? []).find((t) => t.tagId === v)),
												options: (tagGroup.tags ?? []).map((tag) => ({
													value: tag.tagId,
													title: tag.name,
												})),
											}))}
											onChange={(filters) => {
												applyValuesToSearchParam(filters.map((f) => f.value).flat(), 'tagId');
											}}
										/>
									</div>
								</div>
								<div>
									<MegaFilter
										buttonTitle="More filters"
										modalTitle="More filters"
										value={[
											{
												id: 'resourceLibrarySortColumnId',
												filterType: FILTER_TYPE.RADIO,
												title: 'Sort By',
												value: searchParams.getAll('resourceLibrarySortColumnId'),
												options: resourceLibrarySortColumnIds.map((rlscid) => ({
													value: rlscid.resourceLibrarySortColumnId,
													title: rlscid.description,
												})),
											},
											{
												id: 'contentTypeId',
												filterType: FILTER_TYPE.CHECKBOX,
												title: 'Type',
												value: searchParams.getAll('contentTypeId'),
												options: contentTypes.map((ct) => ({
													value: ct.contentTypeId,
													title: ct.description,
												})),
											},
											{
												id: 'contentDurationId',
												filterType: FILTER_TYPE.CHECKBOX,
												title: 'Duration',
												value: searchParams.getAll('contentDurationId'),
												options: contentDurations.map((cd) => ({
													value: cd.contentDurationId,
													title: cd.description,
												})),
											},
										]}
										onChange={(filters) => {
											filters.forEach((filter) => {
												applyValuesToSearchParam(filter.value, filter.id);
											});
										}}
									/>
								</div>
							</div>
						</Col>
					</Row>
				</Container>
			</AsyncPage>

			{hasFilterQueryParms ? (
				<AsyncPage fetchData={fetchData}>
					<Container className="pb-6 pb-lg-32">
						{contents.length <= 0 ? (
							<Row className="pt-12 pb-24">
								<Col>
									<NoData
										title="No Results"
										description="Try adjusting your filters to see available content"
										actions={[
											{
												variant: 'outline-primary',
												title: 'Clear Filters',
												onClick: handleClearFiltersButtonClick,
											},
										]}
									/>
								</Col>
							</Row>
						) : (
							<Row>
								{contents.map((content, resourceIndex) => {
									return (
										<Col key={resourceIndex} xs={12} md={6} lg={4} className="mb-8">
											<ResourceLibraryCard
												linkTo={`/resource-library/${content.contentId}`}
												className="h-100"
												imageUrl={content.imageUrl}
												badgeTitle={content.newFlag ? 'New' : ''}
												title={content.title}
												author={content.author}
												description={content.description}
												tags={
													tagsByTagId
														? content.tagIds
																.map((tagId) => {
																	return tagsByTagId?.[tagId] ?? null;
																})
																.filter(Boolean)
														: []
												}
												contentTypeId={content.contentTypeId}
												duration={content.durationInMinutesDescription}
											/>
										</Col>
									);
								})}
							</Row>
						)}
					</Container>
				</AsyncPage>
			) : (
				<Container>
					{institution?.recommendedContentEnabled && (
						<Row className="mb-6">
							<Col>
								<TabBar
									key="resource-library-tabbar"
									value={recommendedContent ? 'FOR_YOU' : 'ALL'}
									tabs={[
										{ value: 'ALL', title: 'All' },
										{ value: 'FOR_YOU', title: 'For You' },
									]}
									onTabClick={(value) => {
										searchParams.delete('searchQuery');
										searchParams.delete('tagId');
										searchParams.delete('contentTypeId');
										searchParams.delete('contentDurationId');

										if (value === 'ALL') {
											searchParams.delete('recommended');
										} else {
											searchParams.set('recommended', 'true');
										}

										setHasCompletedScreening(false);
										setSearchParams(searchParams, { replace: true });
									}}
								/>
							</Col>
						</Row>
					)}
					{recommendedContent ? (
						<AsyncPage fetchData={checkScreenFlowStatus}>
							{!hasCompletedScreening ? (
								<Row>
									<Col>
										<ScreeningFlowCta className="bg-n75 border-0" buttonVariant="outline-primary" />
									</Col>
								</Row>
							) : (
								<AsyncPage fetchData={fetchData}>
									{contents.length <= 0 ? (
										<>
											{hasFilterQueryParms ? (
												<Row className="pt-12 pb-24">
													<Col>
														<h2 className="mb-6 text-muted text-center">No Results</h2>
														<p className="mb-6 fs-large text-muted text-center">
															Try adjusting your filters to see available content
														</p>
														<div className="text-center">
															<Button
																size="lg"
																variant="outline-primary"
																onClick={handleClearFiltersButtonClick}
															>
																Clear Filters
															</Button>
														</div>
													</Col>
												</Row>
											) : (
												<Row className="mb-24">
													<Col>
														<div className="bg-n75 rounded p-12">
															<Row>
																<Col lg={{ span: 6, offset: 3 }}>
																	<h2 className="mb-6 text-muted text-center">
																		No recommendations at this time
																	</h2>
																	<p className="mb-0 fs-large text-muted text-center">
																		We are continually adding more resources to the
																		library. In the meantime, you can browse
																		resources related to{' '}
																		<Link to="/resource-library/tag-groups/symptoms">
																			Symptoms
																		</Link>
																		,{' '}
																		<Link to="/resource-library/tag-groups/work-life">
																			Work Life
																		</Link>
																		,{' '}
																		<Link to="/resource-library/tag-groups/personal-life">
																			Personal Life
																		</Link>
																		,{' '}
																		<Link to="/resource-library/tag-groups/identity">
																			Identity
																		</Link>
																		,{' '}
																		<Link to="/resource-library/tag-groups/caretaking">
																			Caretaking
																		</Link>
																		, and{' '}
																		<Link to="/resource-library/tag-groups/world-events">
																			World Events
																		</Link>
																	</p>
																</Col>
															</Row>
														</div>
													</Col>
												</Row>
											)}
										</>
									) : (
										<Row>
											{contents.map((content, resourceIndex) => {
												return (
													<Col key={resourceIndex} xs={12} md={6} lg={4} className="mb-8">
														<ResourceLibraryCard
															linkTo={`/resource-library/${content.contentId}`}
															className="h-100"
															imageUrl={content.imageUrl}
															badgeTitle={content.newFlag ? 'New' : ''}
															title={content.title}
															author={content.author}
															description={content.description}
															tags={
																tagsByTagId
																	? content.tagIds
																			.map((tagId) => {
																				return tagsByTagId?.[tagId] ?? null;
																			})
																			.filter(Boolean)
																	: []
															}
															contentTypeId={content.contentTypeId}
															duration={content.durationInMinutesDescription}
														/>
													</Col>
												);
											})}
										</Row>
									)}
								</AsyncPage>
							)}
						</AsyncPage>
					) : (
						<AsyncPage fetchData={fetchData}>
							{tagGroups.map((tagGroup) => {
								return (
									<Row key={tagGroup.tagGroupId} className="mb-11 mb-lg-18">
										<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
											<ResourceLibrarySubtopicCard
												className="h-100"
												colorId={tagGroup.colorId}
												title={tagGroup.name}
												description={tagGroup.description}
												to={`/resource-library/tag-groups/${tagGroup.urlName}`}
											/>
										</Col>
										<Col lg={9}>
											<Carousel
												responsive={resourceLibraryCarouselConfig}
												trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
												floatingButtonGroup
											>
												{(contentsByTagGroupId?.[tagGroup.tagGroupId] ?? []).map((content) => {
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
															tags={
																tagsByTagId
																	? content.tagIds
																			.map((tagId) => {
																				return tagsByTagId?.[tagId] ?? null;
																			})
																			.filter(Boolean)
																	: []
															}
															contentTypeId={content.contentTypeId}
															duration={content.durationInMinutesDescription}
														/>
													);
												})}
											</Carousel>
										</Col>
									</Row>
								);
							})}
						</AsyncPage>
					)}
				</Container>
			)}
		</>
	);
};

export default ResourceLibrary;
