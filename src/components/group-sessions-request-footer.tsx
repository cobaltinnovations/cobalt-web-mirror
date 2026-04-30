import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Modal } from 'react-bootstrap';

import { groupSessionsService } from '@/lib/services';
import useAccount from '@/hooks/use-account';
import useFlags from '@/hooks/use-flags';
import useHandleError from '@/hooks/use-handle-error';
import CallToActionFullWidth from '@/components/call-to-action-full-width';
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
				<CallToActionFullWidth
					title="Looking to schedule a group session for your team?"
					description="Request a session and we'll work with you to find a dedicated time for a wellness-focused group session for your team."
					buttonText="Request a Session"
					onButtonClick={() => {
						navigate('/group-sessions/request');
					}}
				/>
			)}
		</>
	);
};

export default GroupSessionsRequestFooter;
