import FilterDropdown from '@/components/filter-dropdown';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Container, Form } from 'react-bootstrap';

const meta: Meta<typeof FilterDropdown> = {
	title: 'FilterDropdown',
	component: FilterDropdown,
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof FilterDropdown>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container style={{ minHeight: 400, minWidth: 400 }}>
				<FilterDropdown {...args} />
			</Container>
		);
	},
	args: {
		className: '',
		active: false,
		// id="admin-group-session-filter-visibility"
		title: 'Dropdown Filter',
		dismissText: 'Clear',
		onDismiss: () => {
			alert('Dismiss');
		},
		confirmText: 'Apply',
		onConfirm: () => {
			alert('Confirm');
		},
		width: 240,
		children: [...Array(6)].map((_, i) => {
			return (
				<Form.Check
					key={i}
					type="radio"
					id={'option-' + i}
					label={'Option ' + (i + 1)}
					value={i}
					checked={false}
					onChange={({ currentTarget }) => {
						// setSelectedValue(currentTarget.value);
					}}
				/>
			);
		}),
	},
};
