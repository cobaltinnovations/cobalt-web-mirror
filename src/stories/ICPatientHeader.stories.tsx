import { PatientHeader } from '@/components/integrated-care/patient';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof PatientHeader> = {
	title: 'PatientHeader',
	component: PatientHeader,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PatientHeader>;

export const Default: Story = {
	render: () => {
		return (
			<div
				style={{
					minHeight: 400,
				}}
			>
				<PatientHeader />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {},
};
