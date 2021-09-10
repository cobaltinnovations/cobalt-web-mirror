import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import useAccount from '@/hooks/use-account';
import { useTranslation } from 'react-i18next';
import useSubdomain from '@/hooks/use-subdomain';
import { ContactLCSW } from '@/pages/pic/contact-lcsw/contact-lcsw';

const useInCrisisModalStyles = createUseStyles({
	inCrisisModal: {
		width: '90%',
		maxWidth: 500,
		margin: '0 auto',
	},
});

interface InCrisisModalProps extends ModalProps {
	isCall?: boolean;
}

const InCrisisModal: FC<InCrisisModalProps> = ({ isCall, ...modalProps }) => {
	const classes = useInCrisisModalStyles();
	const { institution, subdomainInstitution } = useAccount();
	const { t } = useTranslation();
	const subdomain = useSubdomain();

	// Get the current date + time:
	const today = new Date();
	const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
	const START_TIME = '08:00:00';
	const END_TIME = '17:30:00';
	const isTooEarly: boolean = time < START_TIME;
	const isTooLate: boolean = time > END_TIME;

	const modalContent =
		subdomain === 'pic' ? (
			<ContactLCSW hideHeader={true} />
		) : (
			<div className="mb-5">
				<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:911">
					<PhoneIcon className={'float-left position-relative mr-2 mt-2'} />
					<div className={'d-flex flex-column font-size-s ml-2'}>
						<span className={'text-primary mb-2'}>{t('inCrisisResources.call911Prompt')}</span>
						<span className={'font-weight-regular'}>{t('inCrisisResources.call911Subtext')}</span>
					</div>
				</Button>
				<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:8007238255">
					<PhoneIcon className={'float-left position-relative mr-2 mt-2'} />
					<div className={'d-flex flex-column font-size-s ml-2'}>
						<span className={'text-primary mb-2'}>{t('inCrisisResources.callSuicideHotline')}</span>
						<span className={'font-weight-regular'}>{t('inCrisisResources.callSuicideHotlineSubtext')}</span>
					</div>
				</Button>
				<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:741741">
					<PhoneIcon className={'float-left position-relative mr-2 mt-2'} />
					<div className={'d-flex flex-column font-size-s ml-2'}>
						<span className={'text-primary mb-2'}>{t('inCrisisResources.textLine')}</span>
						<span className={'font-weight-regular'}>{t('inCrisisResources.textLineSubtext')}</span>
					</div>
				</Button>
				{subdomainInstitution?.institutionId === 'COBALT' && (
					<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:2158295433">
						<PhoneIcon className={'float-left position-relative mr-2 mt-2'} />
						<div className={'d-flex flex-column font-size-s ml-2'}>
							<span className={'text-primary mb-2'}>{t('inCrisisResources.callCobaltCrisisResponseCenter')}</span>
							<span className={'font-weight-regular'}>{t('inCrisisResources.callCobaltCrisisResponseCenterSubtext')}</span>
						</div>
					</Button>
				)}
				<div className={'text-center font-weight-bold'} style={{ margin: '0 auto', marginTop: '1.5em', width: '80%' }}>
					{t('inCrisisResources.orOption')}
				</div>
			</div>
		);

	return (
		<Modal {...modalProps} dialogClassName={classes.inCrisisModal} centered>
			<Modal.Header closeButton className={'bg-primary text-white text-center'}>
				<h3 className="mb-0">{t('inCrisisResources.title')}</h3>
				<p className={'mb-2 text-white p-2'}></p>
			</Modal.Header>
			<Modal.Body>
				{isCall && <p className="mb-5">{t('phoneModal.clinicianToCall')}</p>}
				{modalContent}
			</Modal.Body>
			<Modal.Footer>
				<Button
					variant="outline-primary"
					size="sm"
					className={'d-flex  justify-content-center align-items-center'}
					onClick={modalProps.onHide}
					style={{ margin: '0 auto' }}
				>
					{t('phoneModal.dismiss')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default InCrisisModal;
