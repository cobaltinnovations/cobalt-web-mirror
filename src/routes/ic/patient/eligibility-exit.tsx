import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import useAccount from '@/hooks/use-account';
import AsyncWrapper from '@/components/async-page';
import { screeningService } from '@/lib/services/screening-service';

interface EligibilityExitContext {
	title: string;
	message: string;
	actionUrl?: string;
	actionText?: string;
	contactName?: string;
	contactPhone?: string;
}

export const PatientEligibilityExit = () => {
	const { institution } = useAccount();
	const { screeningSessionId } = useParams();
	const [context, setContext] = useState<EligibilityExitContext>();
	const fetchData = useCallback(async () => {
		if (!screeningSessionId) {
			throw new Error('Screening session unknown');
		}
		const response = await screeningService.getEligibilityExitContent(screeningSessionId).fetch();
		if (!response.eligibilityExitContent?.title || !response.eligibilityExitContent?.message) {
			throw new Error('Eligibility exit content unavailable');
		}
		setContext(response.eligibilityExitContent);
	}, [screeningSessionId]);
	const phoneHref = context?.contactPhone?.replace(/[^+\d]/g, '');

	return (
		<AsyncWrapper fetchData={fetchData}>
			{context && (
				<>
					<Helmet>
						<title>{institution.platformName ?? 'Cobalt'} | {context.title}</title>
					</Helmet>
					<Container className="py-20">
						<Row>
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }}>
								<h1 className="mb-6">{context.title}</h1>
								<p className="mb-6">{context.message}</p>
								{context.contactPhone && (
									<p className="mb-6">
										For more details, contact {context.contactName || 'us'} at{' '}
										<a href={`tel:${phoneHref}`}>{context.contactPhone}</a>.
									</p>
								)}
								{context.actionUrl && (
									<Button as="a" href={context.actionUrl}>
										{context.actionText || 'Explore support options'}
									</Button>
								)}
							</Col>
						</Row>
					</Container>
				</>
			)}
		</AsyncWrapper>
	);
};

export default PatientEligibilityExit;
