import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

import Breadcrumb from '@/components/breadcrumb';
import FileInputButton from '@/components/file-input-button';
import InputHelper from '@/components/input-helper';
import useHandleError from '@/hooks/use-handle-error';
import { adminService } from '@/lib/services';
import { useLoaderData } from 'react-router-dom';

type AdminDebugEmailTemplatesLoaderData = Awaited<ReturnType<typeof loader>>;

export async function loader() {
	// const emailMessageTemplatesResponse = await adminService
	// 	.getEmailMessageTemplates()
	// 	.fetch()

	return {
		emailMessageTemplates: [],
	};
}

const initialValues = {
	templateId: '',
	locale: 'en',
	fromAddress: 'test@cobalt.local',
	replyToAddress: 'test@cobalt.local',
	toAddresses: '',
	ccAddresses: '',
	bccAddresses: '',
	emailAttachments: [] as string[],
	messageContext: '{\n"templateVariableName": "testValue"\n}',
};

export const Component = () => {
	const handleError = useHandleError();
	const loaderData = useLoaderData() as AdminDebugEmailTemplatesLoaderData;

	const [formValues, setFormValues] = useState({ ...initialValues });
	const [hasJSONError, setHasJSONError] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const updateFormValue = useCallback((key: keyof typeof formValues, value: typeof formValues[typeof key]) => {
		setFormValues((currentValues) => {
			return {
				...currentValues,
				[key]: value,
			};
		});
	}, []);

	useEffect(() => {
		try {
			JSON.parse(formValues.messageContext);
			setHasJSONError(false);
		} catch (e) {
			setHasJSONError(true);
		}
	}, [formValues.messageContext]);

	return (
		<>
			<Breadcrumb
				breadcrumbs={[
					{
						to: '/',
						title: 'Home',
					},
					{
						to: '/admin',
						title: 'Admin',
					},
					{
						to: '/admin/debug',
						title: 'Debug',
					},
					{
						to: '/admin/debug/email-templates',
						title: 'Email Templates',
					},
				]}
			/>

			<Container className="py-10">
				<Row>
					<Col>
						<h3 className="mb-2">Email Templates Testing</h3>
					</Col>
				</Row>

				<Row className="mb-2">
					<Col xs={12}>
						<InputHelper
							className="mb-3"
							as="select"
							label="Email Template"
							name="templateId"
							required
							value={formValues.templateId}
							onChange={({ currentTarget }) => {
								updateFormValue('templateId', currentTarget.value);
							}}
						>
							<option value="" disabled>
								Select a template
							</option>
							{loaderData.emailMessageTemplates.map((template, index) => {
								return (
									<option key={index} value={template}>
										{template}
									</option>
								);
							})}
						</InputHelper>

						<InputHelper
							label="Message Context JSON"
							name="messageContext"
							value={formValues.messageContext}
							as="textarea"
							required
							error={hasJSONError ? 'Invalid JSON' : ''}
							className="mb-3"
							onChange={({ currentTarget }) => {
								updateFormValue('messageContext', currentTarget.value);
							}}
						/>
					</Col>

					<Col xs={12}>
						<InputHelper
							className="mb-3"
							type="text"
							label="From Address:"
							name="fromAddress"
							required
							value={formValues.fromAddress}
							onChange={({ currentTarget }) => {
								updateFormValue('fromAddress', currentTarget.value);
							}}
						/>

						<InputHelper
							className="mb-3"
							type="text"
							label="Reply To Address:"
							name="replyToAddress"
							required
							value={formValues.replyToAddress}
							onChange={({ currentTarget }) => {
								updateFormValue('replyToAddress', currentTarget.value);
							}}
						/>
					</Col>

					<Col xs={12}>
						<p className="mt-4">The following email inputs accepts comma separated emails</p>

						<InputHelper
							className="mb-3"
							type="text"
							label="To Addresses:"
							name="toAddresses"
							required
							value={formValues.toAddresses}
							onChange={({ currentTarget }) => {
								updateFormValue('toAddresses', currentTarget.value);
							}}
						/>

						<InputHelper
							className="mb-3"
							type="text"
							label="CC Addresses:"
							name="ccAddresses"
							value={formValues.ccAddresses}
							onChange={({ currentTarget }) => {
								updateFormValue('ccAddresses', currentTarget.value);
							}}
						/>

						<InputHelper
							className="mb-3"
							type="text"
							label="BCC Addresses:"
							name="bccAddresses"
							value={formValues.ccAddresses}
							onChange={({ currentTarget }) => {
								updateFormValue('bccAddresses', currentTarget.value);
							}}
						/>
					</Col>

					<Col xs={12}>
						<FileInputButton
							accept=""
							onChange={(file: File) => {
								const fileReader = new FileReader();

								fileReader.addEventListener('load', async () => {
									const fileContent = fileReader.result;
									updateFormValue('emailAttachments', [
										...formValues.emailAttachments,
										fileContent as string,
									]);
								});

								fileReader.readAsDataURL(file);
							}}
						>
							<Button as="div" variant={'outline-primary'} className="d-flex align-items-center">
								Attach
							</Button>
						</FileInputButton>

						<p>Total Attachments: {formValues.emailAttachments.length}</p>

						{formValues.emailAttachments.length > 0 && (
							<Button
								variant="outline-danger"
								onClick={() => {
									updateFormValue('emailAttachments', []);
								}}
							>
								Remove all Attachments
							</Button>
						)}
					</Col>

					<Col xs={12} className="d-flex justify-content-end">
						<Button
							size="lg"
							disabled={isSubmitting || hasJSONError}
							onClick={() => {
								const submission = {
									...formValues,
									toAddresses: formValues.toAddresses.split(',').map((value) => value.trim()),
									ccAddresses: formValues.ccAddresses.split(',').map((value) => value.trim()),
									bccAddresses: formValues.bccAddresses.split(',').map((value) => value.trim()),
								};

								setIsSubmitting(true);

								adminService
									.testEmailMessageTemplate(submission)
									.fetch()
									.then(() => {
										setFormValues({ ...initialValues });
									})
									.catch((e) => {
										handleError(e);
									})
									.finally(() => {
										setIsSubmitting(false);
									});
							}}
						>
							Send
						</Button>
					</Col>
				</Row>
			</Container>
		</>
	);
};
