import React, { FC, useState } from 'react';
import { Modal, Button, Form, ModalProps } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';
import InputHelper from '@/components/input-helper';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { accountService } from '@/lib/services';
import useTrackModalView from '@/hooks/use-track-modal-view';

const useCollectPhoneModalStyles = createUseStyles({
	collectPhoneNumberModal: {
		width: '90%',
		maxWidth: 295,
		margin: '0 auto',
	},
});

interface CollectPhoneModalProps extends ModalProps {
	skippable?: boolean;
	onSkip(): void;
	onSuccess(): void;
}

const CollectPhoneModal: FC<CollectPhoneModalProps> = ({ skippable, onSkip, onSuccess, ...props }) => {
	useTrackModalView('CollectPhoneModal', props.show);
	const handleError = useHandleError();
	const classes = useCollectPhoneModalStyles();
	const { account, setAccount } = useAccount();
	const [phoneNumberInputValue, setPhoneNumberInputValue] = useState<string>('');

	return (
		<Modal
			{...props}
			backdrop="static"
			dialogClassName={classes.collectPhoneNumberModal}
			centered
			onHide={() => onSkip()}
		>
			<Modal.Header closeButton={skippable}>
				<Modal.Title>Take Our Assessment</Modal.Title>
			</Modal.Header>
			<Form
				onSubmit={async (e) => {
					e.preventDefault();

					if (!account) {
						return;
					}

					try {
						const accountResponse = await accountService
							.updatePhoneNumberForAccountId(account.accountId, {
								phoneNumber: phoneNumberInputValue,
							})
							.fetch();

						setAccount(accountResponse.account);
						onSuccess();
					} catch (error) {
						handleError(error);
					}
				}}
			>
				<Modal.Body>
					<p className="mb-3">
						To take the Cobalt assessment we'd like a way to reach you if there is a need. Please enter your
						phone number to continue.
					</p>
					<InputHelper
						required
						type="tel"
						value={phoneNumberInputValue}
						autoFocus
						label="Your Phone Number"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setPhoneNumberInputValue(e.target.value);
						}}
					/>
				</Modal.Body>
				<Modal.Footer>
					<div className="text-center">
						{skippable && (
							<Button
								className="mb-2"
								type="button"
								variant="outline-primary"
								size="sm"
								onClick={() => {
									onSkip();
								}}
							>
								Skip for Now
							</Button>
						)}

						<div className="d-grid">
							<Button type="submit" variant="primary" size="sm">
								Continue Assessment
							</Button>
						</div>
					</div>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CollectPhoneModal;
