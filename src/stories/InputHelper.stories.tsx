import InputHelper, { InputHelperProps } from '@/components/input-helper';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

const meta: Meta<typeof InputHelper> = {
	title: 'InputHelper',
	component: InputHelper,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		type: {
			control: { type: 'select' },
			options: ['text', 'email', 'password', 'number', 'tel', 'url'],
		},
		label: {
			control: { type: 'text' },
		},
		required: {
			control: { type: 'boolean' },
		},
		disabled: {
			control: { type: 'boolean' },
		},
		error: {
			control: { type: 'text' },
		},
	},
	render: (props) => {
		return (
			<div style={{ width: 300 }}>
				<InputHelperStateWrapper {...props} />
			</div>
		);
	},
};

function InputHelperStateWrapper(inputHelperProps: InputHelperProps) {
	const [value, setValue] = useState('');

	return (
		<InputHelper
			value={value}
			onChange={(e) => {
				setValue(e.currentTarget.value);
			}}
			{...inputHelperProps}
		/>
	);
}

export default meta;

type Story = StoryObj<typeof InputHelper>;

export const Text: Story = {
	args: {
		type: 'text',
		label: 'Input Label',
	},
};

export const Textarea: Story = {
	args: {
		as: 'textarea',
		label: 'Textarea Label',
	},
};

export const Select: Story = {
	args: {
		as: 'select',
		label: 'Select Label',
		children: (
			<>
				<option value="">Select an option</option>
				{Array.from({ length: 10 }, (_, i) => (
					<option key={i} value={i}>
						{i}
					</option>
				))}
			</>
		),
	},
};
