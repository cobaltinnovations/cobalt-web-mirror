import DatePicker from '@/components/date-picker';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Container } from 'react-bootstrap';

const meta: Meta<typeof DatePicker> = {
	title: 'DatePicker',
	parameters: {
		layout: 'centered',
	},
	component: DatePicker,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<div
					style={{
						minWidth: 300,
					}}
				>
					<DatePicker {...args} />
				</div>
			</Container>
		);
	},
	args: {
		selected: new Date(),
		required: true,
		disabled: false,
		onChange: (nextDate) => {
			alert('Date Changed ' + nextDate?.toISOString());
		},
		labelText: 'Label Text',
		wrapperClass: '',
	},
};
