import FloatingActionButton from '@/components/floating-action-button';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof FloatingActionButton> = {
	title: 'FloatingActionButton',
	component: FloatingActionButton,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof FloatingActionButton>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 500 }}>
				<FloatingActionButton {...args} />
			</div>
		);
	},
	args: {
		onClick: () => {
			alert('FAB Clicked!');
		},
	},
};
