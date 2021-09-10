import * as yup from 'yup';

import React, { FC } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import useHeaderTitle from '@/hooks/use-header-title';

import HeroContainer from '@/components/hero-container';
import InputHelper from '@/components/input-helper';

import { getRequiredYupFields } from '@/lib/utils';
import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

const passwordResetSchema = yup
	.object()
	.required()
	.shape({
		password: yup.string().required().default(''),
		confirmPassword: yup.string().required().default(''),
	});
type PasswordResetFormData = yup.InferType<typeof passwordResetSchema>;
const requiredFields = getRequiredYupFields<PasswordResetFormData>(passwordResetSchema);

const PasswordReset: FC = () => {
	useHeaderTitle(null);
	const history = useHistory();
	const { passwordResetToken } = useParams<{ passwordResetToken?: string }>();
	const handleError = useHandleError();

	async function handleFormSubmit(values: PasswordResetFormData) {
		try {
			if (!passwordResetToken) {
				throw new Error('passwordResetToken is missing.');
			}

			await accountService
				.resetPassword({
					passwordResetToken,
					password: values.password,
					confirmPassword: values.confirmPassword,
				})
				.fetch();

			window.alert('Your password has been reset.');
			history.push('/sign-in');
		} catch (error) {
			handleError(error);
		}
	}

	return (
		<>
			<HeroContainer>
				<h2 className="mb-0 text-white text-center">we'll get you back in</h2>
			</HeroContainer>
			<Container className="pt-4 pb-4">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Formik<PasswordResetFormData>
							enableReinitialize
							validationSchema={passwordResetSchema}
							initialValues={passwordResetSchema.cast(undefined)}
							onSubmit={handleFormSubmit}
						>
							{(formikBag) => {
								const { values, handleChange, handleSubmit, touched, errors } = formikBag;
								return (
									<Form onSubmit={handleSubmit}>
										<InputHelper
											className="mb-1"
											name="password"
											type="password"
											label="Create new password"
											value={values.password}
											onChange={handleChange}
											required={requiredFields.password}
											error={touched.password && errors.password ? errors.password : ''}
										/>
										<InputHelper
											className="mb-7"
											name="confirmPassword"
											type="password"
											label="Confirm new password"
											helperText="8+ characters, including a number"
											value={values.confirmPassword}
											onChange={handleChange}
											required={requiredFields.confirmPassword}
											error={touched.confirmPassword && errors.confirmPassword ? errors.confirmPassword : ''}
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

export default PasswordReset;
