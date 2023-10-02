import ResourceLibrarySubtopicCard from '@/components/resource-library-subtopic-card';
import { COLOR_IDS } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const meta: Meta<typeof ResourceLibrarySubtopicCard> = {
	title: 'ResourceLibrarySubtopicCard',
	component: ResourceLibrarySubtopicCard,
	tags: ['autodocs'],
	argTypes: {
		colorId: {
			control: { type: 'select' },
			options: Object.values(COLOR_IDS),
		},
	},
};

export default meta;

type Story = StoryObj<typeof ResourceLibrarySubtopicCard>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col lg={3}>
						<ResourceLibrarySubtopicCard {...args} />
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		colorId: COLOR_IDS.BRAND_PRIMARY,
		title: 'TITLE',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		to: '',
		className: '',
	},
};
