import React, { FC, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

import { InteractionInstance, InteractionOption, InteractionOptionAction } from '@/lib/models';
import { interactionService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import AsyncPage from '@/components/async-page';
import HeroContainer from '@/components/hero-container';

const InteractionInstances: FC = () => {
	const handleError = useHandleError();
	const { interactionId } = useParams<{ interactionId: string }>();
	const [interactionInstance, setInteractionInstance] = useState<InteractionInstance>();
	const [interactionOptions, setInteractionOptions] = useState<InteractionOption[]>([]);
	const [interactionOptionActions, setInteractionOptionActions] = useState<InteractionOptionAction[]>([]);

	const fetchData = useCallback(async () => {
		if (!interactionId) {
			return;
		}

		const response = await interactionService.getInteractionInstances(interactionId).fetch();

		setInteractionInstance(response.interactionInstance);
		setInteractionOptions(response.interactionOptions);
		setInteractionOptionActions(response.interactionOptionActions);
	}, [interactionId]);

	const handleInteractionOptionButtonClick = async (interactionOption: InteractionOption) => {
		if (
			!window.confirm(
				'Are you sure you want to record a followup of "' + interactionOption.optionDescription + '"?'
			)
		)
			return;

		try {
			if (!interactionInstance) {
				throw new Error('interactionInstance is undefined.');
			}

			await interactionService
				.postInteractionOptionActions({
					interactionInstanceId: interactionInstance.interactionInstanceId,
					interactionOptionId: interactionOption.interactionOptionId,
				})
				.fetch();

			window.location.reload();
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<>
			<Helmet>
				<title>Cobalt | Interaction</title>
			</Helmet>

			<AsyncPage fetchData={fetchData}>
				<HeroContainer className="text-center">
					<h3 className="mb-3">{interactionInstance?.caseNumber}</h3>
					<small className="text-uppercase">{interactionInstance?.startDateTimeDescription}</small>
				</HeroContainer>
				<Container className="py-5">
					<Row className="pb-3">
						<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
							<h3 className="mb-4 text-center">Interaction Data</h3>
							<div
								className="wysiwyg-display"
								dangerouslySetInnerHTML={{
									__html: interactionInstance?.metadata.endUserHtmlRepresentation || '',
								}}
							/>
						</Col>
					</Row>
					{interactionOptionActions.length > 0 && (
						<Row className="pb-3">
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
								<h3 className="mb-4 text-center">Followups Already Recorded</h3>
								<ul>
									{interactionOptionActions.map((interactionOptionAction) => {
										return (
											<li key={interactionOptionAction.interactionOptionActionId}>
												<div
													className="wysiwyg-display"
													dangerouslySetInnerHTML={{
														__html: interactionOptionAction.descriptionAsHtml,
													}}
												/>
											</li>
										);
									})}
								</ul>
							</Col>
						</Row>
					)}
					{interactionOptions.length > 0 && (
						<Row>
							<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
								<h3 className="mb-4 text-center">Record Your Followup</h3>
								{interactionOptions.map((interactionOption) => {
									return (
										<Button
											key={interactionOption.interactionOptionId}
											className="d-block w-100 mb-1"
											variant="light"
											onClick={() => {
												handleInteractionOptionButtonClick(interactionOption);
											}}
										>
											{interactionOption.optionDescription}
										</Button>
									);
								})}
							</Col>
						</Row>
					)}
				</Container>
			</AsyncPage>
		</>
	);
};

export default InteractionInstances;
