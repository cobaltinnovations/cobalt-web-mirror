import React, { useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { COLOR_IDS, ContentTypeId } from '@/lib/models';
import { getBackgroundClassForColorId } from '@/lib/utils/color-utils';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';
import ResourceLibraryCard from '@/components/resource-library-card';
import { useParams } from 'react-router-dom';

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
	const [colorId] = useState<COLOR_IDS>(COLOR_IDS.BRAND_ACCENT);
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

	return (
		<AsyncPage fetchData={fetchData}>
			<HeroContainer className={getBackgroundClassForColorId(colorId)}>
				<h1 className="mb-4 text-center">Symptoms</h1>
				<p className="mb-0 text-center fs-large">
					Browse content tailored to symptoms you or others in your life may be experiencing, including
					concerns about mood, anxiety, sleep, fatigue or substance abuse
				</p>
			</HeroContainer>
			<Container className="pt-16 pb-32">
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
