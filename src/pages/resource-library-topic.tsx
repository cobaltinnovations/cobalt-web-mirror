import React, { useCallback, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Col, Container, Form, Row } from 'react-bootstrap';

import { COLOR_IDS, ContentTypeId } from '@/lib/models';
import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import SimpleFilter from '@/components/simple-filter';
import ResourceLibraryCard from '@/components/resource-library-card';
import { cloneDeep } from 'lodash';

interface Resource {
	new?: boolean;
	imageUrl?: string;
	subtopic: string;
	title: string;
	author: string;
	description: string;
	tags: ResourceTag[];
	contentTypeId: ContentTypeId;
}
interface ResourceTag {
	tagId: string;
	description: string;
}

enum FILTER_IDS {
	SUBTOPIC = 'SUBTOPIC',
	TYPE = 'TYPE',
	LENGTH = 'LENGTH',
}

const ResourceLibraryTopic = () => {
	const { tagGroupId } = useParams<{ tagGroupId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const [colorId] = useState<COLOR_IDS>(COLOR_IDS.BRAND_ACCENT);

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

	const [resources] = useState<Resource[]>([
		{
			new: true,
			subtopic: 'Symptoms',
			title: 'This is the Title of the Content',
			author: 'Kathleen Murphy, MD',
			description:
				'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
			tags: [
				{
					tagId: 'MOOD',
					description: 'Mood',
				},
				{
					tagId: 'ANXIETY',
					description: 'Anxiety',
				},
			],
			contentTypeId: ContentTypeId.Audio,
		},
		{
			subtopic: 'Symptoms',
			title: 'This is a title that has multiple lines. It can run on to two lines, but not more than that. Two is the maximum line length that titles can have.',
			author: 'Kathleen Murphy, MD',
			description:
				'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
			tags: [
				{
					tagId: 'SLEEP',
					description: 'Sleep',
				},
				{
					tagId: 'SUBSTANCE_USE',
					description: 'Substance Use',
				},
			],
			contentTypeId: ContentTypeId.Video,
		},
		{
			new: true,
			subtopic: 'Symptoms',
			title: 'This is the Title of the Content',
			author: 'Kathleen Murphy, MD',
			description:
				'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
			tags: [
				{
					tagId: 'MOOD',
					description: 'Mood',
				},
				{
					tagId: 'ANXIETY',
					description: 'Anxiety',
				},
			],
			contentTypeId: ContentTypeId.Podcast,
		},
	]);

	const fetchData = useCallback(() => {
		return null;
	}, []);

	const applyValuesToSearchParam = (values: string[], searchParam: string) => {
		searchParams.delete(searchParam);

		for (const value of values) {
			searchParams.append(searchParam, value);
		}

		setSearchParams(searchParams, { replace: true });
	};

	return (
		<AsyncPage fetchData={fetchData}>
			<HeroContainer className={getBackgroundClassForColorId(colorId)}>
				<h1 className="mb-4 text-center">Symptoms</h1>
				<p className="mb-0 text-center fs-large">
					Browse content tailored to symptoms you or others in your life may be experiencing, including
					concerns about mood, anxiety, sleep, fatigue or substance abuse
				</p>
			</HeroContainer>
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
									active={searchParams.getAll(filter.searchParam).length > 0}
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
												name="subtopic"
												id={`subtopic--${option.value}`}
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
				<Row>
					{resources.map((resource, resourceIndex) => {
						return (
							<Col key={resourceIndex} xs={6} lg={4} className="mb-8">
								<ResourceLibraryCard
									colorId={colorId}
									className="h-100"
									badgeTitle={resource.new ? 'New' : ''}
									subtopic={resource.subtopic}
									subtopicTo={`/resource-library/tag-groups/${tagGroupId}`}
									title={resource.title}
									author={resource.author}
									description={resource.description}
									tags={resource.tags}
									contentTypeId={resource.contentTypeId}
								/>
							</Col>
						);
					})}
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default ResourceLibraryTopic;
