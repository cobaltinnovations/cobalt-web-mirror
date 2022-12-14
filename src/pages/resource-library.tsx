import React, { useCallback, useState } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';

import { COLOR_IDS, ResourceLibraryContentModel, TagGroupModel, TagModel } from '@/lib/models';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import InputHelper from '@/components/input-helper';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import ResourceLibraryCard from '@/components/resource-library-card';
import { resourceLibraryService } from '@/lib/services';
import { useSearchParams } from 'react-router-dom';

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
		items: 2,
		partialVisibilityGutter: 0,
	},
};

const ResourceLibrary = () => {
	const [searchParams, setSearchParams] = useSearchParams();
	const searchQuery = searchParams.get('searchQuery') ?? '';

	const [searchInputValue, setSearchInputValue] = useState('');
	const [tagGroups, setTagGroups] = useState<TagGroupModel[]>([]);
	const [contents, setContents] = useState<ResourceLibraryContentModel[]>([]);
	const [findResultTotalCount, setFindResultTotalCount] = useState(0);
	const [findResultTotalCountDescription, setFindResultTotalCountDescription] = useState('');
	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, ResourceLibraryContentModel[]>>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();

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

		const response = await resourceLibraryService.getResourceLibrary().fetch();

		setContents([]);
		setFindResultTotalCount(0);
		setFindResultTotalCountDescription('');
		setTagGroups(response.tagGroups);
		setContentsByTagGroupId(response.contentsByTagGroupId);
		setTagsByTagId(response.tagsByTagId);
	}, [searchQuery]);

	const handleSearchFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSearchParams(
			{
				...searchParams,
				...(searchInputValue && { searchQuery: searchInputValue }),
			},
			{ replace: true }
		);
	};

	return (
		<>
			<HeroContainer className="bg-n75">
				<h1 className="mb-4 text-center">Resource Library</h1>
				<p className="mb-6 text-center fs-large">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Magna aliquam lacus, mattis sem volutpat
					rhoncus massa.
				</p>
				<Form onSubmit={handleSearchFormSubmit}>
					<InputHelper
						type="search"
						label="Search Resources"
						value={searchInputValue}
						onChange={({ currentTarget }) => {
							setSearchInputValue(currentTarget.value);
						}}
					/>
				</Form>
			</HeroContainer>
			<AsyncPage fetchData={fetchData}>
				<Container className="pt-16 pb-32">
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
													colorId={tagGroup.colorId}
													className="h-100"
													imageUrl={content.imageUrl}
													badgeTitle={content.newFlag ? 'New' : ''}
													subtopic={tagGroup.name}
													subtopicTo={`/resource-library/tag-groups/${tagGroup.urlName}`}
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
					{searchQuery && (
						<>
							<Row className="mb-10">
								<h3 className="mb-0">
									{findResultTotalCountDescription} result{findResultTotalCount === 1 ? '' : 's'}
								</h3>
							</Row>
							<Row>
								{contents.map((resource, resourceIndex) => {
									return (
										<Col key={resourceIndex} xs={6} lg={4} className="mb-8">
											<ResourceLibraryCard
												colorId={COLOR_IDS.BRAND_ACCENT}
												className="h-100"
												imageUrl={resource.imageUrl}
												badgeTitle={resource.newFlag ? 'New' : ''}
												subtopic={'[TODO: TagGroupName]'}
												subtopicTo={`/resource-library/tag-groups/TODOTagGroupId`}
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
						</>
					)}
				</Container>
			</AsyncPage>
		</>
	);
};

export default ResourceLibrary;
