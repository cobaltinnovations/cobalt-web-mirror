import TimeInputV2 from '@/components/time-input-v2';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof TimeInputV2> = {
	title: 'TimeInputV2',
	component: TimeInputV2,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TimeInputV2>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400, maxWidth: 400 }}>
				<p>Used in Integrated Care features</p>
				<TimeInputV2 {...args} />
			</div>
		);
	},
	args: {
		id: 'time-input-v2',
		label: 'Input Label',
		value: '',
		onChange: (value: string) => {
			alert('Time Changed ' + value);
		},
		disabled: false,
		required: false,
		className: '',
		date: new Date(),
	},
};
