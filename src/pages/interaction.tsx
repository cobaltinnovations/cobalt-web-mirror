import React, { FC, useCallback } from 'react';
import { Col, Container, Row } from 'react-bootstrap';

import { interactionService } from '@/lib/services';
import AsyncPage from '@/components/async-page';
import { useParams } from 'react-router-dom';

const Interaction: FC = () => {
	const { interactionInstanceId, interactionOptionId } = useParams<{
		interactionInstanceId: string;
		interactionOptionId: string;
	}>();

	const fetchData = useCallback(async () => {
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
