import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { FormattedPatientObject } from '@/pages/pic/utils';
import HomeWrapper from '@/pages/pic/home/home-wrapper';
import HomeMainHeader from '@/pages/pic/home/home-main-header';
import { ReactComponent as Resources } from '@/assets/pic/website_resources.svg';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';

import { HomeButtonLink } from '@/pages/pic/home/home-action-button';

interface Props {
	patient: FormattedPatientObject;
}

const ResourcesHome: FC<Props> = ({ patient }) => {
	const { t } = useTranslation();
	const bodyContent = t(`home.body.episodeEnded`);

	return (
		<HomeWrapper>
			<HomeMainHeader patientTenure="returning" name={patient.displayName} />
			<Resources className={'w-100 h-100'} />
			<p className={'pt-4 pb-4'}>{bodyContent}</p>
			<HomeButtonLink icon={<EditIcon />} destination="/well-being-resources">
				{t(`home.actionButton.episodeEnded`)}
			</HomeButtonLink>
		</HomeWrapper>
	);
};

export default ResourcesHome;
