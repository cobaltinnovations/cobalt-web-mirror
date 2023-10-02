import ScreeningFlowCta from '@/components/screening-flow-cta';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';

const meta: Meta<typeof ScreeningFlowCta> = {
	title: 'ScreeningFlowCta',
	component: ScreeningFlowCta,
	tags: ['autodocs'],
	argTypes: {
		buttonVariant: {
			control: { type: 'select' },
			options: [
				'primary',
				'secondary',
				'success',
				'danger',
				'warning',
				'info',
				'dark',
				'light',
				'link',
				'outline-primary',
				'outline-secondary',
				'outline-success',
				'outline-danger',
				'outline-warning',
				'outline-info',
				'outline-dark',
				'outline-light',
			],
		},
	},
};

export default meta;

type Story = StoryObj<typeof ScreeningFlowCta>;

export const Default: Story = {
	render: (args) => {
		return <ScreeningFlowCta {...args} />;
	},
	args: {
		buttonVariant: 'primary',
		className: '',
	},
};
