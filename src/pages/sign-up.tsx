import * as yup from 'yup';

import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import useHeaderTitle from '@/hooks/use-header-title';
import useSubdomain from '@/hooks/use-subdomain';

import HeroContainer from '@/components/hero-container';
import InputHelper from '@/components/input-helper';

import { getRequiredYupFields } from '@/lib/utils';
import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const signUpSchema = yup
	.object()
	.required()
	.shape({
		emailAddress: yup.string().required().default(''),
		password: yup.string().required().default(''),
	});
type SignUpFormData = yup.InferType<typeof signUpSchema>;
const requiredFields = getRequiredYupFields<SignUpFormData>(signUpSchema);

const SignUp: FC = () => {
	const handleError = useHandleError();
	useHeaderTitle(null);
	const subdomain = useSubdomain();
	const history = useHistory();

	async function handleFormSubmit(values: SignUpFormData) {
		try {
			if (!subdomain) {
				throw new Error('Could not extract subdomain for inviteAccount.');
			}

			const { accountInviteId } = await accountService
				.inviteAccount({
					subdomain,
					accountSourceId: 'EMAIL_PASSWORD',
					emailAddress: values.emailAddress,
					password: values.password,
				})
				.fetch();

			history.push({
				pathname: '/sign-up-verify',
				state: {
					emailAddress: values.emailAddress,
					accountInviteId,
				},
			});
		} catch (error) {
			handleError((error as any).message);
		}
	}

	return (
		<>
			<HeroContainer>
				<h2 className="mb-0 text-center">welcome!</h2>
			</HeroContainer>
			<Container className="pt-4 pb-4">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Formik<SignUpFormData>
							enableReinitialize
							validationSchema={signUpSchema}
							initialValues={signUpSchema.cast(undefined)}
							onSubmit={handleFormSubmit}
						>
							{(formikBag) => {
								const { values, handleChange, handleSubmit, touched, errors } = formikBag;
								return (
									<Form onSubmit={handleSubmit}>
										<InputHelper
											className="mb-1"
											name="emailAddress"
											type="email"
											label="Your email"
											value={values.emailAddress}
											onChange={handleChange}
											required={requiredFields.emailAddress}
											error={
												touched.emailAddress && errors.emailAddress ? errors.emailAddress : ''
											}
										/>
										<InputHelper
											className="mb-7"
											name="password"
											type="password"
											label="Create your password"
											helperText="8+ characters, including a number"
											value={values.password}
											onChange={handleChange}
											required={requiredFields.password}
											error={touched.password && errors.password ? errors.password : ''}
										/>
										<div className="mb-3 d-flex flex-row justify-content-between">
											<Button
												variant="outline-primary"
												onClick={() => {
													history.goBack();
												}}
											>
												back
											</Button>
											<Button variant="primary" type="submit">
												next
											</Button>
										</div>
									</Form>
								);
							}}
						</Formik>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default SignUp;
