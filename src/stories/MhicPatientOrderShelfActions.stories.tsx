import { MhicPatientOrderShelfActions } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { PatientOrderModel } from '@/lib/models';

const meta: Meta<typeof MhicPatientOrderShelfActions> = {
	title: 'MhicPatientOrderShelfActions',
	component: MhicPatientOrderShelfActions,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicPatientOrderShelfActions>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicPatientOrderShelfActions {...args} />
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
