import ConsentContent from '@/components/consent-content';

import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import useTrackModalView from '@/hooks/use-track-modal-view';
import { ERROR_CODES } from '@/lib/http-client';
import { accountService } from '@/lib/services';
import React, { FC, useState } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import { Link } from 'react-router-dom';
import LoadingButton from './loading-button';

const useStyles = createUseStyles({
	modal: {
		width: '90%',
		maxWidth: 400,
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
	const { account, setAccount, signOutAndClearContext } = useAccount();

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
										signOutAndClearContext();
									})
									.catch((e) => {
										if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
											handleError(e);
										}
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
									.then((response) => {
										setAccount(response.account);
									})
									.catch((e) => {
										if (e.code !== ERROR_CODES.REQUEST_ABORTED) {
											handleError(e);
										}
									})
									.finally(() => {
										setIsAccepting(false);
									});
							}}
						>
							Accept
						</LoadingButton>
					</div>

					<p className="text-muted text-center">
						By clicking "Accept" you agree to the above User Consent Terms and{' '}
						<Link to="/privacy" target="_blank" className="text-muted">
							Privacy Policy
						</Link>
					</p>
				</Modal.Footer>
			)}
		</Modal>
	);
};

export default ConsentModal;
