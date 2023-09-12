import InlineAlert from '@/components/inline-alert';

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof InlineAlert> = {
	title: 'InlineAlert',
	component: InlineAlert,
	parameters: {},
	tags: ['autodocs'],
	argTypes: {
		variant: {
			control: { type: 'select' },
			options: ['primary', 'success', 'warning', 'danger', 'info', 'attention'],
		},
		title: {
			control: { type: 'text' },
		},
		description: {
			control: { type: 'text' },
			defaultValue:
				'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id purus ac diam aliquam aliquam.',
		},
		className: {
			control: { type: 'text' },
		},
		action: {
			control: { type: 'object' },
		},
	},
};

export default meta;

type Story = StoryObj<typeof InlineAlert>;

export const Default: Story = {
	render: (args) => {
		return <InlineAlert {...args} />;
	},
	args: {
		title: 'Default',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id purus ac diam aliquam aliquam.',
		action: {
			title: 'Action',
			onClick: () => {
				alert('Action clicked');
			},
		},
	},
};

export const MultiAction: Story = {
	render: (args) => {
		return <InlineAlert {...args} />;
	},
	args: {
		variant: 'attention',
		title: 'Multi Action',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id purus ac diam aliquam aliquam.',
		action: [
			{
				title: 'Action 1',
				onClick: () => {
					alert('Action 1 clicked');
				},
			},
			{
				title: 'Action 2',
				onClick: () => {
					alert('Action 2 clicked');
				},
			},
		],
	},
};
