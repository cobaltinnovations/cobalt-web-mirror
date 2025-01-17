import ConsentContent from '@/components/consent-content';

import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import useTrackModalView from '@/hooks/use-track-modal-view';
import { accountService } from '@/lib/services';
import React, { FC, useState } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { useRevalidator } from 'react-router-dom';
import LoadingButton from './loading-button';
import { AnalyticsNativeEventAccountSignedOutSource } from '@/lib/models';

const useStyles = createUseStyles({
	modal: {
		maxWidth: 408,
		'& .modal-content': {
			maxHeight: '544px',
		},
	},
	clearHeader: {
		border: 0,
		backgroundColor: 'transparent',
	},
});

interface ConsentModalProps extends ModalProps {
	readOnly?: boolean;
}

const ConsentModal: FC<ConsentModalProps> = ({ readOnly = false, ...modalProps }) => {
	useTrackModalView('ConsentModal', modalProps.show);
	const classes = useStyles();
	const handleError = useHandleError();
	const { account, signOutAndClearContext } = useAccount();
	const revalidator = useRevalidator();

	const [isAccepting, setIsAccepting] = useState(false);
	const [isRejecting, setIsRejecting] = useState(false);

	return (
		<Modal {...modalProps} scrollable backdrop="static" centered dialogClassName={classes.modal}>
			{readOnly && <Modal.Header className={classes.clearHeader} closeButton closeVariant="white" />}

			<Modal.Body>
				<ConsentContent />
			</Modal.Body>

			{!readOnly && (
				<Modal.Footer>
					<div className="my-4 d-flex">
						<LoadingButton
							isLoading={isRejecting}
							className="me-2 w-100"
							type="button"
							variant="outline-primary"
							size="sm"
							onClick={() => {
								if (!account?.accountId || isRejecting) {
									return;
								}

								setIsRejecting(true);

								accountService
									.rejectConsent(account.accountId)
									.fetch()
									.then((response) => {
										signOutAndClearContext(
											AnalyticsNativeEventAccountSignedOutSource.CONSENT_FORM,
											{}
										);
									})
									.catch((e) => {
										handleError(e);
									})
									.finally(() => {
										setIsRejecting(false);
									});
							}}
						>
							Do not accept
						</LoadingButton>

						<LoadingButton
							isLoading={isAccepting}
							className="ms-2 w-100"
							type="button"
							size="sm"
							onClick={() => {
								if (!account?.accountId || isAccepting) {
									return;
								}

								setIsAccepting(true);

								accountService
									.acceptConsent(account.accountId)
									.fetch()
									.catch((e) => {
										handleError(e);
									})
									.finally(() => {
										revalidator.revalidate();
										setIsAccepting(false);
									});
							}}
						>
							Accept
						</LoadingButton>
					</div>

					<p className="text-muted text-center">
						By clicking "Accept" you agree to the above User Consent Terms and{' '}
						<a
							href="https://cobalt-shared-media.s3.amazonaws.com/legal/privacy-policy-2022-12-06.pdf"
							rel="noopener noreferrer"
							target="_blank"
							className="text-muted"
						>
							Privacy Policy
						</a>
					</p>
				</Modal.Footer>
			)}
		</Modal>
	);
};

export default ConsentModal;
