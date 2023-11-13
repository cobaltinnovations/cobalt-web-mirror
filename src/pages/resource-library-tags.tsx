import { cloneDeep } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import {
	ContentDurationFilterModel,
	ContentTypeFilterModel,
	ResourceLibraryContentModel,
	TagGroupModel,
	TagModel,
} from '@/lib/models';
import { resourceLibraryService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import HeroContainer from '@/components/hero-container';
import SimpleFilter, { SimpleFilterModel } from '@/components/simple-filter';
import ResourceLibraryCard, { SkeletonResourceLibraryCard } from '@/components/resource-library-card';
import { SkeletonText } from '@/components/skeleton-loaders';

enum FILTER_IDS {
	CONTENT_TYPES = 'CONTENT_TYPES',
	CONTENT_DURATIONS = 'CONTENT_DURATIONS',
}

const ResourceLibraryTags = () => {
	const { tagId } = useParams<{ tagId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const contentTypeIdQuery = useMemo(() => searchParams.getAll('contentTypeId'), [searchParams]);
	const contentDurationIdQuery = useMemo(() => searchParams.getAll('contentDurationId'), [searchParams]);
	const hasQueryParams = useMemo(
		() => contentTypeIdQuery.length > 0 || contentDurationIdQuery.length > 0,
		[contentDurationIdQuery.length, contentTypeIdQuery.length]
	);

	const [filtersResponse, setFiltersResponse] = useState<{
		contentTypes: ContentTypeFilterModel[];
		contentDurations: ContentDurationFilterModel[];
	}>();
	const [filters, setFilters] = useState<Record<FILTER_IDS, SimpleFilterModel<FILTER_IDS>>>();
	const [findResultTotalCount, setFindResultTotalCount] = useState(0);
	const [findResultTotalCountDescription, setFindResultTotalCountDescription] = useState('');
	const [tagGroup, setTagGroup] = useState<TagGroupModel>();
	const [tag, setTag] = useState<TagModel>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();
	const [content, setContent] = useState<ResourceLibraryContentModel[]>([]);

	const fetchTag = useCallback(async () => {
		if (!tagId) {
			throw new Error('tagId is undefined.');
		}

		const response = await resourceLibraryService
			.getResourceLibraryContentByTagId(tagId, { pageNumber: 0, pageSize: 0 })
			.fetch();

		setTag(response.tag);
		setTagGroup(response.tagGroup);
		setTagsByTagId(response.tagsByTagId);
	}, [tagId]);

	const fetchFilters = useCallback(async () => {
		if (!tagId) {
			throw new Error('tagGroupId is undefined.');
		}

		const response = await resourceLibraryService.getResourceLibraryFiltersByTagId(tagId).fetch();
		setFiltersResponse(response);
	}, [tagId]);

	useEffect(() => {
		if (!filtersResponse) {
			return;
		}

		const formattedFilters = {
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
	}, [contentDurationIdQuery, contentTypeIdQuery, filtersResponse]);

	const fetchContent = useCallback(async () => {
		if (!tagId) {
			throw new Error('tagId is undefined.');
		}

		const { findResult } = await resourceLibraryService
			.getResourceLibraryContentByTagId(tagId, {
				pageNumber: 0,
				pageSize: 200,
				contentTypeId: contentTypeIdQuery,
				contentDurationId: contentDurationIdQuery,
			})
			.fetch();

		setFindResultTotalCount(findResult.totalCount);
		setFindResultTotalCountDescription(findResult.totalCountDescription);
		setContent(findResult.contents);
	}, [contentDurationIdQuery, contentTypeIdQuery, tagId]);

	const applyValuesToSearchParam = (values: string[], searchParam: string) => {
		searchParams.delete(searchParam);

		for (const value of values) {
			searchParams.append(searchParam, value);
		}

		setSearchParams(searchParams, { replace: true });
	};

	const handleClearButtonClick = useCallback(() => {
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
				fetchData={fetchTag}
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
				{tagGroup && tag && (
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
								{
									to: `/resource-library/tags/${tag.urlName}`,
									title: tag.name,
								},
							]}
						/>
						<HeroContainer className={getBackgroundClassForColorId(tagGroup.colorId)}>
							<h1 className="mb-4 text-center">{tag.name}</h1>
							<p className="mb-0 text-center fs-large">{tag.description}</p>
						</HeroContainer>
					</>
				)}
			</AsyncPage>
			<AsyncPage fetchData={fetchFilters}>
				<Container className="pt-8">
					<Row className="mb-8">
						<Col>
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

												applyValuesToSearchParam([], filtersClone[filter.id].searchParam);
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
																filtersClone[filter.id].value.splice(indexToRemove, 1);
															} else {
																filtersClone[filter.id].value.push(currentTarget.value);
															}

															setFilters(filtersClone);
														}}
													/>
												);
											})}
										</SimpleFilter>
									);
								})}
							{hasQueryParams && (
								<Button variant="link" className="p-0 mx-3" onClick={handleClearButtonClick}>
									Clear
								</Button>
							)}
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
					{hasQueryParams && (
						<Row className="mb-10">
							<h3 className="mb-0">
								{findResultTotalCountDescription} result{findResultTotalCount === 1 ? '' : 's'}
							</h3>
						</Row>
					)}
					<Row>
						{content.map((content) => {
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

export default ResourceLibraryTags;
