import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import classNames from 'classnames';

import { ActionLinkModel, ACTION_LINK_TYPE_ID, CallToActionModel } from '@/lib/models';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as InfoIcon } from '@/assets/icons/icon-question-mark.svg';

const useStyles = createUseThemedStyles((theme) => ({
	callToAction: {
		borderRadius: 12,
		padding: '40px 110px',
		alignItems: 'center',
		backgroundColor: theme.colors.p50,
		border: `1px solid ${theme.colors.p500}`,
		[mediaQueries.lg]: {
			padding: '40px 40px',
		},
		'& .wysiwyg-display a': {
			...theme.fonts.bodyNormal,
		},
	},
	infoIcon: {
		flexShrink: 0,
		marginRight: 18,
		color: theme.colors.p500,
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
	actionLinksOuter: {
		marginBottom: 32,
		display: 'flex',
		flexWrap: 'wrap',
		'& button': {
			marginRight: 10,
			display: 'inline-flex',
			whiteSpace: 'nowrap',
		},
		[mediaQueries.lg]: {
			marginTop: 16,
			paddingLeft: 0,
		},
	},
	modal: {
		width: '90%',
		height: '100%',
		maxWidth: 408,
		margin: '0 auto',
		'& .modal-content': {
			maxHeight: '90vh',
		},
		'& .cobalt-modal__body': {
			paddingTop: 0,
		},
	},
	modalHeader: {
		border: 0,
		backgroundColor: 'transparent',
	},
}));

interface Props {
	callToAction: CallToActionModel;
	className?: string;
}

const CallToAction = ({ callToAction, className }: Props) => {
	const classes = useStyles();
	const { openInCrisisModal } = useInCrisisModal();
	const [showModal, setShowModal] = useState(false);

	const handleActionLinkClick = (actionLink: ActionLinkModel) => {
		// TODO: Track event?
		// actionLink.analyticsEventCategory
		// actionLink.analyticsEventAction
		// actionLink.analyticsEventLabel

		switch (actionLink.actionLinkTypeId) {
			case ACTION_LINK_TYPE_ID.EXTERNAL:
				window.open(actionLink.link, '_blank', 'noopener, noreferrer');
				break;
			case ACTION_LINK_TYPE_ID.INTERNAL:
				window.open(actionLink.link, '_self');
				break;
			case ACTION_LINK_TYPE_ID.CRISIS:
				openInCrisisModal();
				break;
			default:
				return;
		}
	};

	return (
		<>
			<Modal
				show={showModal}
				dialogClassName={classes.modal}
				centered
				onHide={() => {
					setShowModal(false);
				}}
			>
				<Modal.Header className={classes.modalHeader}>
					<Modal.Title>&nbsp;</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div
						className="mb-6"
						dangerouslySetInnerHTML={{
							__html: callToAction.modalMessageAsHtml ?? '',
						}}
					/>
					<div className="text-right">
						<Button
							onClick={() => {
								setShowModal(false);
							}}
						>
							OK
						</Button>
					</div>
				</Modal.Body>
			</Modal>

			<div className={classNames(classes.callToAction, className)}>
				<div
					className="mb-8 wysiwyg-display"
					dangerouslySetInnerHTML={{ __html: callToAction.messageAsHtml }}
				/>
				<div className={classes.actionLinksOuter}>
					{callToAction.actionLinks.map((actionLink, index) => {
						return (
							<Button key={`action-link-${index}`} onClick={() => handleActionLinkClick(actionLink)}>
								{actionLink.description}
							</Button>
						);
					})}
				</div>
				{callToAction.modalButtonText && (
					<Button
						variant="link"
						className="fw-normal d-inline-flex align-items-center p-0 text-decoration-none"
						onClick={() => {
							setShowModal(true);
						}}
					>
						<InfoIcon className="me-2" />
						{callToAction.modalButtonText}
					</Button>
				)}
			</div>
		</>
	);
};

export default CallToAction;
