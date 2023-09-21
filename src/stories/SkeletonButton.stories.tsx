import { SkeletonButton } from '@/components/skeleton-loaders';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const meta: Meta<typeof SkeletonButton> = {
	title: 'SkeletonButton',
	component: SkeletonButton,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof SkeletonButton>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col>
						<SkeletonButton {...args} />
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		bgColor: undefined,
		width: '100%',
		className: '',
	},
};
