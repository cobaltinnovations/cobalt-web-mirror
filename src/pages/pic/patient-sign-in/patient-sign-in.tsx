import React, { FC } from 'react';
import { Container, Col } from 'react-bootstrap';
import useHeaderTitle from '@/hooks/use-header-title';
import SignInSSO from '@/pages/pic/patient-sign-in/sign-in-button-group';
import { ReactComponent as LogoIconText } from '@/assets/logos/logo-icon-and-text.svg';
import { useTranslation } from 'react-i18next';
import { createUseStyles } from 'react-jss';

import colors from '@/jss/colors';
import { Link } from 'react-router-dom';

const useSignInStyles = createUseStyles({
	logoIconText: {
		'& path': {
			fill: colors.primary,
		},
	},
});
const PatientSignIn: FC = () => {
	useHeaderTitle(null);
	const { t } = useTranslation();
	const classes = useSignInStyles();

	return (
		<>
			<Container className="pt-20">
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<div className="d-flex justify-content-center mb-12">
						<LogoIconText className={classes.logoIconText} />
					</div>
					<div className="d-flex justify-content-center mb-3 px-5 font-weight-bold font-size-l text-primary">{t('patientSignIn.greeting')}</div>
					<SignInSSO />
					<div className={'mt-10'}>
						{t('patientSignIn.callProviderPrompt')}
						<a href="tel:215-555-1212">215-555-1212</a>
						{t('patientSignIn.crisisModalPrompt')}
						<Link className="px-1 py-0" to={'/pic/contact-lcsw'}>
							{t('patientSignIn.crisisModalButtonText')}
						</Link>
					</div>
				</Col>
			</Container>
		</>
	);
};

export default PatientSignIn;
