import { MhicNextStepsAlerts } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import referenceDataJSON from '@/fixtures/reference-data.json';
import {
	PatientOrderModel,
	PatientOrderResourcingStatusId,
	PatientOrderSafetyPlanningStatusId,
	ReferenceDataResponse,
} from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicNextStepsAlerts> = {
	title: 'MhicNextStepsAlerts',
	component: MhicNextStepsAlerts,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicNextStepsAlerts>;

export const NeedsSafetyPlanningAndResources: Story = {
	render: (args) => {
		return <MhicNextStepsAlerts {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
			patientOrderResourcingStatusId: PatientOrderResourcingStatusId.NEEDS_RESOURCES,
		} as unknown as PatientOrderModel,

		referenceData: referenceDataJSON as unknown as ReferenceDataResponse,
		disabled: false,
		className: '',
	},
};

export const ConnectedSafetyPlanningAndResourcesSent: Story = {
	render: (args) => {
		return <MhicNextStepsAlerts {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId.CONNECTED_TO_SAFETY_PLANNING,
			connectedToSafetyPlanningAtDescription: '{{connectedToSafetyPlanningAtDescription}}',
			patientOrderResourcingStatusId: PatientOrderResourcingStatusId.SENT_RESOURCES,
			resourcesSentAtDescription: '{{resourcesSentAtDescription}}',
		} as unknown as PatientOrderModel,

		referenceData: referenceDataJSON as unknown as ReferenceDataResponse,
		disabled: false,
		className: '',
	},
};
