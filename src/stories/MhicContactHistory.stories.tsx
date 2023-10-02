import { MhicContactHistory } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import { PatientOrderModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicContactHistory> = {
	title: 'MhicContactHistory',
	component: MhicContactHistory,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicContactHistory>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicContactHistory {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: patientOrderJSON as unknown as PatientOrderModel,
	},
};
