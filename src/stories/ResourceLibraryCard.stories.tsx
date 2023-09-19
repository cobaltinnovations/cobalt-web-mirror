import ResourceLibraryCard, { ResourceLibraryCardProps } from '@/components/resource-library-card';
import resourceLibraryCardPropsJSON from '@/fixtures/resource-library-card-props.json';
import type { Meta, StoryObj } from '@storybook/react';
import { Col, Container, Row } from 'react-bootstrap';
import React from 'react';
import { ContentTypeId } from '@/lib/models';

const meta: Meta<typeof ResourceLibraryCard> = {
	title: 'ResourceLibraryCard',
	component: ResourceLibraryCard,
	tags: ['autodocs'],
	argTypes: {
		contentTypeId: {
			control: { type: 'select' },
			options: Object.values(ContentTypeId),
		},
	},
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
	args: resourceLibraryCardPropsJSON as ResourceLibraryCardProps,
};
