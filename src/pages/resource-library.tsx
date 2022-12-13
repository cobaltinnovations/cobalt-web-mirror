import React, { useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { COLOR_IDS, ResourceLibraryContentModel, TagGroupModel, TagModel } from '@/lib/models';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import InputHelper from '@/components/input-helper';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import ResourceLibraryCard from '@/components/resource-library-card';
import { resourceLibraryService } from '@/lib/services';

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
	const [searchInputValue, setSearchInputValue] = useState('');
	const [tagGroups, setTagGroups] = useState<TagGroupModel[]>([]);
	const [contentsByTagGroupId, setContentsByTagGroupId] = useState<Record<string, ResourceLibraryContentModel[]>>();
	const [tagsByTagId, setTagsByTagId] = useState<Record<string, TagModel>>();

	const fetchData = useCallback(async () => {
		const response = await resourceLibraryService.getResourceLibrary().fetch();

		setTagGroups(response.tagGroups);
		setContentsByTagGroupId(response.contentsByTagGroupId);
		setTagsByTagId(response.tagsByTagId);
	}, []);

	return (
		<AsyncPage fetchData={fetchData}>
			<HeroContainer className="bg-n75">
				<h1 className="mb-4 text-center">Resource Library</h1>
				<p className="mb-6 text-center fs-large">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Magna aliquam lacus, mattis sem volutpat
					rhoncus massa.
				</p>
				<InputHelper
					type="search"
					label="Search Resources"
					value={searchInputValue}
					onChange={({ currentTarget }) => {
						setSearchInputValue(currentTarget.value);
					}}
				/>
			</HeroContainer>
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
									{contentsByTagGroupId &&
										contentsByTagGroupId[tagGroup.tagGroupId].map((content) => {
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
													duration={content.duration}
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
	);
};

export default ResourceLibrary;
