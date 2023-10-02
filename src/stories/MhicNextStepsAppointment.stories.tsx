import { MhicNextStepsAppointment } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import { PatientOrderModel, PatientOrderTriageStatusId } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicNextStepsAppointment> = {
	title: 'MhicNextStepsAppointment',
	component: MhicNextStepsAppointment,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicNextStepsAppointment>;

export const NoAppointment: Story = {
	render: (args) => {
		return <MhicNextStepsAppointment {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderTriageStatusId: PatientOrderTriageStatusId.MHP,
		} as unknown as PatientOrderModel,

		disabled: false,
		className: '',
	},
};

export const AppointmentBooked: Story = {
	render: (args) => {
		return <MhicNextStepsAppointment {...args} />;
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderTriageStatusId: PatientOrderTriageStatusId.MHP,
			appointmentId: 'appointment-fixture-id',
			appointmentStartTimeDescription: '{{appointmentStartTimeDescription}}',
			providerName: '{{providerName}}',
		} as unknown as PatientOrderModel,

		disabled: false,
		className: '',
	},
};
