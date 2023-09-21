import { SkeletonBadge } from '@/components/skeleton-loaders';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const meta: Meta<typeof SkeletonBadge> = {
	title: 'SkeletonBadge',
	component: SkeletonBadge,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof SkeletonBadge>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col>
						<SkeletonBadge {...args} />
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		bgColor: undefined,
		className: '',
	},
};
