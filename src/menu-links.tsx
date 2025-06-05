import React from 'react';
import { ReactComponent as WellBeingIcon } from '@/assets/icons/icon-well-being.svg';

export const exploreLinks = [
	{
		testId: 'menuLinkWellBeingResources',
		label: 'Well-Being Resources',
		icon: <WellBeingIcon />,
		to: () => '/well-being-resources',
	},
];
