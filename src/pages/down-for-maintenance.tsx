import React, { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import colors from '@/jss/colors';
import { ReactComponent as LogoIconText } from '@/assets/logos/logo-icon-and-text.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';

const useStyles = createUseStyles({
	logoIconText: {
		'& path': {
			fill: colors.primary,
		},
	},
});

const DownForMaintenance = (): ReactElement => {
	const classes = useStyles();
	const { t } = useTranslation();

	return (
		<Container className="pt-20">
			<Row>
				<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
					<div className="d-flex justify-content-center mb-12">
						<LogoIconText className={classes.logoIconText} />
					</div>

					<p className="mb-2 text-center font-size-m">
						We're sorry for the inconvenience, but Cobalt is temporarily offline for maintenance and will be back online shortly.
					</p>
					<p className="mb-8 text-center font-size-m">If you need immediate help, please contact one of the following numbers:</p>

					<Button variant="primary" className="mb-2 w-100 d-flex align-items-center" href="tel:911">
						<PhoneIcon className="mr-4" />
						<div className="font-size-s">
							<span className="d-block mb-2">{t('inCrisisResources.call911Prompt')}</span>
							<span className="d-block font-weight-regular">{t('inCrisisResources.call911Subtext')}</span>
						</div>
					</Button>
					<Button variant="primary" className="mb-2 w-100 d-flex align-items-center" href="tel:8007238255">
						<PhoneIcon className="mr-4" />
						<div className="font-size-s">
							<span className="d-block mb-2">{t('inCrisisResources.callSuicideHotline')}</span>
							<span className="d-block font-weight-regular">{t('inCrisisResources.callSuicideHotlineSubtext')}</span>
						</div>
					</Button>
					<Button variant="primary" className="mb-4 w-100 d-flex align-items-center" href="tel:741741">
						<PhoneIcon className="mr-4" />
						<div className="font-size-s">
							<span className="d-block mb-2">{t('inCrisisResources.textLine')}</span>
							<span className="d-block font-weight-regular">{t('inCrisisResources.textLineSubtext')}</span>
						</div>
					</Button>

					<p className="text-center font-size-m font-weight-bold">{t('inCrisisResources.orOption')}</p>
				</Col>
			</Row>
		</Container>
	);
};

export default DownForMaintenance;
