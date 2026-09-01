import { Button, Container, Row, Col } from 'react-bootstrap';
import React, { useMemo } from 'react';
import useAccount from '@/hooks/use-account';
import { FeatureId } from '@/lib/models';
import { useNavigate } from 'react-router-dom';
import { createUseThemedStyles } from '@/jss/theme';
import SvgIcon from './svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	callout: {
		padding: 48,
		borderRadius: 8,
		backgroundColor: theme.colors.p50,
		border: `1px solid ${theme.colors.p300}`,
	},
}));

export interface FeatureScreeningCtaProps {
	onStartAssessment: () => void;
}

function FeatureScreeningCta({ onStartAssessment }: FeatureScreeningCtaProps) {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const classes = useStyles();
	const resourceNavigatorFeature = useMemo(
		() => institution.features.find(({ featureId }) => featureId === FeatureId.RESOURCE_NAVIGATOR),
		[institution.features]
	);
	const hasRecommendations = institution.features.some((feature) => feature.recommended);
	const description = resourceNavigatorFeature?.providerId
		? 'Take an online assessment to get instant recommendations or schedule a call with a Care Navigator to discuss your options.'
		: 'Take an online assessment to get instant recommendations.';

	return (
		<Container className="mb-10">
			<Row>
				<Col>
					<div className={classes.callout}>
						<h4 className="mb-2 text-center">Not sure what you need?</h4>
						<p className="mb-6 text-center">{description}</p>
						<div className="d-flex flex-wrap align-items-center justify-content-center">
							{institution.epicFhirEnabled ? (
								<Button
									variant="outline-primary"
									className="mx-1 mb-2"
									onClick={() => {
										window.open(institution.externalContactUsUrl, '_blank');
									}}
								>
									Speak with a Resource Navigator
								</Button>
							) : (
								<Button className="mx-1 mb-2" onClick={onStartAssessment}>
									Take Assessment
								</Button>
							)}
							{resourceNavigatorFeature?.providerId && (
								<Button
									className="mx-1 mb-2 d-flex align-items-center"
									onClick={() => navigate(`/provider-info/${resourceNavigatorFeature.providerId}`)}
								>
									<SvgIcon kit="far" icon="calendar" size={16} className="me-2" />
									Schedule with Care Navigator
								</Button>
							)}
						</div>
						{institution.hasTakenFeatureScreening && (
							<div className="mt-5 d-flex align-items-center justify-content-center">
								<SvgIcon
									kit="fas"
									icon="circle-info"
									size={16}
									className="me-2 text-p300 flex-shrink-0"
								/>
								<p className="mb-0">
									{hasRecommendations
										? 'Recommendations are based on your recent assessment scores.'
										: 'There are no recommendations based on your recent assessment scores.'}
								</p>
							</div>
						)}
					</div>
				</Col>
			</Row>
		</Container>
	);
}

export default FeatureScreeningCta;
