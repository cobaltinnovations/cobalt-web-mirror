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
import { ERROR_CODES } from '@/lib/http-client';
import { analyticsService } from '@/lib/services';
import { AnalyticsNativeEventOverlayViewInCrisisSource, AnalyticsNativeEventTypeId } from '@/lib/models';

const useStyles = createUseStyles({
	modalWrapper: {
		zIndex: 1075,
	},
	errorModal: {
		maxWidth: 295,
	},
});

const ErrorModal: FC = () => {
	const { institution, isIntegratedCarePatient, isIntegratedCareStaff } = useAccount();
	const navigate = useNavigate();
	const classes = useStyles();
	const { isErrorModalShown, dismissErrorModal, clearError, error } = useContext(ErrorModalContext);
	useTrackModalView('ErrorModal', isErrorModalShown);
	const { openInCrisisModal } = useInCrisisModal();
	const { trackEvent } = useAnalytics();

	const ErrorBody = useCallback(() => {
		if (error?.code === ERROR_CODES.VALIDATION_FAILED) {
			return (
				<p className="mb-0 fw-bold">
					{error?.message.split('\n').map((line, index) => (
						<React.Fragment key={index}>
							{line}
							{index < error?.message.split('\n').length - 1 && <br />}
						</React.Fragment>
					))}
				</p>
			);
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
							dismissErrorModal();
							trackEvent(CrisisAnalyticsEvent.clickCrisisError());

							analyticsService.persistEvent(AnalyticsNativeEventTypeId.OVERLAY_VIEW_IN_CRISIS, {
								source: AnalyticsNativeEventOverlayViewInCrisisSource.ERROR_OVERLAY,
							});

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
						dismissErrorModal();
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
						dismissErrorModal();
						trackEvent(CrisisAnalyticsEvent.clickCrisisError());

						analyticsService.persistEvent(AnalyticsNativeEventTypeId.OVERLAY_VIEW_IN_CRISIS, {
							source: AnalyticsNativeEventOverlayViewInCrisisSource.ERROR_OVERLAY,
						});

						openInCrisisModal(true);
					}}
				>
					Crisis Resources
				</Button>
			</>
		);
	}, [
		dismissErrorModal,
		error?.code,
		error?.message,
		institution.clinicalSupportPhoneNumber,
		institution.clinicalSupportPhoneNumberDescription,
		institution.integratedCarePhoneNumber,
		institution.integratedCarePhoneNumberDescription,
		isIntegratedCarePatient,
		isIntegratedCareStaff,
		navigate,
		openInCrisisModal,
		trackEvent,
	]);

	return (
		<Modal
			show={isErrorModalShown}
			className={classes.modalWrapper}
			dialogClassName={classes.errorModal}
			centered
			onHide={() => {
				dismissErrorModal();

				if (error?.apiError?.metadata?.shouldExitScreeningSession && isIntegratedCarePatient) {
					navigate('/ic/patient');
				} else if (error?.apiError?.metadata?.shouldExitScreeningSession && isIntegratedCareStaff) {
					navigate('/ic/mhic');
				}
			}}
			onExited={() => {
				clearError();
			}}
		>
			<Modal.Header closeButton>
				<Modal.Title>
					{error?.code === ERROR_CODES.VALIDATION_FAILED ? 'Sorry.' : 'Oh no! Something went wrong'}
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
							dismissErrorModal();

							if (error?.apiError?.metadata?.shouldExitScreeningSession && isIntegratedCarePatient) {
								navigate('/ic/patient');
							} else if (error?.apiError?.metadata?.shouldExitScreeningSession && isIntegratedCareStaff) {
								navigate('/ic/mhic');
							}
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
