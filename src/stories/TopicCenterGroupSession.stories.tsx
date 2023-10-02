import { TopicCenterGroupSession } from '@/components/topic-center-group-session';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const meta: Meta<typeof TopicCenterGroupSession> = {
	title: 'TopicCenterGroupSession',
	component: TopicCenterGroupSession,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TopicCenterGroupSession>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 10, offset: 1 }} xl={{ span: 8, offset: 2 }}>
						<TopicCenterGroupSession {...args} />
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		title: 'Title',
		titleSecondary: 'Title Secondary',
		titleTertiary: 'Title Tertiary',
		description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		badgeTitle: 'Badge Title',
		buttonTitle: 'Button Title',
		onClick: () => {
			alert('Group Session Clicked!');
		},
		imageUrl: 'https://via.placeholder.com/300x200',
		className: '',
	},
};
