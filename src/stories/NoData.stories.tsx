import NoData from '@/components/no-data';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof NoData> = {
	title: 'NoData',
	component: NoData,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NoData>;

export const Default: Story = {
	render: (args) => {
		return <NoData {...args} />;
	},
	args: {
		// illustration?: ReactElement;
		title: 'Title',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		actions: [
			{
				variant: 'primary',
				title: 'Action 1',
				onClick: () => {
					alert('Action Clicked');
				},
				disabled: false,
			},
		],
		className: '',
	},
};
