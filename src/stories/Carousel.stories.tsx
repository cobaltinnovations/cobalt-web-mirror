import Carousel, { responsiveDefaults } from '@/components/carousel';
import ResourceLibraryCard, { ResourceLibraryCardProps } from '@/components/resource-library-card';
import StudioEvent from '@/components/studio-event';
import resourceLibraryCardPropsJSON from '@/fixtures/resource-library-card-props.json';
import groupSessionJSON from '@/fixtures/group-session.json';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { GroupSessionModel } from '@/lib/models';
import { Link } from 'react-router-dom';
import { resourceLibraryCarouselConfig } from '@/pages/resource-library';

const meta: Meta<typeof Carousel> = {
	title: 'Carousel',
	component: Carousel,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const GroupSession: Story = {
	render: (args) => {
		const studioEvent = { ...groupSessionJSON } as GroupSessionModel;
		return (
			<Container>
				<Row>
					<Col>
						<Carousel {...args}>
							{[...Array(5)].map((_, i) => (
								<Link key={i} className="d-block text-decoration-none h-100" to={'.'}>
									<StudioEvent className="h-100" studioEvent={studioEvent} />
								</Link>
							))}
						</Carousel>
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		responsive: responsiveDefaults,
		description: 'Carousel Description',
		calloutTitle: 'Callout',
		calloutOnClick: () => {
			alert('Callout Clicked');
		},
		floatingButtonGroup: false,
		className: '',
	},
};

export const ResourceLibrary: Story = {
	render: (args) => {
		const cardProps = resourceLibraryCardPropsJSON as ResourceLibraryCardProps;

		return (
			<Container>
				<Row>
					<Col>
						<Carousel {...args}>
							{[...Array(5)].map((_, i) => (
								<ResourceLibraryCard key={i} className="h-100" {...cardProps} badgeTitle="" />
							))}
						</Carousel>
					</Col>
				</Row>
			</Container>
		);
	},
	args: {
		responsive: resourceLibraryCarouselConfig,
		calloutOnClick: () => {
			alert('Callout Clicked');
		},
		floatingButtonGroup: true,
	},
};
