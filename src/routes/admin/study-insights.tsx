import React, { useCallback, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { RecordingPreferenceId } from '@/lib/models';
import { studyService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';
import useFlags from '@/hooks/use-flags';
import InputHelper from '@/components/input-helper';

export async function loader() {
	return null;
}

export const Component = () => {
	const handleError = useHandleError();
	const { addFlag } = useFlags();
	const [formValues, setFormValues] = useState({
		username: '',
		recordingPreferenceId: '' as RecordingPreferenceId,
	});

	const handleFormSubmit = useCallback(
		async (event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault();
			try {
				await studyService
					.updateAccountPreferences({
						...formValues,
					})
					.fetch();

				setFormValues({
					username: '',
					recordingPreferenceId: '' as RecordingPreferenceId,
				});

				addFlag({
					variant: 'success',
					title: 'Account preferences updated',
					description: `Recording preference for the entered username was successfully updated.`,
					actions: [],
				});
			} catch (error) {
				handleError(error);
			}
		},
		[addFlag, formValues, handleError]
	);

	return (
		<>
			<Container fluid className="px-8 py-8">
				<Row className="mb-6">
					<Col>
						<div className="mb-8 d-flex align-items-center justify-content-between">
							<h2 className="mb-0">Study Insights</h2>
						</div>
						<hr />
					</Col>
				</Row>
			</Container>
			<Container className="pb-10">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Form className="p-8 pb-10 bg-white border rounded" onSubmit={handleFormSubmit}>
							<InputHelper
								className="mb-4"
								label="Username"
								value={formValues.username}
								onChange={({ currentTarget }) => {
									setFormValues((previousValues) => ({
										...previousValues,
										username: currentTarget.value,
									}));
								}}
								required
							/>
							<Form.Group>
								<Form.Label className="mb-0 me-4">Recording Preference:</Form.Label>
								<Form.Check
									inline
									type="radio"
									name="study-insight-recording-preference"
									id={`study-insight-recording-preference-${RecordingPreferenceId.VIDEO}`}
									label="Video"
									value={RecordingPreferenceId.VIDEO}
									checked={formValues.recordingPreferenceId === RecordingPreferenceId.VIDEO}
									onChange={({ currentTarget }) => {
										setFormValues((previousValues) => ({
											...previousValues,
											recordingPreferenceId: currentTarget.value as RecordingPreferenceId,
										}));
									}}
								/>
								<Form.Check
									inline
									type="radio"
									name="study-insight-recording-preference"
									id={`study-insight-recording-preference-${RecordingPreferenceId.AUDIO}`}
									label="Audio"
									value={RecordingPreferenceId.AUDIO}
									checked={formValues.recordingPreferenceId === RecordingPreferenceId.AUDIO}
									onChange={({ currentTarget }) => {
										setFormValues((previousValues) => ({
											...previousValues,
											recordingPreferenceId: currentTarget.value as RecordingPreferenceId,
										}));
									}}
								/>
							</Form.Group>
							<div className="text-right">
								<Button
									type="submit"
									size="lg"
									disabled={!formValues.username || !formValues.recordingPreferenceId}
								>
									Save
								</Button>
							</div>
						</Form>
					</Col>
				</Row>
			</Container>
		</>
	);
};
