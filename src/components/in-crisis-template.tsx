import React from 'react';
import { Button } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { CRISIS_RESOURCES } from '@/crisis-resources';
import useAnalytics from '@/hooks/use-analytics';
import { CrisisAnalyticsEvent } from '@/contexts/analytics-context';
import SvgIcon from '@/components/svg-icon';
import { CrisisResourceTypeId } from '@/lib/models';
import useAccount from '@/hooks/use-account';

const useStyles = createUseThemedStyles((theme) => ({
	linkButton: {
		padding: 24,
		width: '100%',
		display: 'flex',
		borderRadius: 8,
		alignItems: 'center',
		textDecoration: 'none',
		justifyContent: 'space-between',
		border: `1px solid ${theme.colors.border}`,
		[mediaQueries.lg]: {
			padding: 16,
		},
	},
	iconOuter: {
		padding: 16,
		flexShrink: 0,
		borderRadius: 500,
		backgroundColor: theme.colors.p50,
		border: `2px solid ${theme.colors.p500}`,
	},
}));

interface InCrisisTemplateProps {
	isModal?: boolean;
	showNonEmergencySupport?: boolean;
}

export const InCrisisTemplate = ({ isModal = false, showNonEmergencySupport = false }: InCrisisTemplateProps) => {
	const classes = useStyles();
	const { trackEvent } = useAnalytics();
	const { institution } = useAccount();
	const institutionResources = CRISIS_RESOURCES.filter(
		(resource) => !resource.institutionIds || resource.institutionIds.includes(institution.institutionId)
	);
	const crisisContactResources = institutionResources.filter(
		(resource) => resource.crisisResourceTypeId === CrisisResourceTypeId.CRISIS_CONTACT
	);
	const nonEmergencyResources = showNonEmergencySupport
		? institutionResources.filter(
				(resource) => resource.crisisResourceTypeId === CrisisResourceTypeId.NON_EMERGENCY_SUPPORT
		  )
		: [];

	return (
		<>
			{crisisContactResources.map((link, index) => {
				const isLast = crisisContactResources.length - 1 === index;

				return (
					<Button
						key={index}
						variant="light"
						className={classNames(classes.linkButton, {
							'mb-4': !isLast,
						})}
						href={link.href}
						onClick={() => {
							trackEvent({
								action: isModal ? 'In Crisis Pop Up' : 'In Crisis Page',
								link_text: link.description,
							});

							if (link.href.includes('tel:')) {
								trackEvent(CrisisAnalyticsEvent.clickCrisisTelResource(link.href));
							}
						}}
					>
						<div>
							<h4 className="mb-2">{link.title}</h4>
							<p className="mb-0">{link.description}</p>
						</div>
						<div className={classes.iconOuter}>
							<SvgIcon kit="fas" icon="phone-volume" size={20} className="d-flex" />
						</div>
					</Button>
				);
			})}

			{nonEmergencyResources.length > 0 && (
				<div className="mt-6">
					<hr className="mb-6" />
					<h4 className="mb-2">Looking for non-emergency support?</h4>
					<p className="mb-4">Explore additional mental health support options.</p>

					{nonEmergencyResources.map((link, index) => (
						<Button
							key={link.href}
							variant="light"
							className={classNames(classes.linkButton, {
								'mb-4': nonEmergencyResources.length - 1 !== index,
							})}
							href={link.href}
							onClick={() => {
								trackEvent({
									action: isModal ? 'In Crisis Pop Up' : 'In Crisis Page',
									link_text: link.description,
								});
								trackEvent(CrisisAnalyticsEvent.clickCrisisNonEmergencyResource(link.href));
							}}
						>
							<div>
								<h4 className="mb-2">{link.title}</h4>
								<p className="mb-0">{link.description}</p>
							</div>
							<div className={classes.iconOuter}>
								<SvgIcon kit="far" icon="arrow-right" size={20} className="d-flex" />
							</div>
						</Button>
					))}
				</div>
			)}
		</>
	);
};

export default InCrisisTemplate;
