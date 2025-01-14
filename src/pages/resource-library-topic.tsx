import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import {
	AnalyticsNativeEventTypeId,
	Content,
	ContentAudienceType,
	ContentDuration,
	ContentType,
	Tag,
	TagGroup,
} from '@/lib/models';
import { analyticsService, resourceLibraryService } from '@/lib/services';
import useTouchScreenCheck from '@/hooks/use-touch-screen-check';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import InputHelperSearch from '@/components/input-helper-search';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';
import { SkeletonText } from '@/components/skeleton-loaders';
import MegaFilter, { FILTER_TYPE } from '@/components/mega-filter';
import NoData from '@/components/no-data';
import useAccount from '@/hooks/use-account';

const ResourceLibraryTopic = () => {
	const { tagGroupId } = useParams<{ tagGroupId: string }>();
	const { hasTouchScreen } = useTouchScreenCheck();
	const { institution } = useAccount();

	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = useMemo(() => searchParams.get('searchQuery') ?? '', [searchParams]);
	const contentAudienceTypeIdQuery = useMemo(() => searchParams.get('contentAudienceTypeId') ?? '', [searchParams]);
	const tagIdQuery = useMemo(() => searchParams.getAll('tagId'), [searchParams]);
	const contentTypeIdQuery = useMemo(() => searchParams.getAll('contentTypeId'), [searchParams]);
	const contentDurationIdQuery = useMemo(() => searchParams.getAll('contentDurationId'), [searchParams]);
	const hasFilterQueryParms = useMemo(
		() =>
			!!searchQuery ||
			!!contentAudienceTypeIdQuery ||
			tagIdQuery.length > 0 ||
			contentTypeIdQuery.length > 0 ||
			contentDurationIdQuery.length > 0,
		[
			contentAudienceTypeIdQuery,
			contentDurationIdQuery.length,
			contentTypeIdQuery.length,
			searchQuery,
			tagIdQuery.length,
		]
	);

	const [filtersResponse, setFiltersResponse] = useState<{
		contentAudienceTypes: ContentAudienceType[];
		contentTypes: ContentType[];
		contentDurations: ContentDuration[];
		tags: Tag[];
	}>();

	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchInputValue, setSearchInputValue] = useState('');

	const [findResultTotalCount, setFindResultTotalCount] = useState(0);
	const [tagGroup, setTagGroup] = useState<TagGroup>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, Tag>>();
	const [contents, setContents] = useState<Content[]>([]);

	useEffect(() => {
		if (tagGroup && !hasTouchScreen) {
			searchInputRef.current?.focus({ preventScroll: true });
		}
	}, [tagGroup, hasTouchScreen]);

	const fetchPageBlockingData = useCallback(async () => {
		if (!tagGroupId) {
			throw new Error('tagGroupId is undefined.');
		}

		const [tagGroupResponse, filtersResponse] = await Promise.all([
			resourceLibraryService
				.getResourceLibraryContentByTagGroupId(tagGroupId, { pageNumber: 0, pageSize: 0 })
				.fetch(),
			resourceLibraryService.getResourceLibraryFiltersByTagGroupId(tagGroupId).fetch(),
		]);

		setTagGroup(tagGroupResponse.tagGroup);
		setTagsByTagId(tagGroupResponse.tagsByTagId);
		setFiltersResponse(filtersResponse);
	}, [tagGroupId]);

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
				contentAudienceTypeId: contentAudienceTypeIdQuery,
				tagId: tagIdQuery,
				contentTypeId: contentTypeIdQuery,
				contentDurationId: contentDurationIdQuery,
			})
			.fetch();

		setFindResultTotalCount(findResult.totalCount);
		setContents(findResult.contents);
	}, [contentAudienceTypeIdQuery, contentDurationIdQuery, contentTypeIdQuery, searchQuery, tagGroupId, tagIdQuery]);

	useEffect(() => {
		if (!tagGroup && !findResultTotalCount) {
			return;
		}

		analyticsService.persistEvent(AnalyticsNativeEventTypeId.PAGE_VIEW_RESOURCE_LIBRARY_TAG_GROUP, {
			contentAudienceTypeIds: contentAudienceTypeIdQuery ? [contentAudienceTypeIdQuery] : [],
			contentDurationIds: contentDurationIdQuery,
			contentTypeIds: contentTypeIdQuery,
			searchQuery: searchQuery && searchQuery.trim().length > 0 ? searchQuery.trim() : undefined,
			tagGroupId: tagGroup?.tagGroupId,
			tagIds: tagIdQuery,
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

	const handleClearFiltersButtonClick = useCallback(() => {
		setSearchInputValue('');
		setSearchParams(new URLSearchParams(), { replace: true });
	}, [setSearchParams]);

	return (
		<>
			<Helmet>
				<title>Cobalt | Resource Library</title>
			</Helmet>

			<AsyncPage
				fetchData={fetchPageBlockingData}
				loadingComponent={
					<>
						{/* <Breadcrumb
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
						/> */}
						<HeroContainer>
							<SkeletonText type="h1" className="mb-4 text-center" width="50%" />
							<SkeletonText type="p" className="mb-0 text-center fs-large" numberOfLines={3} />
						</HeroContainer>
					</>
				}
			>
				{/* <Breadcrumb
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
							to: `/resource-library/tag-groups/${tagGroup?.urlName}`,
							title: tagGroup?.name ?? '',
						},
					]}
				/> */}
				<HeroContainer className={getBackgroundClassForColorId(tagGroup?.colorId)}>
					<h1 className="mb-4 text-center">{tagGroup?.name}</h1>
					<p className="mb-6 text-center fs-large">{tagGroup?.description}</p>
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
				<Container>
					<Row className="py-9">
						<Col>
							<div className="d-flex flex-column flex-lg-row align-items-center justify-content-center justify-content-lg-between">
								<div></div>
								<div className="d-flex flex-column flex-lg-row align-items-center justify-content-center">
									<div className="mb-2 mb-lg-0 d-flex align-items-center">
										{institution.contentAudiencesEnabled && (
											<>
												<span className="me-2">Show resources for</span>
												<MegaFilter
													maxWidth={480}
													displaySingleColumn
													className="me-2"
													allowCollapse={false}
													displayCount={false}
													buttonTitle={
														(filtersResponse?.contentAudienceTypes ?? []).find(
															(cat) =>
																cat.contentAudienceTypeId ===
																searchParams.get('contentAudienceTypeId')
														)?.description ?? 'Anyone'
													}
													modalTitle="Show resources for..."
													value={[
														{
															id: 'contentAudienceTypeId',
															filterType: FILTER_TYPE.RADIO,
															title: 'Show resources for...',
															value: searchParams.getAll('contentAudienceTypeId'),
															options: (filtersResponse?.contentAudienceTypes ?? []).map(
																(cat) => ({
																	value: cat.contentAudienceTypeId,
																	title: cat.description,
																})
															),
														},
													]}
													onChange={(filters) => {
														filters.forEach((filter) => {
															applyValuesToSearchParam(filter.value, filter.id);
														});
													}}
												/>
											</>
										)}
									</div>
									<div className="mb-2 mb-lg-0 d-flex align-items-center">
										<span className="me-2">
											{institution.contentAudiencesEnabled
												? 'related to'
												: 'Show resources related to '}
										</span>
										<MegaFilter
											allowCollapse={false}
											buttonTitle={
												searchParams.getAll('tagId').length > 0 ? 'Topics' : 'Any topic'
											}
											modalTitle="Topics"
											value={[
												{
													id: 'TOPICS',
													filterType: FILTER_TYPE.CHECKBOX,
													title: 'Topics',
													value: searchParams.getAll('tagId'),
													options: (filtersResponse?.tags ?? []).map((tag) => ({
														value: tag.tagId,
														title: tag.name,
													})),
												},
											]}
											onChange={(filters) => {
												applyValuesToSearchParam(filters.map((f) => f.value).flat(), 'tagId');
											}}
										/>
									</div>
								</div>
								<div>
									<MegaFilter
										displayFilterIcon
										displayDownArrow={false}
										buttonTitle="More filters"
										modalTitle="More filters"
										value={[
											{
												id: 'contentTypeId',
												filterType: FILTER_TYPE.CHECKBOX,
												title: 'Type',
												value: searchParams.getAll('contentTypeId'),
												options: (filtersResponse?.contentTypes ?? []).map((ct) => ({
													value: ct.contentTypeId,
													title: ct.description,
												})),
											},
											{
												id: 'contentDurationId',
												filterType: FILTER_TYPE.CHECKBOX,
												title: 'Duration',
												value: searchParams.getAll('contentDurationId'),
												options: (filtersResponse?.contentDurations ?? []).map((cd) => ({
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
					{hasFilterQueryParms && contents.length <= 0 && (
						<Row className="mb-10">
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
					)}
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
				</Container>
			</AsyncPage>
		</>
	);
};

export default ResourceLibraryTopic;
