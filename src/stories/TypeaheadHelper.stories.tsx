import { TypeaheadHelper } from '@/components/typeahead-helper';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof TypeaheadHelper> = {
	title: 'TypeaheadHelper',
	component: TypeaheadHelper,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof TypeaheadHelper>;

export const Default: Story = {
	render: (args) => {
		return (
			<div
				style={{
					minHeight: 300,
				}}
			>
				<TypeaheadHelper {...args} />
			</div>
		);
	},
	args: {
		id: 'typeahead-id',
		label: 'Typeahead Label',
		multiple: false,
		labelKey: '',
		options: ['Option 1', 'Option 2', 'Option 3'],
		selected: ['Option 1'],
		onChange: (selected) => {
			//
		},
	},
};

export const Multiple: Story = {
	render: (args) => {
		return (
			<div
				style={{
					minHeight: 300,
				}}
			>
				<TypeaheadHelper {...args} />
			</div>
		);
	},
	args: {
		id: 'typeahead-id',
		label: 'Typeahead Label',
		multiple: true,
		labelKey: '',
		options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
		selected: ['Option 1', 'Option 3'],
		onChange: (selected) => {
			//
		},
	},
};
