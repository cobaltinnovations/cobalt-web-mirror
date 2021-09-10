import useAccount from '@/hooks/use-account';
import { BetaFeatureId, BetaStatusId } from '@/lib/models';
import { accountService } from '@/lib/services';
import React, { FC, useState } from 'react';
import { Button, Form, Modal, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

const useBetaFeaturesModalStyles = createUseStyles({
	betaFeatureModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface BetaFeatureModal extends ModalProps {
	contactEmail?: string;
}

export const BetaFeatureModal: FC<BetaFeatureModal> = (props) => {
	const classes = useBetaFeaturesModalStyles();

	return (
		<Modal {...props} dialogClassName={classes.betaFeatureModal} centered>
			<Modal.Header>
				<h3 className="mb-0">this feature is not available yet</h3>
			</Modal.Header>
			<Modal.Body>
				<p>Please join by clicking the link in the confirmation email sent to you by {props.contactEmail}.</p>
			</Modal.Body>
			<Modal.Footer className="justify-content-center">
				<Button className="w-75" variant="primary" size="sm" onClick={props.onHide}>
					ok
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

interface BetaFeatureAlertModal extends ModalProps {
	betaFeatureId: BetaFeatureId;
}

export const BetaFeatureAlertModal: FC<BetaFeatureAlertModal> = (props) => {
	const classes = useBetaFeaturesModalStyles();
	const { account } = useAccount();
	const [selection, setSelection] = useState<'yes' | 'no' | 'yesAlert'>('yes');

	const updateAlertStatuses = async () => {
		if (!account) {
			return;
		}

		try {
			selection === 'yesAlert'
				? await Promise.all([
						accountService.updateBetaFeatureAlert(account.accountId, props.betaFeatureId, BetaStatusId.ENABLED).fetch(),

						accountService.updateBetaStatus(account.accountId, BetaStatusId.ENABLED).fetch(),
				  ])
				: await accountService
						.updateBetaFeatureAlert(account.accountId, props.betaFeatureId, selection === 'no' ? BetaStatusId.DISABLED : BetaStatusId.ENABLED)
						.fetch();
		} catch (e) {
			// do nothing
		}

		props.onHide();
	};

	return (
		<Modal {...props} dialogClassName={classes.betaFeatureModal} centered>
			<Modal.Header>
				<h3 className="mb-0">feature updates</h3>
			</Modal.Header>
			<Modal.Body>
				<div className="mb-4">
					<p>Would you like to hear from us when this feature is ready?</p>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						id="betaAlert1"
						name="betaAlert"
						label="Yes"
						checked={selection === 'yes'}
						onChange={() => setSelection('yes')}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						id="betaAlert2"
						name="betaAlert"
						label="No"
						checked={selection === 'no'}
						onChange={() => setSelection('no')}
					/>
					<Form.Check
						type="radio"
						bsPrefix="cobalt-modal-form__check"
						id="betaAlert3"
						name="betaAlert"
						label="Yes, and please include me as a beta user for new feature releases"
						checked={selection === 'yesAlert'}
						onChange={() => setSelection('yesAlert')}
					/>
				</div>
			</Modal.Body>
			<Modal.Footer className="justify-content-center">
				<Button
					className="w-75"
					variant="primary"
					size="sm"
					onClick={() => {
						updateAlertStatuses();
					}}
				>
					submit
				</Button>
			</Modal.Footer>
		</Modal>
	);
};
