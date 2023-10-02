import TimeInput from '@/components/time-input';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof TimeInput> = {
	title: 'TimeInput',
	component: TimeInput,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeInput>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ maxWidth: 400 }}>
				<p>Used in Native-scheduling availability + appointment forms</p>
				<TimeInput {...args} />
			</div>
		);
	},
	args: {
		meridian: 'am',
		onMeridianChange: (meridian) => {
			alert('Meridian Changed ' + meridian);
		},

		label: 'Input Label',
		helperText: '',
		error: '',
		required: false,
		className: '',
	},
};
