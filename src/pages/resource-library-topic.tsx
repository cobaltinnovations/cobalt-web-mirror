import { cloneDeep } from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button, Col, Collapse, Container, Form, Row } from 'react-bootstrap';
import Color from 'color';

import { ResourceLibraryContentModel, TagGroupModel, TagModel } from '@/lib/models';
import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import { resourceLibraryService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import HeroContainer from '@/components/hero-container';
import SimpleFilter from '@/components/simple-filter';
import InputHelperSearch from '@/components/input-helper-search';
import ResourceLibraryCard from '@/components/resource-library-card';

import { ReactComponent as SearchIcon } from '@/assets/icons/icon-search.svg';
import { ReactComponent as XIcon } from '@/assets/icons/icon-x.svg';
import { createUseThemedStyles } from '@/jss/theme';

enum FILTER_IDS {
	SUBTOPIC = 'SUBTOPIC',
	TYPE = 'TYPE',
	LENGTH = 'LENGTH',
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
	const classes = useResourceLibraryTopicStyles();
	const { tagGroupId } = useParams<{ tagGroupId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get('searchQuery') ?? '';

	const searchInputRef = useRef<HTMLInputElement>(null);
	const [searchIsOpen, setSearchIsOpen] = useState(false);
	const [searchInputValue, setSearchInputValue] = useState('');
	const [filters, setFilters] = useState({
		[FILTER_IDS.SUBTOPIC]: {
			id: FILTER_IDS.SUBTOPIC,
			title: 'Subtopic',
			searchParam: 'subtopicId',
			value: searchParams.getAll('subtopicId'),
			options: [
				{ title: 'Mood', value: 'MOOD' },
				{ title: 'Anxiety', value: 'ANXIETY' },
				{ title: 'Sleep/Fatigue', value: 'SLEEP_FATIGUE' },
				{ title: 'Substance Use', value: 'SUBSTANCE_USE' },
			],
			isShowing: false,
		},
		[FILTER_IDS.TYPE]: {
			id: FILTER_IDS.TYPE,
			title: 'Type',
			searchParam: 'typeId',
			value: searchParams.getAll('typeId'),
			options: [
				{ title: 'Video', value: 'VIDEO' },
				{ title: 'Podcast', value: 'PODCAST' },
				{ title: 'Article', value: 'ARTICLE' },
				{ title: 'Website', value: 'WEBSITE' },
				{ title: 'App', value: 'APP' },
			],
			isShowing: false,
		},
		[FILTER_IDS.LENGTH]: {
			id: FILTER_IDS.LENGTH,
			title: 'Length',
			searchParam: 'lengthId',
			value: searchParams.getAll('lengthId'),
			options: [
				{ title: '<5 Minutes', value: 'LESS_THAN_FIVE_MINUTES' },
				{ title: '5-10 Minutes', value: 'FIVE_TO_TEN_MINUTES' },
				{ title: '10-30 Minutes', value: 'TEN_TO_THIRTY_MINUTES' },
				{ title: '>30 Minutes', value: 'GREATER_THAN_THIRTY_MINUTES' },
			],
			isShowing: false,
		},
	});
	const [findResultTotalCount, setFindResultTotalCount] = useState(0);
	const [findResultTotalCountDescription, setFindResultTotalCountDescription] = useState('');
	const [contents, setContents] = useState<ResourceLibraryContentModel[]>([]);
	const [tagGroup, setTagGroup] = useState<TagGroupModel>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();

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

	const fetchContent = useCallback(async () => {
		if (searchQuery) {
			setSearchInputValue(searchQuery);
		}

		if (!tagGroupId) {
			throw new Error('tagGroupId is undefined.');
		}

		const { findResult } = await resourceLibraryService
			.getResourceLibraryContentByTagGroupId(tagGroupId, { searchQuery, pageNumber: 0, pageSize: 100 })
			.fetch();

		setFindResultTotalCount(findResult.totalCount);
		setFindResultTotalCountDescription(findResult.totalCountDescription);
		setContents(findResult.contents);
	}, [searchQuery, tagGroupId]);

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
	};

	return (
		<>
			<AsyncPage fetchData={fetchTagGroup}>
				{tagGroup && (
					<>
						<Breadcrumb
							xs={{ span: 12 }}
							lg={{ span: 12 }}
							xl={{ span: 12 }}
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
				<Container className="pt-8">
					<Row className="mb-3">
						<Col>
							<div className="d-flex align-items-center justify-content-between">
								<div className={classes.filterButtonsOuter}>
									{Object.values(filters).map((filter) => {
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
								</div>
								<div className={classes.searchButtonOuter}>
									<Button
										variant={searchIsOpen ? 'primary' : 'outline-primary'}
										className="p-2"
										onClick={() => {
											if (searchIsOpen) {
												setSearchInputValue('');
												setSearchIsOpen(false);

												searchParams.delete('searchQuery');
												setSearchParams(searchParams, { replace: true });
											} else {
												setSearchIsOpen(true);
											}
										}}
									>
										{searchIsOpen ? (
											<XIcon width={24} height={24} />
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
								searchInputRef.current?.focus();
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
			<AsyncPage fetchData={fetchContent}>
				<Container className="pb-24">
					{searchQuery && (
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
									<Col key={content.contentId} xs={6} lg={4} className="mb-8">
										<ResourceLibraryCard
											colorId={tagGroup.colorId}
											className="h-100"
											imageUrl={content.imageUrl}
											badgeTitle={content.newFlag ? 'New' : ''}
											subtopic={tagGroup?.name ?? ''}
											subtopicTo={`/resource-library/tag-groups/${tagGroup?.urlName}`}
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
