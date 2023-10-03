import InputHelper from '@/components/input-helper';
import ToggledInput from '@/components/toggled-input';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from 'react-bootstrap';

const meta: Meta<typeof ToggledInput> = {
	title: 'ToggledInput',
	component: ToggledInput,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof ToggledInput>;

export const Default: Story = {
	render: (args) => {
		return <ToggledInput {...args} />;
	},
	args: {
		label: 'SelectToggle',
		checked: true,
		hideChildren: false,
		detail: <Button variant="link">Detail</Button>,
		children: <InputHelper className="mb-2" label="Input Label" required />,
		onChange: () => {
			//
		},
	},
};
