import { MhicHeaderAutoComplete } from '@/components/integrated-care/mhic/mhic-header-autocomplete';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicHeaderAutoComplete> = {
	title: 'MhicHeaderAutoComplete',
	component: MhicHeaderAutoComplete,
	argTypes: {},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicHeaderAutoComplete>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicHeaderAutoComplete {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		recentOrders: [
			{
				referenceNumber: 0,
				referenceNumberDescription: '0',
				patientMrn: 'PatientMRN',
				patientUniqueId: 'patient-fixture-unique-id0',
				patientUniqueIdType: 'patient-fixture-unique-id-type',
				patientFirstName: 'FirstName',
				patientLastName: 'LastName',
				patientDisplayName: 'Patient Display Name',
				patientDisplayNameWithLastFirst: 'LastName, FirstName',
				patientPhoneNumber: '(555) 555-5555',
				patientPhoneNumberDescription: '(555) 555-5555',
			},
			{
				referenceNumber: 1,
				referenceNumberDescription: '1',
				patientMrn: 'PatientMRN',
				patientUniqueId: 'patient-fixture-unique-id1',
				patientUniqueIdType: 'patient-fixture-unique-id-type',
				patientFirstName: 'FirstName',
				patientLastName: 'LastName',
				patientDisplayName: 'Patient Display Name',
				patientDisplayNameWithLastFirst: 'LastName, FirstName',
				patientPhoneNumber: '(555) 555-5555',
				patientPhoneNumberDescription: '(555) 555-5555',
			},
			{
				referenceNumber: 2,
				referenceNumberDescription: '2',
				patientMrn: 'PatientMRN',
				patientUniqueId: 'patient-fixture-unique-id2',
				patientUniqueIdType: 'patient-fixture-unique-id-type',
				patientFirstName: 'FirstName',
				patientLastName: 'LastName',
				patientDisplayName: 'Patient Display Name',
				patientDisplayNameWithLastFirst: 'LastName, FirstName',
				patientPhoneNumber: '(555) 555-5555',
				patientPhoneNumberDescription: '(555) 555-5555',
			},
		],
	},
};
