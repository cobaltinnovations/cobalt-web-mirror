import Blurb from '@/components/blurb';
import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';
import { Meta, StoryObj } from '@storybook/react';
import React, { ReactNode } from 'react';

const meta: Meta<typeof Blurb> = {
	title: 'Blurb',
	component: Blurb,
	tags: ['autodocs'],
	argTypes: {},
};

const PlaceholderImageChild = ({ children }: { children: (placeholderImageUrl: string) => ReactNode }) => {
	const placeholderImageUrl = useRandomPlaceholderImage();

	return <>{children(placeholderImageUrl)}</>;
};

export default meta;

type Story = StoryObj<typeof Blurb>;

export const Default: Story = {
	render: (args) => {
		return (
			<PlaceholderImageChild>
				{(imageUrl) => <Blurb {...args} teamMemberImageUrl={args.teamMemberImageUrl || imageUrl} />}
			</PlaceholderImageChild>
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
