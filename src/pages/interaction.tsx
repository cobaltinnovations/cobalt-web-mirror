import React, { FC, useCallback, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { interactionService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import { useParams } from 'react-router-dom';
import useAccount from '@/hooks/use-account';

const Interaction: FC = () => {
	const { institution } = useAccount();
	const { interactionInstanceId, interactionOptionId } = useParams<{
		interactionInstanceId: string;
		interactionOptionId: string;
	}>();
	const [optionResponse, setOptionResponse] = useState('');

	const fetchData = useCallback(async () => {
		if (!interactionInstanceId || !interactionOptionId) {
			return;
		}

		const { interactionOption } = await interactionService
			.postInteraction(interactionInstanceId, interactionOptionId)
			.fetch();

		setOptionResponse(interactionOption.optionResponse);
	}, [interactionInstanceId, interactionOptionId]);

	return (
		<>
			<Helmet>
				<title>{institution.platformName ?? 'Cobalt'} | Interaction</title>
			</Helmet>

			<AsyncPage fetchData={fetchData}>
				<Container className="py-5">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h1>Interaction</h1>
							<p>{optionResponse}</p>
						</Col>
					</Row>
				</Container>
			</AsyncPage>
		</>
	);
};

export default Interaction;
