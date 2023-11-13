import { MhicTriageCard } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import { PatientOrderModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicTriageCard> = {
	title: 'MhicTriageCard',
	component: MhicTriageCard,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicTriageCard>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicTriageCard {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderCareTypeId: 'SPECIALTY',
			patientOrderTriageGroups: [
				{
					patientOrderTriageSourceId: 'COBALT',
					patientOrderCareTypeId: 'SPECIALTY',
					patientOrderCareTypeDescription: '{{patientOrderCareTypeDescription}}',
					patientOrderFocusTypes: [
						{
							patientOrderFocusTypeId: 'focus-type-id-1',
							patientOrderFocusTypeDescription: 'Evaluation',
							reasons: ['Patient scored > 1 on PHQ-9 Question 9'],
						},
						{
							patientOrderFocusTypeId: 'focus-type-id-2',
							patientOrderFocusTypeDescription: '{{patientOrderFocusTypeDescription}}',
							reasons: ['{{reasons}}'],
						},
						{
							patientOrderFocusTypeId: 'focus-type-id-3',
							patientOrderFocusTypeDescription: '{{patientOrderFocusTypeDescription}}',
							reasons: ['{{reasons}}'],
						},
					],
				},
			],
		} as unknown as PatientOrderModel,
	},
};
