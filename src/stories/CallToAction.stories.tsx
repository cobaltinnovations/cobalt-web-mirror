import CallToAction from '@/components/call-to-action';
import callToActionJSON from '@/fixtures/call-to-action.json';
import { CallToActionModel } from '@/lib/models';
import { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Container } from 'react-bootstrap';

const meta: Meta<typeof CallToAction> = {
	title: 'CallToAction',
	component: CallToAction,
	tags: ['autodocs'],
	argTypes: {},
};

export default meta;

type Story = StoryObj<typeof CallToAction>;

export const Default: Story = {
	render: (args) => {
		return (
			<Container>
				<CallToAction {...args} />
			</Container>
		);
	},
	args: {
		callToAction: callToActionJSON as CallToActionModel,
		className: '',
	},
};
