import React, { FC, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import useHeaderTitle from '@/hooks/use-header-title';

import AsyncPage from '@/components/async-page';
import StudioEvent from '@/components/studio-event';
import Breadcrumb from '@/components/breadcrumb';

import { groupEventService } from '@/lib/services';
import { ExternalGroupEventType } from '@/lib/models';

interface RouteParams {
	externalGroupEventTypeId: string;
}

const InTheStudioExternalDetail: FC = () => {
	const { externalGroupEventTypeId } = useParams<RouteParams>();

	const [groupEvent, setGroupEvent] = useState<ExternalGroupEventType | null>(null);

	useHeaderTitle(groupEvent?.name ?? '');

	const fetchData = useCallback(async () => {
		if (!externalGroupEventTypeId) return;

		const response = await groupEventService.fetchExternalGroupEventType(externalGroupEventTypeId).fetch();
		setGroupEvent(response.externalGroupEventType);
	}, [externalGroupEventTypeId]);

	return (
		<AsyncPage fetchData={fetchData}>
			<Breadcrumb
				breadcrumbs={[
					{
						to: '/',
						title: 'home',
					},
					{
						to: '/in-the-studio',
						title: 'in the studio',
					},
					{
						to: '/#',
						title: 'event',
					},
				]}
			/>

			{groupEvent && (
				<Container fluid="md">
					<Row>
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<StudioEvent groupEvent={groupEvent} />
						</Col>
					</Row>
				</Container>
			)}

			<Container className="pt-5 pb-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<p
							className="mb-0"
							dangerouslySetInnerHTML={{
								__html: groupEvent?.description ?? '',
							}}
						/>
					</Col>
				</Row>
				<Row className="mt-5 text-center">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Button
							variant="primary"
							onClick={() => {
								window.open(groupEvent?.signupUrl, '_blank');
							}}
						>
							Request a Session
						</Button>
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default InTheStudioExternalDetail;
