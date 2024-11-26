import { HeaderNavFeaturedItem } from '@/components/header-nav-featured-item';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof HeaderNavFeaturedItem> = {
	title: 'HeaderNavFeaturedItem',
	component: HeaderNavFeaturedItem,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof HeaderNavFeaturedItem>;

export const Default: Story = {
	render: (args) => {
		return <HeaderNavFeaturedItem {...args} />;
	},
	args: {
		featuredItem: {
			subtitle: 'Subtitle',
			imageUrl: 'https://via.placeholder.com/150x150',
			imageAlt: 'Image Alt',
			name: 'Name',
			descriptionHtml: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
			linkTo: {
				pathname: '',
				hash: '#',
			},
			topicCenterId: '',
		},
		mobileNav: false,
		onImageClick: () => {
			//
		},
		className: '',
	},
};
