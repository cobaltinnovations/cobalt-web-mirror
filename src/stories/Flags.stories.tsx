import Flags from '@/components/flags';
import { FlagModel } from '@/contexts/flags-context';
import useFlags from '@/hooks/use-flags';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from 'react-bootstrap';

const meta: Meta<typeof Flags> = {
	title: 'Flags',
	component: Flags,
	parameters: {},
	tags: ['autodocs'],
	argTypes: {
		text: {
			control: { type: 'text' },
		},
		variant: {
			control: { type: 'select' },
			options: [
				'primary',
				'success',
				'warning',
				'danger',
				'bold-primary',
				'bold-success',
				'bold-warning',
				'bold-danger',
			],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Flags>;

const ShowFlags = (flagModel: Pick<FlagModel, 'variant' | 'title' | 'description' | 'initExpanded' | 'actions'>) => {
	const ctx = useFlags();

	return (
		<Button
			onClick={() => {
				ctx.addFlag({
					...flagModel,
				});
			}}
		>
			Show Flag
		</Button>
	);
};

export const Default: Story = {
	render: (args) => {
		// Functionality wrapped in ShowFlags component
		// to access the global flags context
		// const ctx = useFlags();

		// ctx.addFlag({
		// 	...flagModel,
		// });

		return (
			<div style={{ minHeight: 500 }}>
				<ShowFlags {...(args as FlagModel)} />
				<Flags />
			</div>
		);
	},
	args: {
		variant: 'primary',
		title: 'Flag Title',
		description: 'Flag Description text about something that happened',
		initExpanded: false,
		actions: [
			{
				title: 'Action 1',
				onClick: () => {
					alert('Action 1 clicked');
				},
			},
			{
				title: 'Action 2',
				onClick: () => {
					alert('Action 2 clicked');
				},
			},
		],
	},
};
