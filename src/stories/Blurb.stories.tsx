import Blurb from '@/components/blurb';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { PlaceholderImageRenderer } from './helpers/placeholder-image-renderer';

const meta: Meta<typeof Blurb> = {
	title: 'Blurb',
	component: Blurb,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof Blurb>;

export const Default: Story = {
	render: (args) => {
		return (
			<PlaceholderImageRenderer>
				{(imageUrl) => <Blurb {...args} teamMemberImageUrl={args.teamMemberImageUrl || imageUrl} />}
			</PlaceholderImageRenderer>
		);
	},
	args: {
		teamMemberImageUrl: '',
		speechBubbleTitle: 'Bubble Title',
		speechBubbleDestription:
			'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		modalTitle: 'Bubble Modal Title',
		modalDestription:
			'<p>lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p><p>lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>',
	},
};
