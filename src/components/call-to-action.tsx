import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { ActionLinkModel, ACTION_LINK_TYPE_ID, CallToActionModel } from '@/lib/models';
import useInCrisisModal from '@/hooks/use-in-crisis-modal';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';

const useStyles = createUseThemedStyles((theme) => ({
	callToAction: {
		display: 'flex',
		borderRadius: 12,
		padding: '14px 24px',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.p50,
		border: `1px solid ${theme.colors.p500}`,
		[mediaQueries.lg]: {
			flexDirection: 'column',
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
		paddingLeft: 24,
		'& button': {
			whiteSpace: 'nowrap',
		},
		[mediaQueries.lg]: {
			marginTop: 16,
			paddingLeft: 0,
		},
	},
}));

interface Props {
	callToAction: CallToActionModel;
	className?: string;
}

const CallToAction = ({ callToAction, className }: Props) => {
	const classes = useStyles();
	const { openInCrisisModal } = useInCrisisModal();

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
		<div className={classNames(classes.callToAction, className)}>
			<div className="d-flex align-items-center">
				<InfoIcon width={20} height={20} className={classes.infoIcon} />
				<div className="wysiwyg-display" dangerouslySetInnerHTML={{ __html: callToAction.messageAsHtml }} />
			</div>
			<div className={classes.actionLinksOuter}>
				{callToAction.actionLinks.map((actionLink, index) => {
					const isLast = index === callToAction.actionLinks.length - 1;

					return (
						<Button
							key={`action-link-${index}`}
							className={classNames('d-block', {
								'mb-1': !isLast,
							})}
							onClick={() => handleActionLinkClick(actionLink)}
						>
							{actionLink.description}
						</Button>
					);
				})}
			</div>
		</div>
	);
};

export default CallToAction;
