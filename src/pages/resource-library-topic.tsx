import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, Col, Collapse, Container, Form, Row } from 'react-bootstrap';
import Color from 'color';
import { Helmet } from 'react-helmet';

import { AnalyticsNativeEventTypeId, Content, ContentDuration, ContentType, Tag, TagGroup } from '@/lib/models';
import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import { analyticsService, resourceLibraryService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import HeroContainer from '@/components/hero-container';
import SimpleFilter, { SimpleFilterModel } from '@/components/simple-filter';
import InputHelperSearch from '@/components/input-helper-search';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';

import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import { ReactComponent as CloseIcon } from '@/assets/icons/icon-close.svg';
import { createUseThemedStyles } from '@/jss/theme';
import { SkeletonText } from '@/components/skeleton-loaders';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';

// import useAnalytics from '@/hooks/use-analytics';
// import { ContentAnalyticsEvent } from '@/contexts/analytics-context';

enum FILTER_IDS {
	TAGS = 'TAGS',
	CONTENT_TYPES = 'CONTENT_TYPES',
	CONTENT_DURATIONS = 'CONTENT_DURATIONS',
}

const useResourceLibraryTopicStyles = createUseThemedStyles((theme) => ({
	filterButtonsOuter: {
		flex: 1,
		display: 'flex',
		overflowX: 'auto',
		flexWrap: 'nowrap',
		alignItems: 'center',
		paddingBottom: 8,
	},
	searchButtonOuter: {
		flexShrink: 0,
		paddingBottom: 8,
		position: 'relative',
		'&:before': {
			top: 0,
			bottom: 0,
			width: 16,
			left: -16,
			content: '""',
			display: 'block',
			position: 'absolute',
			background: `linear-gradient(90deg, ${Color(theme.colors.background).alpha(0).string()} 0%, ${Color(
				theme.colors.background
			)
				.alpha(1)
				.string()} 100%);`,
		},
	},
}));

const ResourceLibraryTopic = () => {
	const { tagGroupId } = useParams<{ tagGroupId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();

	const { hasTouchScreen } = useTouchScreenCheck();
	// const { trackEvent } = useAnalytics();

	const searchQuery = useMemo(() => searchParams.get('searchQuery') ?? '', [searchParams]);
	const tagIdQuery = useMemo(() => searchParams.getAll('tagId'), [searchParams]);
	const contentTypeIdQuery = useMemo(() => searchParams.getAll('contentTypeId'), [searchParams]);
	const contentDurationIdQuery = useMemo(() => searchParams.getAll('contentDurationId'), [searchParams]);
	const hasFilterQueryParms = useMemo(
		() => tagIdQuery.length > 0 || contentTypeIdQuery.length > 0 || contentDurationIdQuery.length > 0,
		[contentDurationIdQuery.length, contentTypeIdQuery.length, tagIdQuery.length]
	);
	const hasQueryParams = useMemo(
		() => searchQuery.length > 0 || hasFilterQueryParms,
		[hasFilterQueryParms, searchQuery.length]
	);

	const classes = useResourceLibraryTopicStyles();
	const searchInputRef = useRef<HTMLInputElement>(null);

	const [filtersResponse, setFiltersResponse] = useState<{
		contentTypes: ContentType[];
		contentDurations: ContentDuration[];
		tags: Tag[];
	}>();
	const [filters, setFilters] = useState<Record<FILTER_IDS, SimpleFilterModel<FILTER_IDS>>>();
	const [searchIsOpen, setSearchIsOpen] = useState(false);
	const [searchInputValue, setSearchInputValue] = useState('');

	const [findResultTotalCount, setFindResultTotalCount] = useState(0);
	const [findResultTotalCountDescription, setFindResultTotalCountDescription] = useState('');
	const [tagGroup, setTagGroup] = useState<TagGroup>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();
	const [contents, setContents] = useState<Content[]>([]);

	const fetchTagGroup = useCallback(async () => {
		if (!tagGroupId) {
			throw new Error('tagGroupId is undefined.');
		}

		const response = await resourceLibraryService
			.getResourceLibraryContentByTagGroupId(tagGroupId, { pageNumber: 0, pageSize: 0 })
			.fetch();

		setTagGroup(response.tagGroup);
		setTagsByTagId(response.tagsByTagId);
	}, [tagGroupId]);

	const fetchFilters = useCallback(async () => {
		if (!tagGroupId) {
			throw new Error('tagGroupId is undefined.');
		}

		const response = await resourceLibraryService.getResourceLibraryFiltersByTagGroupId(tagGroupId).fetch();
		setFiltersResponse(response);
	}, [tagGroupId]);

	useEffect(() => {
		if (!filtersResponse) {
			return;
		}

		const formattedFilters = {
			[FILTER_IDS.TAGS]: {
				id: FILTER_IDS.TAGS,
				title: 'Subtopic',
				searchParam: 'tagId',
				value: tagIdQuery,
				options: filtersResponse.tags.map((tag) => ({
					title: tag.name,
					value: tag.tagId,
				})),
				isShowing: false,
			},
			[FILTER_IDS.CONTENT_TYPES]: {
				id: FILTER_IDS.CONTENT_TYPES,
				title: 'Type',
				searchParam: 'contentTypeId',
				value: contentTypeIdQuery,
				options: filtersResponse.contentTypes.map((ct) => ({
					title: ct.description,
					value: ct.contentTypeId,
				})),
				isShowing: false,
			},
			[FILTER_IDS.CONTENT_DURATIONS]: {
				id: FILTER_IDS.CONTENT_DURATIONS,
				title: 'Length',
				searchParam: 'contentDurationId',
				value: contentDurationIdQuery,
				options: filtersResponse.contentDurations.map((cd) => ({
					title: cd.description,
					value: cd.contentDurationId,
				})),
				isShowing: false,
			},
		};

		setFilters(formattedFilters);
	}, [contentDurationIdQuery, contentTypeIdQuery, filtersResponse, tagIdQuery]);

	const fetchContent = useCallback(async () => {
		if (searchQuery) {
			setSearchInputValue(searchQuery);
		}

		if (!tagGroupId) {
			throw new Error('tagGroupId is undefined.');
		}

		const { findResult } = await resourceLibraryService
			.getResourceLibraryContentByTagGroupId(tagGroupId, {
				pageNumber: 0,
				pageSize: 100,
				searchQuery,
				tagId: tagIdQuery,
				contentTypeId: contentTypeIdQuery,
				contentDurationId: contentDurationIdQuery,
			})
			.fetch();

		setFindResultTotalCount(findResult.totalCount);
		setFindResultTotalCountDescription(findResult.totalCountDescription);
		setContents(findResult.contents);
	}, [contentDurationIdQuery, contentTypeIdQuery, searchQuery, tagGroupId, tagIdQuery]);

	useEffect(() => {
		if (!tagGroup && !findResultTotalCount) {
			return;
		}

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY_TAG_GROUP, {
			tagGroupId: tagGroup?.tagGroupId,
			tagIds: tagIdQuery,
			contentTypeIds: contentTypeIdQuery,
			contentDurationIds: contentDurationIdQuery,
			searchQuery: searchQuery && searchQuery.trim().length > 0 ? searchQuery.trim() : undefined,
			totalCount: findResultTotalCount,
		});

		// Only fire analytics event when api calls resolve, not on queryParam change
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [findResultTotalCount, tagGroup]);

	const applyValuesToSearchParam = (values: string[], searchParam: string) => {
		searchParams.delete(searchParam);

		for (const value of values) {
			searchParams.append(searchParam, value);
		}

		setSearchParams(searchParams, { replace: true });
	};

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

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

	const handleClearButtonClick = useCallback(() => {
		searchParams.delete('tagId');
		searchParams.delete('contentTypeId');
		searchParams.delete('contentDurationId');

		setSearchParams(searchParams, { replace: true });
	}, [searchParams, setSearchParams]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Resource Library</title>
			</Helmet>

			<AsyncPage
				fetchData={fetchTagGroup}
				loadingComponent={
					<>
						<Breadcrumb
							breadcrumbs={[
								{
									to: '/',
									title: 'Home',
								},
								{
									to: '/resource-library',
									title: 'Resource Library',
								},
							]}
						/>
						<HeroContainer>
							<SkeletonText type="h1" className="mb-4 text-center" width="50%" />
							<SkeletonText type="p" className="mb-0 text-center fs-large" numberOfLines={3} />
						</HeroContainer>
					</>
				}
			>
				{tagGroup && (
					<>
						<Breadcrumb
							breadcrumbs={[
								{
									to: '/',
									title: 'Home',
								},
								{
									to: '/resource-library',
									title: 'Resource Library',
								},
								{
									to: `/resource-library/tag-groups/${tagGroup.urlName}`,
									title: tagGroup.name,
								},
							]}
						/>
						<HeroContainer className={getBackgroundClassForColorId(tagGroup.colorId)}>
							<h1 className="mb-4 text-center">{tagGroup.name}</h1>
							<p className="mb-0 text-center fs-large">{tagGroup.description}</p>
						</HeroContainer>
					</>
				)}
			</AsyncPage>
			<AsyncPage fetchData={fetchFilters}>
				<Container className="pt-8">
					<Row className="mb-3">
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<div className={classes.filterButtonsOuter}>
									{filters &&
										Object.values(filters).map((filter) => {
											return (
												<SimpleFilter
													key={filter.id}
													className="me-2"
													title={filter.title}
													show={filter.isShowing}
													activeLength={searchParams.getAll(filter.searchParam).length}
													onClick={() => {
														const filtersClone = cloneDeep(filters);
														filtersClone[filter.id].isShowing = true;
														setFilters(filtersClone);
														// trackEvent(ContentAnalyticsEvent.clickFilterPill(filter.title));
													}}
													onHide={() => {
														const filtersClone = cloneDeep(filters);
														filtersClone[filter.id].value = searchParams.getAll(
															filtersClone[filter.id].searchParam
														);
														filtersClone[filter.id].isShowing = false;
														setFilters(filtersClone);
													}}
													onClear={() => {
														const filtersClone = cloneDeep(filters);
														filtersClone[filter.id].value = [];
														filtersClone[filter.id].isShowing = false;
														setFilters(filtersClone);

														applyValuesToSearchParam(
															[],
															filtersClone[filter.id].searchParam
														);
													}}
													onApply={() => {
														const filtersClone = cloneDeep(filters);
														filtersClone[filter.id].isShowing = false;
														setFilters(filtersClone);

														applyValuesToSearchParam(
															filtersClone[filter.id].value,
															filtersClone[filter.id].searchParam
														);
													}}
												>
													{filter.options.map((option) => {
														return (
															<Form.Check
																key={option.value}
																type="checkbox"
																name={filter.id}
																id={`${filter.id}--${option.value}`}
																label={option.title}
																value={option.value}
																checked={filter.value.includes(option.value)}
																onChange={({ currentTarget }) => {
																	const filtersClone = cloneDeep(filters);
																	const indexToRemove = filtersClone[
																		filter.id
																	].value.findIndex((v) => v === currentTarget.value);

																	if (indexToRemove > -1) {
																		filtersClone[filter.id].value.splice(
																			indexToRemove,
																			1
																		);
																	} else {
																		filtersClone[filter.id].value.push(
																			currentTarget.value
																		);
																	}

																	setFilters(filtersClone);
																}}
															/>
														);
													})}
												</SimpleFilter>
											);
										})}
									{hasFilterQueryParms && (
										<Button variant="link" className="p-0 mx-3" onClick={handleClearButtonClick}>
											Clear
										</Button>
									)}
								</div>
								<div className={classes.searchButtonOuter}>
									<Button
										variant={searchIsOpen ? 'primary' : 'outline-primary'}
										className="p-2"
										onClick={() => {
											if (searchIsOpen) {
												clearSearch();
												setSearchIsOpen(false);
											} else {
												setSearchIsOpen(true);
											}
										}}
									>
										{searchIsOpen ? (
											<CloseIcon width={24} height={24} />
										) : (
											<SearchIcon width={24} height={24} />
										)}
									</Button>
								</div>
							</div>
						</Col>
					</Row>
					<div className="pb-3">
						<Collapse
							in={searchIsOpen}
							onEntered={() => {
								searchInputRef.current?.focus({ preventScroll: true });
							}}
						>
							<div className="overflow-hidden">
								<div className="pb-5">
									<Row>
										<Col>
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
										</Col>
									</Row>
								</div>
							</div>
						</Collapse>
					</div>
				</Container>
			</AsyncPage>
			<AsyncPage
				fetchData={fetchContent}
				loadingComponent={
					<Container className="pb-24">
						<Row>
							<Col xs={12} md={6} lg={4} className="mb-8">
								<SkeletonResourceLibraryCard />
							</Col>
							<Col xs={12} md={6} lg={4} className="mb-8">
								<SkeletonResourceLibraryCard />
							</Col>
							<Col xs={12} md={6} lg={4} className="mb-8">
								<SkeletonResourceLibraryCard />
							</Col>
							<Col xs={12} md={6} lg={4} className="mb-8">
								<SkeletonResourceLibraryCard />
							</Col>
							<Col xs={12} md={6} lg={4} className="mb-8">
								<SkeletonResourceLibraryCard />
							</Col>
							<Col xs={12} md={6} lg={4} className="mb-8">
								<SkeletonResourceLibraryCard />
							</Col>
						</Row>
					</Container>
				}
			>
				<Container className="pb-24">
					{hasQueryParams && (
						<Row className="mb-10">
							<h3 className="mb-0">
								{findResultTotalCountDescription} result{findResultTotalCount === 1 ? '' : 's'}
							</h3>
						</Row>
					)}
					{tagGroup && (
						<Row>
							{contents.map((content) => {
								return (
									<Col key={content.contentId} xs={12} md={6} lg={4} className="mb-8">
										<ResourceLibraryCard
											className="h-100"
											linkTo={`/resource-library/${content.contentId}`}
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
				</Container>
			</AsyncPage>
		</>
	);
};

export default ResourceLibraryTopic;
