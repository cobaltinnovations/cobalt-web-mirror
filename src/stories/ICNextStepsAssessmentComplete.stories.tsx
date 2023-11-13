import { NextStepsAssessmentComplete } from '@/components/integrated-care/patient';
import patientOrderJSON from '@/fixtures/patient-order.json';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { PatientOrderModel, PatientOrderSafetyPlanningStatusId, PatientOrderTriageStatusId } from '@/lib/models';

const meta: Meta<typeof NextStepsAssessmentComplete> = {
	title: 'NextStepsAssessmentComplete',
	component: NextStepsAssessmentComplete,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof NextStepsAssessmentComplete>;

export const MHP: Story = {
	render: (args) => {
		return <NextStepsAssessmentComplete {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderTriageStatusId: PatientOrderTriageStatusId.MHP,
		} as unknown as PatientOrderModel,
	},
};

export const SpecialtyCare: Story = {
	render: (args) => {
		return <NextStepsAssessmentComplete {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderTriageStatusId: PatientOrderTriageStatusId.SPECIALTY_CARE,
		} as unknown as PatientOrderModel,
	},
};

export const SpecialtyCareResourcesSent: Story = {
	render: (args) => {
		return <NextStepsAssessmentComplete {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			resourcesSentAt: '{{resourcesSentAt}}',
			resourcesSentAtDescription: '{{resourcesSentAtDescription}}',
			patientOrderTriageStatusId: PatientOrderTriageStatusId.SPECIALTY_CARE,
		} as unknown as PatientOrderModel,
	},
};

export const Subclinical: Story = {
	render: (args) => {
		return <NextStepsAssessmentComplete {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderTriageStatusId: PatientOrderTriageStatusId.SUBCLINICAL,
		} as unknown as PatientOrderModel,
	},
};

export const NeedsSafetyPlanning: Story = {
	render: (args) => {
		return <NextStepsAssessmentComplete {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderSafetyPlanningStatusId: PatientOrderSafetyPlanningStatusId.NEEDS_SAFETY_PLANNING,
			patientOrderTriageStatusId: PatientOrderTriageStatusId.SUBCLINICAL,
		} as unknown as PatientOrderModel,
	},
};
