import SimpleFilter, { SimpleFilterProps } from '@/components/simple-filter';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';

const meta: Meta<typeof SimpleFilter> = {
	title: 'SimpleFilter',
	component: SimpleFilter,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof SimpleFilter>;

const SimpleFilterStateWrapper = (props: SimpleFilterProps) => {
	const [isShowing, setIsShowing] = useState(false);

	return (
		<SimpleFilter
			{...props}
			onClick={() => {
				setIsShowing(true);
			}}
			show={isShowing}
			onHide={() => setIsShowing(false)}
		/>
	);
};
export const Default: Story = {
	render: (args) => {
		return <SimpleFilterStateWrapper {...args} />;
	},
	args: {
		title: 'Title',
		onClear: () => {
			//
		},
		onApply: () => {
			//
		},
		activeLength: 10,
		dialogWidth: 300,
		className: '',
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
