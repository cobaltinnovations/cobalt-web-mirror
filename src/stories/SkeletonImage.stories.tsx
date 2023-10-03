import { SkeletonImage } from '@/components/skeleton-loaders';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

const meta: Meta<typeof SkeletonImage> = {
	title: 'SkeletonImage',
	component: SkeletonImage,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof SkeletonImage>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<Row>
					<Col>
						<SkeletonImage {...args}>
							<div style={{ minHeight: 400 }} />
						</SkeletonImage>
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		bgColor: undefined,
		width: '100%',
		height: '100%',
		className: '',
	},
};
