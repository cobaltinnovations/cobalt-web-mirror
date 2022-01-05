import React, { FC, useCallback } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { interactionService } from '@/lib/services';
import useQuery from '@/hooks/use-query';
import AsyncPage from '@/components/async-page';

const Interaction: FC = () => {
	const query = useQuery();
	const interactionInstanceId = query.get('interactionInstanceId');
	const interactionOptionId = query.get('interactionOptionId');

	const fetchData = useCallback(async () => {
		const missingQueryParams: string[] = [];

		if (!interactionInstanceId) missingQueryParams.push('interactionInstanceId');
		if (!interactionOptionId) missingQueryParams.push('interactionOptionId');

		if (missingQueryParams.length > 0) {
			throw new Error(`The following query parameters are missing: ${missingQueryParams.join(', ')}`);
		}

		if (!interactionInstanceId || !interactionOptionId) {
			return;
		}

		await interactionService.postInteraction(interactionInstanceId, interactionOptionId).fetch();
	}, [interactionInstanceId, interactionOptionId]);

	return (
		<AsyncPage fetchData={fetchData}>
			<Container className="py-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<h1>Interaction</h1>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default Interaction;
