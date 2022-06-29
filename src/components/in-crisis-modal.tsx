import React, { FC } from 'react';
import { Modal, Button, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import useAccount from '@/hooks/use-account';

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
	const { subdomainInstitution } = useAccount();

	return (
		<Modal {...modalProps} dialogClassName={classes.inCrisisModal} centered>
			<Modal.Header closeButton className={'bg-primary text-white text-center'}>
				<h3 className="mb-0">If you are in crisis</h3>
				<p className={'mb-2 text-white p-2'}></p>
			</Modal.Header>
			<Modal.Body>
				{isCall && (
					<p className="mb-5">
						We want to check in with you to make sure you are safe. A clinician will call you within one
						business day to talk about how they can help. Please don’t hesitate to use the crisis resources
						listed below, which are available 24/7.
					</p>
				)}
				<div className="mb-5">
					<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:911">
						<PhoneIcon className={'float-start position-relative me-2 mt-2'} />
						<div className={'d-flex flex-column fs-large ms-2'}>
							<span className={'text-primary mb-2'}>Call 911</span>
							<span className={'font-heading-normal'}>24/7 emergency</span>
						</div>
					</Button>
					<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:8007238255">
						<PhoneIcon className={'float-start position-relative me-2 mt-2'} />
						<div className={'d-flex flex-column fs-large ms-2'}>
							<span className={'text-primary mb-2'}>Call 800-273-8255</span>
							<span className={'font-heading-normal'}>24/7 National suicide prevention line</span>
						</div>
					</Button>
					<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:741741">
						<PhoneIcon className={'float-start position-relative me-2 mt-2'} />
						<div className={'d-flex flex-column fs-large ms-2'}>
							<span className={'text-primary mb-2'}>Text 741 741</span>
							<span className={'font-heading-normal'}>24/7 Crisis Text Line</span>
						</div>
					</Button>
					{subdomainInstitution?.institutionId === 'COBALT' && (
						<Button variant="grey" className={'w-100 d-flex mt-2'} href="tel:2158295433">
							<PhoneIcon className={'float-start position-relative me-2 mt-2'} />
							<div className={'d-flex flex-column fs-large ms-2'}>
								<span className={'text-primary mb-2'}>Call 215-555-1111</span>
								<span className={'font-heading-normal'}>24/7 Cobalt Crisis Response Center</span>
							</div>
						</Button>
					)}
					<div
						className={'text-center font-heading-bold'}
						style={{ margin: '0 auto', marginTop: '1.5em', width: '80%' }}
					>
						or go to your nearest emergency department or crisis center
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Button
					variant="outline-primary"
					size="sm"
					className={'d-flex  justify-content-center align-items-center'}
					onClick={modalProps.onHide}
					style={{ margin: '0 auto' }}
				>
					dismiss
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default InCrisisModal;
