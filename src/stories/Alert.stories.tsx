import Alert from '@/components/alert';
import { AlertVariant } from '@/contexts/alert-context';
import useAlert from '@/hooks/use-alert';

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from 'react-bootstrap';

const meta: Meta<typeof Alert> = {
	title: 'Alert',
	component: Alert,
	parameters: {},
	tags: ['autodocs'],
	argTypes: {
		text: {
			control: { type: 'text' },
		},
		variant: {
			control: { type: 'select' },
			options: [undefined, 'success', 'warning', 'danger'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Alert>;

const ShowAlert = ({ text = 'This is an alert', variant }: { text?: string; variant?: string }) => {
	const ctx = useAlert();

	return (
		<Button
			onClick={() => {
				ctx.showAlert({ text, variant: variant as AlertVariant });
			}}
		>
			Show Alert
		</Button>
	);
};

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 500 }}>
				<ShowAlert {...args} />
				<Alert />
			</div>
		);
	},
	args: {
		text: 'This is an alert',
		variant: 'success',
	},
};
