import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface MainHeaderProps {
	patientTenure: 'newPatient' | 'returning' | 'justFinished';
	name: string;
}

const patientStatusMessage = {
	newPatient: 'home.greeting.newPatient',
	returning: 'home.greeting.returningPatient',
	justFinished: 'home.greeting.finishAssessmentPatient',
};

const HomeMainHeader: FC<MainHeaderProps> = (props) => {
	const { t } = useTranslation();
	const { patientTenure, name } = props;

	return <h2 className={'pt-4 pb-4'}>{t(patientStatusMessage[patientTenure], { name })}</h2>;
};

export default HomeMainHeader;
