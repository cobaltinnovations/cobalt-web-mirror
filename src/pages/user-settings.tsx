import React, { FC, ReactNode, useState } from 'react';
import { Button, Container } from 'react-bootstrap';

import ConfirmDialog from '@/components/confirm-dialog';
import useAccount from '@/hooks/use-account';
import useHandleError from '@/hooks/use-handle-error';
import { ERROR_CODES } from '@/lib/http-client';
import { accountService } from '@/lib/services';

const UserSettings: FC = () => {
	const { institution, account, signOutAndClearContext } = useAccount();
	const [showRevokeConfirmation, setShowRevokeConfirmation] = useState(false);
	const handleError = useHandleError();

	return (
		<>
			<Container className="py-10 py-lg-14">
				<h2 className="mb-4">Profile</h2>
				{institution?.requireConsentForm && (
					<ProfileSection
						title="User Agreement"
						actions={
							<div>
								<Button
									size="sm"
									variant="danger"
									onClick={() => {
										setShowRevokeConfirmation(true);
									}}
								>
									Revoke
								</Button>
							</div>
						}
					>
						<ConfirmDialog
							show={showRevokeConfirmation}
							onHide={() => {
								setShowRevokeConfirmation(false);
							}}
							titleText="Revoke Acceptance"
							bodyText="Are you sure you want to revoke your acceptance of the User Agreement?"
							detailText="You will be signed out of Cobalt and will not be able to sign in again until you accept the User Agreement."
							dismissText="Cancel"
							confirmText="Continue"
							onConfirm={() => {
								if (!account?.accountId) {
									return;
								}

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
									});
							}}
						/>
						<div>test</div>
					</ProfileSection>
				)}
			</Container>
		</>
	);
};

interface ProfileSectionProps {
	title: string;
	actions: ReactNode;
	children: ReactNode;
}

const ProfileSection = ({ title, actions, children }: ProfileSectionProps) => {
	return (
		<div className="d-flex">
			<div className="flex-grow-1">
				<h4>{title}</h4>
				{children}
			</div>

			{actions}
		</div>
	);
};

export default UserSettings;
