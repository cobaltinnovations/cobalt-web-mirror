import { MhicComments } from '@/components/integrated-care/mhic';
import patientOrderNoteJSON from '@/fixtures/patient-order-note.json';
import patientOrderJSON from '@/fixtures/patient-order.json';
import accountJSON from '@/fixtures/mhic-account.json';
import { AccountModel, PatientOrderModel, PatientOrderNoteModel } from '@/lib/models';
import type { Meta, StoryObj } from '@storybook/react';
import { rest } from 'msw';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';

const meta: Meta<typeof MhicComments> = {
	title: 'MhicComments',
	component: MhicComments,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicComments>;

export const Default: Story = {
	render: (args) => {
		return (
			<div
				style={{
					minHeight: 800,
				}}
			>
				<MhicComments {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
		msw: {
			handlers: [
				rest.post('/patient-order-notes', (req, res, ctx) => {
					return res(ctx.json({}));
				}),
			],
		},
	},
	args: {
		patientOrder: {
			...patientOrderJSON,
			patientOrderNotes: [
				{
					...patientOrderNoteJSON,
					account: accountJSON,
				},
			],
		} as unknown as PatientOrderModel,
	},
};
