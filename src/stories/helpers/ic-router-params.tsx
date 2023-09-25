import referenceDataJSON from '@/fixtures/reference-data.json';
import accountJSON from '@/fixtures/account.json';
import { reactRouterParameters } from 'storybook-addon-react-router-v6';

export const icMhicRouterParams = reactRouterParameters({
	location: {
		path: '/ic/mhic',
	},
	routing: [
		{
			id: 'root',
			loader: () => ({
				institutionResponse: {
					institution: {
						integratedCareEnabled: true,
						myChartName: 'myChartName',
					},
				},
			}),
			children: [
				{
					id: 'ic',
					path: 'ic',
					loader: () => ({
						referenceDataResponse: referenceDataJSON,
					}),
					children: [
						{
							id: 'mhic',
							path: 'mhic',
							useStoryElement: true,
							loader: () => ({
								panelAccounts: [
									accountJSON,
									{ ...accountJSON, accountId: accountJSON.accountId + '2' },
									{ ...accountJSON, accountId: accountJSON.accountId + '3' },
								],
							}),
						},
					],
				},
			],
		},
	],
});
