import type { Meta, StoryObj } from '@storybook/react';

import { Button } from 'react-bootstrap';

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof Button> = {
	title: 'Button',
	component: Button,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
		layout: 'centered',
	},
	// // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
	tags: ['autodocs'],
	// More on argTypes: https://storybook.js.org/docs/react/api/argtypes
	argTypes: {
		variant: {
			options: ['primary', 'outline-primary', 'light', 'danger', 'link'],
			control: { type: 'radio' },
		},
		size: {
			options: [undefined, 'lg', 'sm'],
			control: { type: 'select' },
		},
	},
};

export default meta;

type Story = StoryObj<typeof Button>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
	args: {
		variant: 'primary',
		children: 'Button Text',
	},
};
