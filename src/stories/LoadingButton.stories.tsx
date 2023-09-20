import LoadingButton from '@/components/loading-button';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof LoadingButton> = {
	title: 'LoadingButton',
	component: LoadingButton,
	parameters: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof LoadingButton>;

export const Default: Story = {
	render: (args) => {
		return <LoadingButton {...args} />;
	},
	args: {
		isLoading: false,
		children: <>Button Label</>,
	},
};
