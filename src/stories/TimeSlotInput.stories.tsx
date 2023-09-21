import { InputHelperProps } from '@/components/input-helper';
import TimeSlotInput from '@/components/time-slot-input';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

const meta: Meta<typeof TimeSlotInput> = {
	title: 'TimeSlotInput',
	component: TimeSlotInput,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeSlotInput>;

function TimeSlotInputStateWrapper(inputHelperProps: InputHelperProps) {
	const [value, setValue] = useState('');

	return (
		<TimeSlotInput
			value={value}
			onChange={(e) => {
				setValue(e.currentTarget.value);
			}}
			{...inputHelperProps}
		/>
	);
}

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400, maxWidth: 400 }}>
				<p>Used in Group Session Form</p>
				<TimeSlotInputStateWrapper {...args} />
			</div>
		);
	},
	args: {
		label: 'Input Label',
		required: false,
		helperText: '',
		placeholder: 'Select a time',
	},
};
