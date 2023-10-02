import { MhicFilterAssignment } from '@/components/integrated-care/mhic';
import accountJSON from '@/fixtures/account.json';

import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { icMhicRouterParams } from './helpers/ic-router-params';
import { AccountModel } from '@/lib/models';

const meta: Meta<typeof MhicFilterAssignment> = {
	title: 'MhicFilterAssignment',
	component: MhicFilterAssignment,

	tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof MhicFilterAssignment>;

export const Default: Story = {
	render: (args) => {
		return (
			<div style={{ minHeight: 400 }}>
				<MhicFilterAssignment {...args} />
			</div>
		);
	},
	parameters: {
		reactRouter: icMhicRouterParams,
	},
	args: {
		panelAccounts: [...Array(5)].map(
			(_, i) => ({ ...accountJSON, accountId: accountJSON.accountId + i } as unknown as AccountModel)
		),
	},
};
