import HeaderAlert from '@/components/header-alert';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof HeaderAlert> = {
	title: 'HeaderAlert',
	component: HeaderAlert,
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['primary', 'success', 'warning', 'danger'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof HeaderAlert>;

export const Default: Story = {
	render: (args) => {
		return <HeaderAlert {...args} />;
	},
	args: {
		title: 'Alert Title',
		message: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
		variant: 'primary',
		dismissable: true,
		onDismiss: () => {
			alert('Dismiss Clicked!');
		},
		className: '',
	},
};
