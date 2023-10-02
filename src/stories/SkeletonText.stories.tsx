import { SkeletonText } from '@/components/skeleton-loaders';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const meta: Meta<typeof SkeletonText> = {
	title: 'SkeletonText',
	component: SkeletonText,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof SkeletonText>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col>
						<SkeletonText {...args} />
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		bgColor: undefined,
		type: 'h4',
		width: '100%',
		className: '',
		numberOfLines: 3,
	},
};
