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

const ResourceLibraryTopic = () => {
	const { tagGroupId } = useParams<{ tagGroupId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();
	const [colorId] = useState<COLOR_IDS>(COLOR_IDS.BRAND_ACCENT);

	const [subtopicFilters] = useState([
		{ title: 'Mood', value: 'MOOD' },
		{ title: 'Anxiety', value: 'ANXIETY' },
		{ title: 'Sleep/Fatigue', value: 'SLEEP_FATIGUE' },
		{ title: 'Substance Use', value: 'SUBSTANCE_USE' },
	]);
	const [typeFilters] = useState([
		{ title: 'Video', value: 'VIDEO' },
		{ title: 'Podcast', value: 'PODCAST' },
		{ title: 'Article', value: 'ARTICLE' },
		{ title: 'Website', value: 'WEBSITE' },
		{ title: 'App', value: 'APP' },
	]);
	const [lengthFilters] = useState([
		{ title: '<5 Minutes', value: 'LESS_THAN_FIVE_MINUTES' },
		{ title: '5-10 Minutes', value: 'FIVE_TO_TEN_MINUTES' },
		{ title: '10-30 Minutes', value: 'TEN_TO_THIRTY_MINUTES' },
		{ title: '>30 Minutes', value: 'GREATER_THAN_THIRTY_MINUTES' },
	]);

	const [selectedSubtopicFilters, setSelectedSubtopicFilters] = useState<string[]>(searchParams.getAll('subtopicId'));
	const [selectedTypeFilters, setSelectedTypeFilters] = useState<string[]>(searchParams.getAll('typeId'));
	const [selectedLengthFilters, setSelectedLengthFilters] = useState<string[]>(searchParams.getAll('lengthId'));

	const [subtopicFilterIsShowing, setSubtopicFilterIsShowing] = useState(false);
	const [typeFilterIsShowing, setTypeFilterIsShowing] = useState(false);
	const [lengthFilterIsShowing, setLengthFilterIsShowing] = useState(false);

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

	const getUpdatedValueForFilter = (valueToAddOrRemove: string, filter: string[]) => {
		const filterClone = cloneDeep(filter);
		const indexToRemove = filterClone.findIndex((v) => v === valueToAddOrRemove);

		if (indexToRemove > -1) {
			filterClone.splice(indexToRemove, 1);
		} else {
			filterClone.push(valueToAddOrRemove);
		}

		return filterClone;
	};

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
						<SimpleFilter
							className="me-2"
							title="Subtopic"
							show={subtopicFilterIsShowing}
							active={searchParams.getAll('subtopicId').length > 0}
							onClick={() => {
								setSubtopicFilterIsShowing(true);
							}}
							onHide={() => {
								setSelectedSubtopicFilters(searchParams.getAll('subtopicId'));
								setSubtopicFilterIsShowing(false);
							}}
							onClear={() => {
								applyValuesToSearchParam([], 'subtopicId');
								setSelectedSubtopicFilters([]);
								setSubtopicFilterIsShowing(false);
							}}
							onApply={() => {
								applyValuesToSearchParam(selectedSubtopicFilters, 'subtopicId');
								setSubtopicFilterIsShowing(false);
							}}
						>
							{subtopicFilters.map((filter) => {
								return (
									<Form.Check
										key={filter.value}
										type="checkbox"
										name="subtopic"
										id={`subtopic--${filter.value}`}
										label={filter.title}
										value={filter.value}
										checked={selectedSubtopicFilters.includes(filter.value)}
										onChange={({ currentTarget }) => {
											const updatedValue = getUpdatedValueForFilter(
												currentTarget.value,
												selectedSubtopicFilters
											);
											setSelectedSubtopicFilters(updatedValue);
										}}
									/>
								);
							})}
						</SimpleFilter>
						<SimpleFilter
							className="me-2"
							title="Type"
							show={typeFilterIsShowing}
							active={searchParams.getAll('typeId').length > 0}
							onClick={() => {
								setTypeFilterIsShowing(true);
							}}
							onHide={() => {
								setSelectedTypeFilters(searchParams.getAll('typeId'));
								setTypeFilterIsShowing(false);
							}}
							onClear={() => {
								applyValuesToSearchParam([], 'typeId');
								setSelectedTypeFilters([]);
								setTypeFilterIsShowing(false);
							}}
							onApply={() => {
								applyValuesToSearchParam(selectedTypeFilters, 'typeId');
								setTypeFilterIsShowing(false);
							}}
						>
							{typeFilters.map((filter) => {
								return (
									<Form.Check
										key={filter.value}
										type="checkbox"
										name="type"
										id={`type--${filter.value}`}
										label={filter.title}
										value={filter.value}
										checked={selectedTypeFilters.includes(filter.value)}
										onChange={({ currentTarget }) => {
											const updatedValue = getUpdatedValueForFilter(
												currentTarget.value,
												selectedTypeFilters
											);
											setSelectedTypeFilters(updatedValue);
										}}
									/>
								);
							})}
						</SimpleFilter>
						<SimpleFilter
							title="Length"
							show={lengthFilterIsShowing}
							active={searchParams.getAll('lengthId').length > 0}
							onClick={() => {
								setLengthFilterIsShowing(true);
							}}
							onHide={() => {
								setSelectedLengthFilters(searchParams.getAll('lengthId'));
								setLengthFilterIsShowing(false);
							}}
							onClear={() => {
								applyValuesToSearchParam([], 'lengthId');
								setSelectedLengthFilters([]);
								setLengthFilterIsShowing(false);
							}}
							onApply={() => {
								applyValuesToSearchParam(selectedLengthFilters, 'lengthId');
								setLengthFilterIsShowing(false);
							}}
						>
							{lengthFilters.map((filter) => {
								return (
									<Form.Check
										key={filter.value}
										type="checkbox"
										name="length"
										id={`length--${filter.value}`}
										label={filter.title}
										value={filter.value}
										checked={selectedLengthFilters.includes(filter.value)}
										onChange={({ currentTarget }) => {
											const updatedValue = getUpdatedValueForFilter(
												currentTarget.value,
												selectedLengthFilters
											);
											setSelectedLengthFilters(updatedValue);
										}}
									/>
								);
							})}
						</SimpleFilter>
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
