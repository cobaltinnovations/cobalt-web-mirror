import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import PathwaysIcon from '@/components/pathways-icons';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info-fill.svg';
import useAnalytics from '@/hooks/use-analytics';
import { AnalyticsNativeEventClickthroughFeatureSource, AnalyticsNativeEventTypeId, FeatureId } from '@/lib/models';
import { analyticsService } from '@/lib/services';

interface UseStylesProps {
	featuresLength: number;
}

const useStyles = createUseThemedStyles((theme) => ({
	pathways: ({ featuresLength }: UseStylesProps) => ({
		display: 'flex',
		flexWrap: 'wrap',
		margin: '0 -16px',
		justifyContent: 'center',
		'& .pathway-outer': {
			width: `${100 / featuresLength}%`,
			padding: '0 16px',
			marginBottom: 32,
			[mediaQueries.xxl]: {
				width: '25%',
				marginBottom: 36,
			},
			[mediaQueries.lg]: {
				padding: '0',
				width: '100%',
				marginBottom: 16,
			},
		},
		[mediaQueries.lg]: {
			margin: '0',
			display: 'block',
			'& .pathway-outer': {
				padding: '0',
				width: '100%',
				marginBottom: 16,
			},
		},
	}),
	pathway: {
		zIndex: 0,
		height: '100%',
		borderRadius: 8,
		display: 'block',
		padding: '32px 24px',
		position: 'relative',
		textDecoration: 'none',
		transition: '0.2s transform, 0.2s box-shadow',
		color: theme.colors.n900,
		backgroundColor: theme.colors.n75,
		border: `1px solid ${theme.colors.border}`,
		'& h5': {
			wordBreak: 'initial',
		},
		'&.recommended': {
			'&:before': {
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 2,
				height: 16,
				content: '""',
				position: 'absolute',
				borderBottomLeftRadius: 6,
				borderBottomRightRadius: 6,
				backgroundColor: 'inherit',
				[mediaQueries.lg]: {
					display: 'none',
				},
			},
			'&:after': {
				top: -3,
				left: -3,
				right: -3,
				bottom: -32,
				zIndex: 1,
				content: '""',
				borderRadius: 8,
				position: 'absolute',
				border: `3px solid ${theme.colors.p300}`,
				borderBottomWidth: 40,
				[mediaQueries.lg]: {
					bottom: -3,
					borderBottomWidth: 3,
				},
			},
		},
		'&:hover': {
			color: 'inherit',
			transform: 'translateY(-16px)',
			boxShadow: theme.elevation.e400,
		},
		[mediaQueries.lg]: {
			display: 'flex',
			padding: '16px 20px',
			alignItems: 'center',
		},
	},
	iconOuter: {
		width: 100,
		height: 100,
		display: 'flex',
		borderRadius: '50%',
		position: 'relative',
		margin: '0 auto 32px',
		backgroundColor: theme.colors.n0,
		'&:after': {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			content: '""',
			borderRadius: '50%',
			position: 'absolute',
			pointerEvents: 'none',
			border: `2px solid ${theme.colors.a300}`,
		},
		[mediaQueries.lg]: {
			width: 48,
			height: 48,
			padding: 0,
			margin: '0 20px 0 0',
		},
	},
	icon: {
		width: 56,
		height: 56,
		top: '50%',
		left: '50%',
		position: 'absolute',
		color: theme.colors.p300,
		transform: 'translate(-50%, -50%)',
		[mediaQueries.lg]: {
			width: 24,
			height: 24,
		},
	},
	recommended: {
		left: 0,
		right: 0,
		zIndex: 2,
		height: 32,
		bottom: -32,
		display: 'flex',
		position: 'absolute',
		alignItems: 'center',
		color: theme.colors.n0,
		justifyContent: 'center',
		...theme.fonts.small,
		[mediaQueries.lg]: {
			display: 'none',
		},
	},
}));

interface PathwaysSectionProps {
	className?: string;
	featuresScreeningFlow: ReturnType<typeof useScreeningFlow>;
}

const PathwaysSection = ({ className, featuresScreeningFlow }: PathwaysSectionProps) => {
	const { account, institution } = useAccount();
	const { trackEvent } = useAnalytics();
	const classes = useStyles({
		featuresLength: (institution?.features ?? []).filter((feature) => feature.landingPageVisible).length,
	});

	const { startScreeningFlow } = featuresScreeningFlow;

	return (
		<>
			<Container className={className}>
				<Row>
					<Col>
						<div className={classes.pathways}>
							{(institution?.features ?? [])
								.filter((feature) => feature.landingPageVisible)
								.map(({ featureId, urlName, name, recommended, subtitle }) => (
									<div key={featureId} className="pathway-outer">
										<Link
											to={
												featureId === FeatureId.THERAPY && account?.institutionLocationId
													? `${urlName}?institutionLocationId=${account.institutionLocationId}`
													: urlName
											}
											className={classNames(classes.pathway, {
												recommended: recommended,
											})}
											onClick={() => {
												analyticsService.persistEvent(
													AnalyticsNativeEventTypeId.CLICKTHROUGH_FEATURE,
													{
														data: featureId,
														source: AnalyticsNativeEventClickthroughFeatureSource.HOME,
													}
												);

												trackEvent({
													action: 'HP Nav',
													link_text: name,
												});
											}}
										>
											<div className={classes.iconOuter}>
												<PathwaysIcon className={classes.icon} featureId={featureId} />
											</div>
											<h5 className="text-center">{name}</h5>
											{subtitle && <p className="mt-2 mb-0 text-muted text-center">{subtitle}</p>}
											{recommended && <div className={classes.recommended}>Recommended</div>}
										</Link>
									</div>
								))}
						</div>
					</Col>
				</Row>

				{institution?.hasTakenFeatureScreening && (
					<Row className="pt-12">
						<Col>
							<div className="d-flex align-items-center justify-content-center">
								<InfoIcon className="me-2 text-p300 flex-shrink-0" width={20} height={20} />
								<p className="mb-0">
									{(institution?.features ?? []).some((feature) => feature.recommended)
										? 'Recommendations are based on your recent assessment scores.'
										: 'There are no recommendations based on your recent assessment scores.'}
									{institution?.takeFeatureScreening && institution?.hasTakenFeatureScreening && (
										<Button
											variant="link"
											className="ms-1 p-0 fw-normal"
											onClick={startScreeningFlow}
										>
											Retake the assessment
										</Button>
									)}
								</p>
							</div>
						</Col>
					</Row>
				)}
			</Container>
		</>
	);
};

export default PathwaysSection;
