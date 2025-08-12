import { AccountSource, AccountSourceDisplayStyleId } from '@/lib/models';
import classNames from 'classnames';
import React from 'react';
import { Button, Modal, ModalProps } from 'react-bootstrap';

const accountSourceVariantMap = {
	[AccountSourceDisplayStyleId.PRIMARY]: 'primary',
	[AccountSourceDisplayStyleId.SECONDARY]: 'outline-primary',
	[AccountSourceDisplayStyleId.TERTIARY]: 'link',
};

interface AccountSourcesModalProps extends ModalProps {
	accountSources: AccountSource[];
	onAccountSourceClick(accountSource: AccountSource): void;
}

const AccountSourcesModal = ({ accountSources, onAccountSourceClick, ...props }: AccountSourcesModalProps) => {
	return (
		<Modal centered {...props}>
			<Modal.Header closeButton>
				<Modal.Title>Sign In Required</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p className="mb-4">
					<strong>To continue, please sign in to your account.</strong>
				</p>
				<p className="mb-4">
					Signing in gives you access to personalized features and ensures your progress is saved.
				</p>
				<hr className="mb-4" />
				<p className="mb-4 text-center">Select your sign in method to continue</p>
				{accountSources.map((as, asIndex) => {
					const isLast = accountSources.length - 1 === asIndex;
					const variant = accountSourceVariantMap[as.accountSourceDisplayStyleId] || 'primary';

					return (
						<Button
							key={as.accountSourceId}
							variant={variant}
							size="lg"
							className={classNames('d-block w-100', { 'mb-4': !isLast })}
							data-testid={`signIn-${as.accountSourceId}`}
							onClick={() => {
								onAccountSourceClick(as);
							}}
						>
							{as.authenticationDescription}
						</Button>
					);
				})}
			</Modal.Body>
		</Modal>
	);
};

export default AccountSourcesModal;
