import { MhicAssessmentComplete } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import { PatientOrderModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicAssessmentComplete> = {
	title: 'MhicAssessmentComplete',
	component: MhicAssessmentComplete,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicAssessmentComplete>;

export const Default: Story = {
	render: (args) => {
		console.log('render?');
		return <MhicAssessmentComplete {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: patientOrderJSON as unknown as PatientOrderModel,
		onStartNewAssessment: () => {
			alert('Start New Assessment Clicked!');
		},
	},
};
