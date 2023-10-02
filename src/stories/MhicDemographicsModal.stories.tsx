import { MhicDemographicsModal } from '@/components/integrated-care/mhic';
import patientOrderJSON from '@/fixtures/patient-order.json';
import referenceDataJSON from '@/fixtures/reference-data.json';
import { PatientOrderModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { ModalStoryWrapper } from './helpers/modal-wrapper';

const meta: Meta<typeof MhicDemographicsModal> = {
	title: 'MhicDemographicsModal',
	component: MhicDemographicsModal,
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicDemographicsModal>;

export const Default: Story = {
	render: (args) => {
		return (
			<ModalStoryWrapper>
				{([isShowing, setIsShowing]) => {
					return (
						<>
							<MhicDemographicsModal show={isShowing} onHide={() => setIsShowing(false)} {...args} />
						</>
					);
				}}
			</ModalStoryWrapper>
		);
	},
	args: {
		raceOptions: referenceDataJSON.races,
		ethnicityOptions: referenceDataJSON.ethnicities,
		genderIdentityOptions: referenceDataJSON.genderIdentities,
		patientOrder: patientOrderJSON as unknown as PatientOrderModel,
		onSave(patientOrder: PatientOrderModel) {
			//
		},
	},
};
