import React, { useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { COLOR_IDS, ContentTypeId } from '@/lib/models';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import InputHelper from '@/components/input-helper';
import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import Carousel from '@/components/carousel';
import ResourceLibraryCard from '@/components/resource-library-card';

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

interface ResourceSubtopic {
	title: string;
	tagGroupId: string;
	description: string;
	resources: Resource[];
	colorId: COLOR_IDS;
}
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

const ResourceLibrary = () => {
	const [searchInputValue, setSearchInputValue] = useState('');
	const [resourceSubtopics] = useState<ResourceSubtopic[]>([
		{
			colorId: COLOR_IDS.BRAND_ACCENT,
			title: 'Symptoms',
			tagGroupId: 'symptoms',
			description:
				'Browse content tailored to symptoms you or others in your life may be experiencing, including concerns about mood, anxiety, sleep, fatigue or substance abuse.',
			resources: [
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
			],
		},
		{
			colorId: COLOR_IDS.SEMANTIC_WARNING,
			title: 'Personal Life',
			tagGroupId: 'personal-life',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			resources: [
				{
					subtopic: 'Personal Life',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Article,
				},
				{
					subtopic: 'Personal Life',
					title: 'This is a title that has multiple lines. It can run on to two lines, but not more than that. Two is the maximum line length that titles can have.',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.ExternalBlog,
				},
				{
					subtopic: 'Personal Life',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.InternalBlog,
				},
			],
		},
		{
			colorId: COLOR_IDS.SEMANTIC_SUCCESS,
			title: 'Work Life',
			tagGroupId: 'work-life',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			resources: [
				{
					subtopic: 'Work Life',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Worksheet,
				},
				{
					subtopic: 'Work Life',
					title: 'This is a title that has multiple lines. It can run on to two lines, but not more than that. Two is the maximum line length that titles can have.',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.App,
				},
				{
					subtopic: 'Work Life',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Video,
				},
			],
		},
		{
			colorId: COLOR_IDS.SEMANTIC_INFO,
			title: 'Identity',
			tagGroupId: 'identity',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			resources: [
				{
					subtopic: 'Identity',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Audio,
				},
				{
					subtopic: 'Identity',
					title: 'This is a title that has multiple lines. It can run on to two lines, but not more than that. Two is the maximum line length that titles can have.',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Video,
				},
				{
					subtopic: 'Identity',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Podcast,
				},
			],
		},
		{
			colorId: COLOR_IDS.SEMANTIC_DANGER,
			title: 'World Events',
			tagGroupId: 'world-events',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			resources: [
				{
					subtopic: 'World Events',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Podcast,
				},
				{
					subtopic: 'World Events',
					title: 'This is a title that has multiple lines. It can run on to two lines, but not more than that. Two is the maximum line length that titles can have.',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Article,
				},
				{
					subtopic: 'World Events',
					title: 'This is the Title of the Content',
					author: 'Kathleen Murphy, MD',
					description:
						'<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Feugiat nisl nunc eget pellentesque quis facilisis. Feugiat nisl nunc eget pellentesque quis facilisis.</p>',
					tags: [],
					contentTypeId: ContentTypeId.Video,
				},
			],
		},
	]);

	const fetchData = useCallback(() => {
		return null;
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
				{resourceSubtopics.map((subtopic, subtopicIndex) => {
					return (
						<Row key={subtopicIndex} className="mb-11 mb-lg-18">
							<Col lg={3} className="mb-10 mb-lg-0 pt-4 pb-2">
								<ResourceLibrarySubtopicCard
									className="h-100"
									colorId={subtopic.colorId}
									title={subtopic.title}
									description={subtopic.description}
									to={`/resource-library/tag-groups/${subtopic.tagGroupId}`}
								/>
							</Col>
							<Col lg={9}>
								<Carousel
									responsive={carouselConfig}
									trackStyles={{ paddingTop: 16, paddingBottom: 8 }}
									floatingButtonGroup
								>
									{subtopic.resources.map((resource, resourceIndex) => {
										return (
											<ResourceLibraryCard
												key={`${subtopicIndex}-${resourceIndex}`}
												colorId={subtopic.colorId}
												className="h-100"
												badgeTitle={resource.new ? 'New' : ''}
												subtopic={resource.subtopic}
												subtopicTo={`/resource-library/tag-groups/${subtopic.tagGroupId}`}
												title={resource.title}
												author={resource.author}
												description={resource.description}
												tags={resource.tags}
												contentTypeId={resource.contentTypeId}
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
