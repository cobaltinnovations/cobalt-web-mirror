import React from 'react';
import { ReactComponent as Covid19Icon } from '@/assets/icons/icon-covid-19.svg';
import { ReactComponent as WellBeingIcon } from '@/assets/icons/icon-well-being.svg';

export const exploreLinks = [
	{
		testId: 'menuLinkWellBeingResources',
		label: 'Well-Being Resources',
		icon: <WellBeingIcon />,
		to: () => '/well-being-resources',
	},
	{
		testId: 'menuLinkCovid19Resources',
		label: 'COVID-19 Resources',
		icon: <Covid19Icon />,
		to: () => '/covid-19-resources',
	},
];
