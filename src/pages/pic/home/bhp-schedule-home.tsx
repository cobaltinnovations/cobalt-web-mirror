import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { CareType, FormattedPatientObject } from '@/pages/pic/utils';
import HomeWrapper from '@/pages/pic/home/home-wrapper';
import HomeMainHeader from '@/pages/pic/home/home-main-header';
import { ReactComponent as CalendarIcon } from '@/assets/icons/icon-calendar.svg';
import { ReactComponent as ConnectingToCare } from '@/assets/pic/connecting_to_care.svg';
import { HomeButtonLink } from '@/pages/pic/home/home-action-button';

interface Props {
	patient: FormattedPatientObject;
	careType: CareType;
	didJustFinish: boolean;
}

const MHICScheduleHome: FC<Props> = ({ patient, didJustFinish, careType }) => {
	const { t } = useTranslation();
	const patientTenure = didJustFinish ? 'justFinished' : 'returning';
	const bodyContent = t(`home.body.didNotActNoBhpNoGoals`);
	const showExtraInfo = careType === CareType.PIC;

	return (
		<HomeWrapper>
			<HomeMainHeader patientTenure={patientTenure} name={patient.displayName} />
			<ConnectingToCare className={'w-100 h-100'} />
			<h3 className={'pt-4 pb-4'}>{t(`home.label.recommendedNextStep`)}</h3>
			<p>{bodyContent}</p>
			{showExtraInfo && <p className="mt-5 mb-5">{t('home.body.didNotActExtraInfo')}</p>}
			<HomeButtonLink icon={<CalendarIcon />} destination="/pic/provider-search?supportRoleId=LCSW">
				{t(`home.actionButton.scheduleAppointmentGeneric`)}
			</HomeButtonLink>
		</HomeWrapper>
	);
};

export default MHICScheduleHome;
