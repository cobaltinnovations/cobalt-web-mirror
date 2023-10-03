import StudioEvent from '@/components/studio-event';
import groupSessionJSON from '@/fixtures/group-session.json';
import { GroupSessionModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const meta: Meta<typeof StudioEvent> = {
	title: 'StudioEvent',
	component: StudioEvent,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof StudioEvent>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col lg={4}>
						<StudioEvent {...args} />
					</Col>
					<Col lg={4}>
						<StudioEvent {...args} />
					</Col>
					<Col lg={4}>
						<StudioEvent {...args} />
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		studioEvent: groupSessionJSON as GroupSessionModel,
		className: '',
	},
};
