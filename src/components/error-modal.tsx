import React, { FC, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import { ErrorModalContext } from '@/contexts/error-modal-context';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';
import useTrackModalView from '@/hooks/use-track-modal-view';
import useAnalytics from '@/hooks/use-analytics';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';
import useAccount from '@/hooks/use-account';

const useStyles = createUseStyles({
	errorModal: {
		maxWidth: 295,
	},
});

const ErrorModal: FC = () => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const classes = useStyles();
	const { show, setShow, error } = useContext(ErrorModalContext);
	useTrackModalView('ErrorModal', show);
	const { openInCrisisModal } = useInCrisisModal();
	const { trackEvent } = useAnalytics();

	const ErrorBody = useCallback(() => {
		const isIntegratedCarePatient =
			institution.integratedCareEnabled && institution.userExperienceTypeId === 'PATIENT';
		const isIntegratedCareStaff = institution.integratedCareEnabled && institution.userExperienceTypeId === 'STAFF';

		if (error?.code === 'VALIDATION_FAILED') {
			return <p className="mb-0 fw-bold">{error?.message}</p>;
		}

		if (isIntegratedCarePatient) {
			return (
				<>
					<p className="mb-1 fw-bold">Need clinical support?</p>
					<a
						className="mb-4 d-block fs-large font-heading-bold text-decoration-none"
						href={`tel:${institution.integratedCarePhoneNumber}`}
					>
						Call {institution.integratedCarePhoneNumberDescription}
					</a>
					<p className="mb-1 fw-bold">Have a clinical emergency?</p>
					<Button
						variant="link"
						size="sm"
						className="mb-2 p-0 text-decoration-none"
						onClick={() => {
							setShow(false);
							trackEvent(CrisisAnalyticsEvent.clickCrisisError());
							openInCrisisModal(true);
						}}
					>
						Crisis Resources
					</Button>
				</>
			);
		}

		if (isIntegratedCareStaff) {
			return (
				<p className="mb-0 fw-bold">
					Sorry, an unexpected error occurred. If this error persists, please contact your supervisor for
					direction.
				</p>
			);
		}

		return (
			<>
				<p className="mb-1 fw-bold">Need technical support?</p>
				<Button
					variant="link"
					size="sm"
					className="mb-4 p-0 text-decoration-none"
					onClick={() => {
						setShow(false);
						navigate('/feedback');
					}}
				>
					Send Us a Note
				</Button>

				{institution.clinicalSupportPhoneNumber && (
					<>
						<p className="mb-1 fw-bold">Need clinical support?</p>
						<a
							className="mb-4 d-block fs-large font-heading-bold text-decoration-none"
							href={`tel:${institution.clinicalSupportPhoneNumber}`}
						>
							Call {institution.clinicalSupportPhoneNumberDescription}
						</a>
					</>
				)}

				<p className="mb-1 fw-bold">Have a clinical emergency?</p>
				<Button
					variant="link"
					size="sm"
					className="mb-2 p-0 text-decoration-none"
					onClick={() => {
						setShow(false);
						trackEvent(CrisisAnalyticsEvent.clickCrisisError());
						openInCrisisModal(true);
					}}
				>
					Crisis Resources
				</Button>
			</>
		);
	}, [
		error?.code,
		error?.message,
		institution.integratedCareEnabled,
		institution.integratedCarePhoneNumber,
		institution.integratedCarePhoneNumberDescription,
		institution.userExperienceTypeId,
		navigate,
		openInCrisisModal,
		setShow,
		trackEvent,
	]);

	return (
		<Modal
			show={show}
			dialogClassName={classes.errorModal}
			centered
			onHide={() => {
				setShow(false);
			}}
		>
			<Modal.Header closeButton>
				<Modal.Title>
					{error?.code === 'VALIDATION_FAILED' ? 'Oops!' : 'Oh no! Something went wrong'}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<ErrorBody />
			</Modal.Body>
			<Modal.Footer>
				<div className="text-right">
					<Button
						variant="outline-primary"
						onClick={() => {
							setShow(false);
						}}
					>
						Dismiss
					</Button>
				</div>
			</Modal.Footer>
		</Modal>
	);
};

export default ErrorModal;
