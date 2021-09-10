import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { createUseStyles } from 'react-jss';

const usePicInsuranceInfoModalStyles = createUseStyles({
	picInsuranceInfoModal: {
		width: '90%',
		margin: '0 auto',
	},
});

const PicInsuranceInfoModal: FC<ModalProps> = (props) => {
	const { t } = useTranslation();
	const classes = usePicInsuranceInfoModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.picInsuranceInfoModal} centered>
			<Modal.Header closeButton>
				<h3 className="mb-0">{t('picInsuranceInfoModal.title', 'Insurance Information')}</h3>
			</Modal.Header>
			<Modal.Body>
				<p>
					{t(
						'picInsuranceInfoModal.note',
						'Please note: Your insurance may cover this service but you will be responsible for any charges such as co-pays or co-insurance. If you have health insurance that includes a deductible, you are responsible for any amount required to meet your deductible. This may include the full cost of the services if your have a high-deductible plan.'
					)}
				</p>

				<ul className="pl-4">
					<li>
						{t(
							'picInsuranceInfoModal.info1',
							'The services in this program may be delivered in person, by phone, or by video.\r\nThey may include consultation between your providers to coordinate your care.'
						)}
					</li>
					<li>
						{t(
							'picInsuranceInfoModal.info2',
							'Your providers will share your health information, including information about your mental health, with other providers within Cobalt for treatment purposes and as otherwise allowed by law.'
						)}
					</li>
					<li>{t('picInsuranceInfoModal.info3', 'These charges are billed to your insurance each month you are enrolled in the program.')}</li>
					<li>{t('picInsuranceInfoModal.info4', "The first bill may not be received until you've been enrolled for two or more months.")}</li>
					<li>
						{t(
							'picInsuranceInfoModal.info5',
							'Your insurance company can provide more information if you have any additional questions about your coverage or any potential out of pocket expenses - to find out, call and ask them whether they cover Collborative Care CPT codes 99492, 99493, 99494, and 99484.'
						)}
					</li>
				</ul>
				<p>{t('picInsuranceInfoModal.acceptedInsurers', 'Cobalt Integrated Care accepts the following insurers')}:</p>
				{[
					'No fee',
					'Cobalt Care PPO',
					'Keystone Health Plan East',
					'Blue Shield',
					'Aetna',
					'Aetna Student Health',
					'Medicare',
					'Medicaid',
					'Horizon Blue Cross',
					'Independent Blue Cross',
					'United Health Care',
					'Cigna',
					'Community Behavioral Health',
					'Cobalt Behavioral Health EAP',
					'Other insurance',
					'Self-pay',
				].map((insurer, idx) => (
					<p key={idx} className="m-0">
						{insurer}
					</p>
				))}

				<hr className="my-2" />
			</Modal.Body>
			<Modal.Footer className="justify-content-center">
				<Button variant="outline-primary" size="sm" onClick={props.onHide}>
					{t('picInsuranceInfoModal.close', 'Close')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default PicInsuranceInfoModal;
