import ResourceLibraryCard from '@/components/resource-library-card';
import { ContentTypeId } from '@/lib/models';
import { withRouter } from 'storybook-addon-react-router-v6';
import type { Meta, StoryObj } from '@storybook/react';
import { Col, Container, Row } from 'react-bootstrap';
import React from 'react';

const meta: Meta<typeof ResourceLibraryCard> = {
	title: 'ResourceLibraryCard',
	component: ResourceLibraryCard,
	tags: ['autodocs'],
	argTypes: {},
	decorators: [withRouter],
};

export default meta;

type Story = StoryObj<typeof ResourceLibraryCard>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col md={4}>
						<ResourceLibraryCard {...args} />
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		contentId: 'content-id-1',
		title: 'Card Title',
		author: 'Card Author',
		description: 'Card Description',
		tags: [
			{
				description: 'Tag 1 Description',
				name: 'Tag 1',
				tagGroupId: 'tag-group-id-1',
				tagId: 'tag-id-1',
				urlName: 'tag-1',
			},
			{
				description: 'Tag 2 Description',
				name: 'Tag 2',
				tagGroupId: 'tag-group-id-1',
				tagId: 'tag-id-2',
				urlName: 'tag-2',
			},
		],
		contentTypeId: ContentTypeId.Article,
		badgeTitle: 'Badge Title',
		imageUrl: 'https://picsum.photos/200/300',
		duration: '1h 30m',
	},
};
