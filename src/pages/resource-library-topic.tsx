import { cloneDeep } from 'lodash';
import React, { useCallback, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';

import { ResourceLibraryContentModel, TagGroupModel, TagModel } from '@/lib/models';
import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import { resourceLibraryService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import Breadcrumb from '@/components/breadcrumb';
import HeroContainer from '@/components/hero-container';
import SimpleFilter from '@/components/simple-filter';
import ResourceLibraryCard from '@/components/resource-library-card';

enum FILTER_IDS {
	SUBTOPIC = 'SUBTOPIC',
	TYPE = 'TYPE',
	LENGTH = 'LENGTH',
}

const ResourceLibraryTopic = () => {
	const { tagGroupId } = useParams<{ tagGroupId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
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
	const [resources, setResources] = useState<ResourceLibraryContentModel[]>([]);
	const [tagGroup, setTagGroup] = useState<TagGroupModel>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();

	const fetchData = useCallback(async () => {
		if (!tagGroupId) {
			throw new Error('tagGroupId is undefined.');
		}

		const response = await resourceLibraryService
			.getResourceLibraryContentByTagGroupId(tagGroupId, { pageSize: 100 })
			.fetch();

		setResources(response.findResult.contents);
		setTagGroup(response.tagGroup);
		setTagsByTagId(response.tagsByTagId);
	}, [tagGroupId]);

	const applyValuesToSearchParam = (values: string[], searchParam: string) => {
		searchParams.delete(searchParam);

		for (const value of values) {
			searchParams.append(searchParam, value);
		}

		setSearchParams(searchParams, { replace: true });
	};

	return (
		<AsyncPage fetchData={fetchData}>
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
			<Container className="pt-8 pb-24">
				<Row className="mb-8">
					<Col>
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
													const indexToRemove = filtersClone[filter.id].value.findIndex(
														(v) => v === currentTarget.value
													);

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
					</Col>
				</Row>
				{tagGroup && (
					<Row>
						{resources.map((resource, resourceIndex) => {
							return (
								<Col key={resourceIndex} xs={6} lg={4} className="mb-8">
									<ResourceLibraryCard
										colorId={tagGroup.colorId}
										className="h-100"
										imageUrl={resource.imageUrl}
										badgeTitle={resource.newFlag ? 'New' : ''}
										subtopic={tagGroup?.name ?? ''}
										subtopicTo={`/resource-library/tag-groups/${tagGroup?.tagGroupId}`}
										title={resource.title}
										author={resource.author}
										description={resource.description}
										tags={
											tagsByTagId
												? resource.tagIds.map((tagId) => {
														return tagsByTagId[tagId];
												  })
												: []
										}
										contentTypeId={resource.contentTypeId}
										duration={resource.durationInMinutesDescription}
									/>
								</Col>
							);
						})}
					</Row>
				)}
			</Container>
		</AsyncPage>
	);
};

export default ResourceLibraryTopic;
