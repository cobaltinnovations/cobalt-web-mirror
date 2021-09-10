import * as yup from 'yup';
import React, { FC } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { Formik } from 'formik';

import useHeaderTitle from '@/hooks/use-header-title';

import HeroContainer from '@/components/hero-container';
import InputHelper from '@/components/input-helper';

import { accountService } from '@/lib/services';
import { getRequiredYupFields } from '@/lib/utils';
import useHandleError from '@/hooks/use-handle-error';

const signInSchema = yup
	.object()
	.required()
	.shape({
		emailAddress: yup.string().required().default(''),
		password: yup.string().required().default(''),
	});
export type SignInFormData = yup.InferType<typeof signInSchema>;
const requiredFields = getRequiredYupFields<SignInFormData>(signInSchema);

const SignInEmail: FC = () => {
	useHeaderTitle(null);
	const history = useHistory();
	const handleError = useHandleError();

	async function handleSubmit(values: SignInFormData) {
		try {
			const { accessToken, destinationUrl } = await accountService
				.getAccessToken({
					emailAddress: values.emailAddress,
					password: values.password,
				})
				.fetch();

			if (destinationUrl) {
				window.location.href = destinationUrl;
				return;
			}

			history.replace({
				pathname: '/auth',
				search: '?' + new URLSearchParams({ accessToken }).toString(),
			});
		} catch (error) {
			handleError(error);
		}
	}

	function handleBackButtonClick() {
		if (history.length > 1) {
			history.goBack();
		} else {
			window.location.pathname = '/sign-in';
		}
	}

	return (
		<>
			<HeroContainer>
				<h2 className="mb-0 text-white text-center">welcome back!</h2>
			</HeroContainer>
			<Container className="pt-4 pb-4">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<Formik<SignInFormData>
							enableReinitialize
							validationSchema={signInSchema}
							initialValues={signInSchema.cast(undefined)}
							onSubmit={handleSubmit}
						>
							{(formikBag) => {
								const { values, handleChange, touched, errors, handleSubmit } = formikBag;
								return (
									<>
										<Form onSubmit={handleSubmit}>
											<InputHelper
												className="mb-1"
												label="Your email"
												type="email"
												name="emailAddress"
												value={values.emailAddress}
												onChange={handleChange}
												required={requiredFields.emailAddress}
												error={touched.emailAddress && errors.emailAddress ? errors.emailAddress : ''}
											/>
											<InputHelper
												className="mb-1"
												label="Your password"
												type="password"
												name="password"
												value={values.password}
												onChange={handleChange}
												required={requiredFields.password}
												error={touched.password && errors.password ? errors.password : ''}
											/>
											<Link to="/forgot-password" className="d-block mb-7">
												recover my password
											</Link>
											<div className="mb-3 d-flex flex-row justify-content-between">
												<Button variant="outline-primary" onClick={handleBackButtonClick}>
													back
												</Button>
												<Button variant="primary" type="submit">
													next
												</Button>
											</div>
										</Form>
									</>
								);
							}}
						</Formik>
					</Col>
				</Row>
			</Container>
		</>
	);
};

export default SignInEmail;
