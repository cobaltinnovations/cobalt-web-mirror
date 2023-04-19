import React, { FC, useState } from 'react';
import { Modal, Button, Form, ModalProps } from 'react-bootstrap';

import { ScreeningFlowSkipTypeId } from '@/lib/models';
import { accountService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import useTrackModalView from '@/hooks/use-track-modal-view';
import InputHelper from '@/components/input-helper';
import { queryClient } from '@/app-providers';

interface CollectPhoneModalProps extends ModalProps {
	skippable?: boolean;
	screeningFlowSkipTypeId?: ScreeningFlowSkipTypeId;
	onSkip(): void;
	onSuccess(): void;
}

const CollectPhoneModal: FC<CollectPhoneModalProps> = ({
	skippable,
	screeningFlowSkipTypeId,
	onSkip,
	onSuccess,
	...props
}) => {
	useTrackModalView('CollectPhoneModal', props.show);
	const handleError = useHandleError();
	const { account } = useAccount();
	const [phoneNumberInputValue, setPhoneNumberInputValue] = useState<string>('');

	return (
		<Modal {...props} backdrop="static" centered onHide={() => onSkip()}>
			<Modal.Header closeButton={skippable}>
				<Modal.Title>
					{screeningFlowSkipTypeId === ScreeningFlowSkipTypeId.EXIT
						? 'Take the Assessment'
						: 'Take Our Assessment'}
				</Modal.Title>
			</Modal.Header>
			<Form
				onSubmit={async (e) => {
					e.preventDefault();

					if (!account) {
						return;
					}

					try {
						await accountService
							.updatePhoneNumberForAccountId(account.accountId, {
								phoneNumber: phoneNumberInputValue,
							})
							.fetch();

						queryClient.invalidateQueries(['account', account.accountId]);
						onSuccess();
					} catch (error) {
						handleError(error);
					}
				}}
			>
				<Modal.Body>
					{screeningFlowSkipTypeId === ScreeningFlowSkipTypeId.EXIT ? (
						<>
							<p className="fw-bold">Please enter your phone number to continue</p>
							<p className="mb-3">
								We respect your privacy and will only use your phone number to contact you if there is a
								need.
							</p>
						</>
					) : (
						<p className="mb-3">
							To take the Cobalt assessment we'd like a way to reach you if there is a need. Please enter
							your phone number to continue.
						</p>
					)}

					<InputHelper
						required
						type="tel"
						value={phoneNumberInputValue}
						autoFocus
						label={
							screeningFlowSkipTypeId === ScreeningFlowSkipTypeId.EXIT
								? 'Phone Number'
								: 'Your Phone Number'
						}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							setPhoneNumberInputValue(e.target.value);
						}}
					/>
				</Modal.Body>
				<Modal.Footer className="text-right">
					{skippable && (
						<Button
							className="me-2"
							type="button"
							variant="outline-primary"
							size="sm"
							onClick={() => {
								onSkip();
							}}
						>
							{screeningFlowSkipTypeId === ScreeningFlowSkipTypeId.EXIT ? 'Cancel' : 'Skip for Now'}
						</Button>
					)}
					<Button type="submit" variant="primary" size="sm">
						Continue
					</Button>
				</Modal.Footer>
			</Form>
		</Modal>
	);
};

export default CollectPhoneModal;
