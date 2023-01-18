import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import classNames from 'classnames';

import {
	CallToActionModel,
	CALL_TO_ACTION_DISPLAY_AREA_ID,
	ContentDurationFilterModel,
	ContentTypeFilterModel,
	ResourceLibraryContentModel,
	TagGroupModel,
	TagModel,
} from '@/lib/models';
import { callToActionService, resourceLibraryService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useAnalytics from '@/hooks/use-analytics';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import { useScreeningFlow } from './screening/screening.hooks';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import ResourceLibraryCard from '@/components/resource-library-card';
import InputHelperSearch from '@/components/input-helper-search';
import ActionSheet from '@/components/action-sheet';
import CallToAction from '@/components/call-to-action';
import TabBar from '@/components/tab-bar';
import SimpleFilter from '@/components/simple-filter';
import { AddOrRemoveValueFromArray } from '@/lib/utils/form-utils';

const carouselConfig = {
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
	const { didCheckScreeningSessions, startScreeningFlow } = useScreeningFlow(
		institution?.contentScreeningFlowId,
		false
	);

	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get('searchQuery') ?? '';
	const recommendedContent = useMemo(() => searchParams.get('recommended') === 'true', [searchParams]);
	const tagIdQuery = useMemo(() => searchParams.getAll('tagId'), [searchParams]);
	const contentTypeIdQuery = useMemo(() => searchParams.getAll('contentTypeId'), [searchParams]);
	const contentDurationIdQuery = useMemo(() => searchParams.getAll('contentDurationId'), [searchParams]);

	const { hasTouchScreen } = useTouchScreenCheck();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [callsToAction, setCallsToAction] = useState<CallToActionModel[]>([]);
	const [searchInputValue, setSearchInputValue] = useState('');
	const [tagGroups, setTagGroups] = useState<TagGroupModel[]>([]);
	const [contents, setContents] = useState<ResourceLibraryContentModel[]>([]);
	const [findResultTotalCount, setFindResultTotalCount] = useState(0);
	const [findResultTotalCountDescription, setFindResultTotalCountDescription] = useState('');
	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, ResourceLibraryContentModel[]>>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();
	// Topic Filter
	const [tagGroupFilters, setTagGroupFilters] = useState<TagGroupModel[]>([]);
	const [tagFilters, setTagFilters] = useState<Record<string, TagModel[]>>();
	const [tagFilterIsShowing, setTagFilterIsShowing] = useState(false);
	const [tagFilterValue, setTagFilterValue] = useState<string[]>([]);
	// Content Type Filter
	const [contentTypeFilters, setContentTypeFilters] = useState<ContentTypeFilterModel[]>([]);
	const [contentTypeFilterIsShowing, setContentTypeFilterIsShowing] = useState(false);
	const [contentTypeFilterValue, setContentTypeFilterValue] = useState<string[]>([]);
	// Content Duration Filter
	const [contentDurationFilters, setContentDurationFilters] = useState<ContentDurationFilterModel[]>([]);
	const [contentDurationFilterIsShowing, setContentDurationFilterIsShowing] = useState(false);
	const [contentDurationFilterValue, setContentDurationFilterValue] = useState<string[]>([]);
	const hasFilterQueryParms = useMemo(
		() => tagIdQuery.length > 0 || contentTypeIdQuery.length > 0 || contentDurationIdQuery.length > 0,
		[contentDurationIdQuery.length, contentTypeIdQuery.length, tagIdQuery.length]
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

	const fetchRecommendedFilters = useCallback(async () => {
		const response = await resourceLibraryService
			.getResourceLibraryRecommendedContent({ pageNumber: 0, pageSize: 0 })
			.fetch();

		const tagsByTagGroupId: Record<string, TagModel[]> = {};
		Object.values(response.tagsByTagId).forEach((tag) => {
			if (tagsByTagGroupId[tag.tagGroupId]) {
				tagsByTagGroupId[tag.tagGroupId].push(tag);
			} else {
				tagsByTagGroupId[tag.tagGroupId] = [tag];
			}
		});

		setTagGroupFilters(response.tagGroups);
		setTagFilters(tagsByTagGroupId);
		setContentTypeFilters(response.contentTypes);
		setContentDurationFilters(response.contentDurations);
	}, []);

	useEffect(() => {
		setTagFilterValue(tagIdQuery);
	}, [tagIdQuery]);

	useEffect(() => {
		setContentTypeFilterValue(contentTypeIdQuery);
	}, [contentTypeIdQuery]);

	useEffect(() => {
		setContentDurationFilterValue(contentDurationIdQuery);
	}, [contentDurationIdQuery]);

	const fetchData = useCallback(async () => {
		if (searchQuery) {
			setSearchInputValue(searchQuery);

			const searchResponse = await resourceLibraryService
				.searchResourceLibrary({ searchQuery, pageNumber: 0, pageSize: 100 })
				.fetch();

			setContents(searchResponse.findResult.contents);
			setFindResultTotalCount(searchResponse.findResult.totalCount);
			setFindResultTotalCountDescription(searchResponse.findResult.totalCountDescription);
			setTagGroups([]);
			setContentsByTagGroupId(undefined);
			setTagsByTagId(searchResponse.tagsByTagId);
			return;
		}

		if (recommendedContent) {
			const recommendedResponse = await resourceLibraryService
				.getResourceLibraryRecommendedContent({
					pageNumber: 0,
					pageSize: 100,
					tagId: tagIdQuery,
					contentTypeId: contentTypeIdQuery,
					contentDurationId: contentDurationIdQuery,
				})
				.fetch();

			setContents(recommendedResponse.findResult.contents);
			setFindResultTotalCount(0);
			setFindResultTotalCountDescription('');
			setTagGroups([]);
			setContentsByTagGroupId(undefined);
			setTagsByTagId(recommendedResponse.tagsByTagId);
			return;
		}

		const response = await resourceLibraryService.getResourceLibrary().fetch();

		setContents([]);
		setFindResultTotalCount(0);
		setFindResultTotalCountDescription('');
		setTagGroups(response.tagGroups);
		setContentsByTagGroupId(response.contentsByTagGroupId);
		setTagsByTagId(response.tagsByTagId);
	}, [contentDurationIdQuery, contentTypeIdQuery, recommendedContent, searchQuery, tagIdQuery]);

	const applyValuesToSearchParam = (values: string[], searchParam: string) => {
		searchParams.delete(searchParam);

		for (const value of values) {
			searchParams.append(searchParam, value);
		}

		setSearchParams(searchParams, { replace: true });
	};

	const handleClearFiltersButtonClick = useCallback(() => {
		searchParams.delete('tagId');
		searchParams.delete('contentTypeId');
		searchParams.delete('contentDurationId');

		setSearchParams(searchParams, { replace: true });
	}, [searchParams, setSearchParams]);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (searchInputValue) {
			searchParams.delete('recommended');
			searchParams.delete('tagId');
			searchParams.delete('contentTypeId');
			searchParams.delete('contentDurationId');
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
				<ActionSheet
					show={false}
					onShow={() => {
						mixpanel.track('Patient-Sourced Add Content Click', {});
						navigate('/cms/on-your-time/create');
					}}
					onHide={() => {
						return;
					}}
				/>
			)}

			{/* ---------------------------------------------------- */}
			{/* Tags for "All" and "For You" */}
			{/* Only show if the current institution has a non-null contentScreeningFlowId */}
			{/* ---------------------------------------------------- */}
			{!searchQuery && institution?.contentScreeningFlowId && (
				<Container className="pt-6">
					<Row>
						<Col>
							<TabBar
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

									setSearchParams(searchParams, { replace: true });
								}}
							/>
						</Col>
					</Row>
				</Container>
			)}

			{/* ---------------------------------------------------- */}
			{/* Filters for "For You" */}
			{/* ---------------------------------------------------- */}
			{recommendedContent && (
				<AsyncPage fetchData={fetchRecommendedFilters}>
					<Container className="pt-6">
						<Row>
							<Col>
								<SimpleFilter
									title="Topic"
									className="me-2"
									dialogWidth={628}
									show={tagFilterIsShowing}
									activeLength={searchParams.getAll('tagId').length}
									onHide={() => {
										setTagFilterIsShowing(false);
									}}
									onClick={() => {
										setTagFilterIsShowing(true);
									}}
									onClear={() => {
										setTagFilterIsShowing(false);
										applyValuesToSearchParam([], 'tagId');
									}}
									onApply={() => {
										setTagFilterIsShowing(false);
										applyValuesToSearchParam(tagFilterValue, 'tagId');
									}}
								>
									{tagGroupFilters.map((tagGroup, tagGroupIndex) => {
										const isLastTagGroup = tagGroupFilters.length - 1 === tagGroupIndex;

										return (
											<div
												key={tagGroup.tagGroupId}
												className={classNames({ 'mb-5 border-bottom': !isLastTagGroup })}
											>
												<h5 className="mb-4">{tagGroup.name}</h5>
												{tagFilters?.[tagGroup.tagGroupId].map((tag, tagIndex) => {
													const isLastTag =
														tagFilters[tagGroup.tagGroupId].length - 1 === tagIndex;

													return (
														<Form.Check
															key={tag.tagId}
															className={classNames({
																'mb-0': isLastTagGroup && isLastTag,
																'mb-5': !isLastTagGroup && isLastTag,
																'mb-1': !isLastTag,
															})}
															type="checkbox"
															name={`tag-group--${tag.tagGroupId}`}
															id={`tag--${tag.tagId}`}
															label={tag.name}
															value={tag.tagId}
															checked={tagFilterValue.includes(tag.tagId)}
															onChange={({ currentTarget }) => {
																const updatedArray = AddOrRemoveValueFromArray(
																	currentTarget.value,
																	tagFilterValue
																);

																setTagFilterValue(updatedArray);
															}}
														/>
													);
												})}
											</div>
										);
									})}
								</SimpleFilter>
								<SimpleFilter
									title="Type"
									className="me-2"
									show={contentTypeFilterIsShowing}
									activeLength={searchParams.getAll('contentTypeId').length}
									onHide={() => {
										setContentTypeFilterIsShowing(false);
									}}
									onClick={() => {
										setContentTypeFilterIsShowing(true);
									}}
									onClear={() => {
										setContentTypeFilterIsShowing(false);
										applyValuesToSearchParam([], 'contentTypeId');
									}}
									onApply={() => {
										setContentTypeFilterIsShowing(false);
										applyValuesToSearchParam(contentTypeFilterValue, 'contentTypeId');
									}}
								>
									{contentTypeFilters.map((contentType) => {
										return (
											<Form.Check
												key={contentType.contentTypeId}
												type="checkbox"
												name="CONTENT_TYPES"
												id={contentType.contentTypeId}
												label={contentType.description}
												value={contentType.contentTypeId}
												checked={contentTypeFilterValue.includes(contentType.contentTypeId)}
												onChange={({ currentTarget }) => {
													const updatedArray = AddOrRemoveValueFromArray(
														currentTarget.value,
														contentTypeFilterValue
													);

													setContentTypeFilterValue(updatedArray);
												}}
											/>
										);
									})}
								</SimpleFilter>
								<SimpleFilter
									title="Length"
									show={contentDurationFilterIsShowing}
									activeLength={searchParams.getAll('contentDurationId').length}
									onHide={() => {
										setContentDurationFilterIsShowing(false);
									}}
									onClick={() => {
										setContentDurationFilterIsShowing(true);
									}}
									onClear={() => {
										setContentDurationFilterIsShowing(false);
										applyValuesToSearchParam([], 'contentDurationId');
									}}
									onApply={() => {
										setContentDurationFilterIsShowing(false);
										applyValuesToSearchParam(contentDurationFilterValue, 'contentDurationId');
									}}
								>
									{contentDurationFilters.map((contentDuration) => {
										return (
											<Form.Check
												key={contentDuration.contentDurationId}
												type="checkbox"
												name="CONTENT_TYPES"
												id={contentDuration.contentDurationId}
												label={contentDuration.description}
												value={contentDuration.contentDurationId}
												checked={contentDurationFilterValue.includes(
													contentDuration.contentDurationId
												)}
												onChange={({ currentTarget }) => {
													const updatedArray = AddOrRemoveValueFromArray(
														currentTarget.value,
														contentDurationFilterValue
													);

													setContentDurationFilterValue(updatedArray);
												}}
											/>
										);
									})}
								</SimpleFilter>
								{hasFilterQueryParms && (
									<Button variant="link" className="p-0 mx-3" onClick={handleClearFiltersButtonClick}>
										Clear
									</Button>
								)}
							</Col>
						</Row>
					</Container>
				</AsyncPage>
			)}

			<AsyncPage fetchData={fetchData}>
				<Container className="pt-5 pt-lg-6 pb-6 pb-lg-32">
					{/* ---------------------------------------------------- */}
					{/* Header for "Search" */}
					{/* ---------------------------------------------------- */}
					{searchQuery && (
						<Row className="pt-4 mb-10">
							<h3 className="mb-0">
								{findResultTotalCountDescription} result{findResultTotalCount === 1 ? '' : 's'}
							</h3>
						</Row>
					)}

					{recommendedContent && !didCheckScreeningSessions && (
						<Row>
							<Col>
								<div className="bg-n75 rounded p-12">
									<Row>
										<Col lg={{ span: 6, offset: 3 }}>
											<h2 className="mb-6 text-center">Get Personalized Recommendations</h2>
											<p className="mb-6 fs-large text-center">
												Complete a wellness assessment to get personalized recommendations
											</p>
											<div className="text-center">
												<Button
													size="lg"
													variant="outline-primary"
													onClick={() => {
														startScreeningFlow();
													}}
												>
													Take the assessment
												</Button>
											</div>
										</Col>
									</Row>
								</div>
							</Col>
						</Row>
					)}
					{recommendedContent && hasFilterQueryParms && contents.length <= 0 && (
						<Row className="py-4">
							<Col>
								<h2 className="mb-6 text-muted text-center">No Results</h2>
								<p className="mb-6 fs-large text-muted text-center">
									Try adjusting your filters to see available content
								</p>
								<div className="text-center">
									<Button size="lg" variant="outline-primary" onClick={handleClearFiltersButtonClick}>
										Clear Filters
									</Button>
								</div>
							</Col>
						</Row>
					)}
					{recommendedContent && !hasFilterQueryParms && didCheckScreeningSessions && contents.length <= 0 && (
						<Row>
							<Col>
								<div className="bg-n75 rounded p-12">
									<Row>
										<Col lg={{ span: 6, offset: 3 }}>
											<h2 className="mb-6 text-muted text-center">
												No recommendations at this time
											</h2>
											<p className="mb-0 fs-large text-muted text-center">
												We are continually adding more resources to the library. In the
												meantime, you can browse resources related to{' '}
												<Link to="/resource-library/tag-groups/symptoms">Symptoms</Link>,{' '}
												<Link to="/resource-library/tag-groups/work-life">Work Life</Link>,{' '}
												<Link to="/resource-library/tag-groups/personal-life">
													Personal Life
												</Link>
												, <Link to="/resource-library/tag-groups/identity">Identity</Link>,{' '}
												<Link to="/resource-library/tag-groups/caretaking">Caretaking</Link>,{' '}
												and{' '}
												<Link to="/resource-library/tag-groups/world-events">World Events</Link>
											</p>
										</Col>
									</Row>
								</div>
							</Col>
						</Row>
					)}
					{/* ---------------------------------------------------- */}
					{/* List view for both "Search" and "For You" */}
					{/* Note: "Search" does not have filters, "For You" does */}
					{/* ---------------------------------------------------- */}
					{contents.length > 0 && (
						<Row>
							{contents.map((content, resourceIndex) => {
								return (
									<Col key={resourceIndex} xs={12} md={6} lg={4} className="mb-8">
										<ResourceLibraryCard
											contentId={content.contentId}
											className="h-100"
											imageUrl={content.imageUrl}
											badgeTitle={content.newFlag ? 'New' : ''}
											title={content.title}
											author={content.author}
											description={content.description}
											tags={
												tagsByTagId
													? content.tagIds.map((tagId) => {
															return tagsByTagId[tagId];
													  })
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

					{/* ---------------------------------------------------- */}
					{/* View for "All" */}
					{/* ---------------------------------------------------- */}
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
										responsive={carouselConfig}
										trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
										floatingButtonGroup
									>
										{contentsByTagGroupId?.[tagGroup.tagGroupId]?.map((content) => {
											return (
												<ResourceLibraryCard
													key={content.contentId}
													contentId={content.contentId}
													className="h-100"
													imageUrl={content.imageUrl}
													badgeTitle={content.newFlag ? 'New' : ''}
													title={content.title}
													author={content.author}
													description={content.description}
													tags={
														tagsByTagId
															? content.tagIds.map((tagId) => {
																	return tagsByTagId[tagId];
															  })
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
				</Container>
			</AsyncPage>
		</>
	);
};

export default ResourceLibrary;
