import InputHelperSearch, { InputHelperSearchProps } from '@/components/input-helper-search';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';

const meta: Meta<typeof InputHelperSearch> = {
	title: 'InputHelperSearch',
	component: InputHelperSearch,
	parameters: {},
	tags: ['autodocs'],
	render: (props) => {
		return (
			<div style={{ width: 300 }}>
				<InputHelperSearchStateWrapper {...props} />
			</div>
		);
	},
};

export default meta;

type Story = StoryObj<typeof InputHelperSearch>;

function InputHelperSearchStateWrapper(inputHelperProps: InputHelperSearchProps) {
	const [value, setValue] = useState('');

	return (
		<InputHelperSearch
			value={value}
			onChange={(e) => {
				setValue(e.currentTarget.value);
			}}
			{...inputHelperProps}
		/>
	);
}

export const Default: Story = {
	args: {
		placeholder: 'Find a Group Session',
		onClear: () => {
			alert('clear!');
		},
	},
};
