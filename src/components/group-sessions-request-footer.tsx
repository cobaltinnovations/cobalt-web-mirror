import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Modal, Row } from 'react-bootstrap';

import { groupSessionsService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import InputHelper from '@/components/input-helper';

const GroupSessionsRequestFooter = () => {
	const { institution } = useAccount();
	const navigate = useNavigate();
	const { addFlag } = useFlags();
	const handleError = useHandleError();

	const [showSuggestModal, setShowSuggestModal] = useState(false);
	const [suggestionFormValues, setSuggestionFormValues] = useState({
		emailAddress: '',
		suggestedTitle: '',
		message: '',
	});
	const [isSubmittingSuggestion, setIsSubmittingSuggestion] = useState(false);

	const handleSuggestionFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();

			try {
				setIsSubmittingSuggestion(true);

				await groupSessionsService
					.postGroupSuggestion({
						emailAddress: suggestionFormValues.emailAddress,
						title: suggestionFormValues.suggestedTitle,
						description: suggestionFormValues.message,
					})
					.fetch();

				setShowSuggestModal(false);
				addFlag({
					variant: 'success',
					title: 'Your idea has been submitted',
					description: 'Thanks for your suggestion!',
					actions: [],
				});
			} catch (error) {
				handleError(error);
			} finally {
				setIsSubmittingSuggestion(false);
			}
		},
		[
			addFlag,
			handleError,
			suggestionFormValues.emailAddress,
			suggestionFormValues.message,
			suggestionFormValues.suggestedTitle,
		]
	);

	return (
		<>
			<Modal
				show={showSuggestModal}
				centered
				onHide={() => {
					setShowSuggestModal(false);
				}}
			>
				<Modal.Header closeButton>
					<Modal.Title>Suggest a Group Session</Modal.Title>
				</Modal.Header>
				<Form onSubmit={handleSuggestionFormSubmit}>
					<Modal.Body>
						<InputHelper
							type="email"
							className="mb-4"
							label="Your Email"
							value={suggestionFormValues.emailAddress}
							onChange={({ currentTarget }) => {
								setSuggestionFormValues((previousValues) => ({
									...previousValues,
									emailAddress: currentTarget.value,
								}));
							}}
							disabled={isSubmittingSuggestion}
							required
						/>
						<InputHelper
							type="text"
							className="mb-4"
							label="Suggested Session Title or Topic"
							value={suggestionFormValues.suggestedTitle}
							onChange={({ currentTarget }) => {
								setSuggestionFormValues((previousValues) => ({
									...previousValues,
									suggestedTitle: currentTarget.value,
								}));
							}}
							disabled={isSubmittingSuggestion}
							required
						/>
						<InputHelper
							as="textarea"
							label="Message"
							value={suggestionFormValues.message}
							onChange={({ currentTarget }) => {
								setSuggestionFormValues((previousValues) => ({
									...previousValues,
									message: currentTarget.value,
								}));
							}}
							disabled={isSubmittingSuggestion}
						/>
					</Modal.Body>
					<Modal.Footer className="text-right">
						<Button
							type="button"
							variant="outline-primary"
							onClick={() => {
								setShowSuggestModal(false);
							}}
							disabled={isSubmittingSuggestion}
						>
							Cancel
						</Button>
						<Button className="ms-2" type="submit" variant="primary" disabled={isSubmittingSuggestion}>
							Submit
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			{institution?.groupSessionRequestsEnabled && (
				<Container fluid className="bg-n75">
					<Container className="py-10 py-lg-20">
						<Row>
							<Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
								<h2 className="mb-6 text-center">Looking to schedule a group session for your team?</h2>
								<p className="mb-6 fs-large text-center">
									Request a session and we'll work with you to find a dedicated time for a
									wellness-focused group session for your team.
								</p>
								<div className="text-center">
									<Button
										variant="primary"
										className="me-1"
										onClick={() => {
											navigate('/group-sessions/request');
										}}
									>
										Request a Session
									</Button>
									{/* <Button
										variant="outline-primary"
										className="ms-1"
										onClick={() => {
											setShowSuggestModal(true);
										}}
									>
										Suggest a Session
									</Button> */}
								</div>
							</Col>
						</Row>
					</Container>
				</Container>
			)}
		</>
	);
};

export default GroupSessionsRequestFooter;
