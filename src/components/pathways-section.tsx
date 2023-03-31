import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import useAccount from '@/hooks/use-account';
import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import PathwaysIcon from '@/components/pathways-icons';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

import { ReactComponent as InfoIcon } from '@/assets/icons/icon-info.svg';

const useStyles = createUseThemedStyles((theme) => ({
	pathways: {
		display: 'flex',
		flexWrap: 'wrap',
		margin: '0 -16px',
		justifyContent: 'center',
		[mediaQueries.lg]: {
			margin: '0',
			display: 'block',
		},
	},
	pathwayOuter: {
		width: '14.2857%',
		padding: '0 16px',
		marginBottom: 32,
		[mediaQueries.xl]: {
			width: '25%',
			marginBottom: 36,
		},
		[mediaQueries.lg]: {
			padding: '0',
			width: '100%',
			marginBottom: 16,
		},
	},
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
		border: `1px solid ${theme.colors.n100}`,
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
		width: '100%',
		display: 'flex',
		marginBottom: 32,
		borderRadius: '50%',
		position: 'relative',
		paddingBottom: '100%',
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
			border: `2px solid ${theme.colors.a500}`,
		},
		[mediaQueries.lg]: {
			width: 48,
			height: 48,
			padding: 0,
			marginRight: 20,
			marginBottom: 0,
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
}

const PathwaysSection = ({ className }: PathwaysSectionProps) => {
	const { account, institution } = useAccount();
	const classes = useStyles();

	const { startScreeningFlowWithoutChecks, renderedCollectPhoneModal } = useScreeningFlow({
		screeningFlowId: institution?.featureScreeningFlowId,
		instantiateOnLoad: false,
	});

	return (
		<>
			{renderedCollectPhoneModal}
			<Container className={className}>
				<Row>
					<Col>
						<div className={classes.pathways}>
							{(institution?.features ?? []).map(
								({ featureId, urlName, name, recommended }, featureIndex) => (
									<div key={featureId} className={classes.pathwayOuter}>
										<Link
											to={
												featureId === 'THERAPY' && account?.institutionLocationId
													? `${urlName}?institutionLocationId=${account.institutionLocationId}`
													: urlName
											}
											className={classNames(classes.pathway, {
												recommended: recommended,
											})}
										>
											<div className={classes.iconOuter}>
												<PathwaysIcon className={classes.icon} featureId={featureId} />
											</div>
											<h5 className="text-center">{name}</h5>
											{recommended && <div className={classes.recommended}>Recommended</div>}
										</Link>
									</div>
								)
							)}
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
											onClick={startScreeningFlowWithoutChecks}
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
