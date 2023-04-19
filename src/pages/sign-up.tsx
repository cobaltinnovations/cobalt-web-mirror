import * as yup from 'yup';

import React, { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Formik } from 'formik';

import InputHelper from '@/components/input-helper';

import { getRequiredYupFields } from '@/lib/utils';
import { accountService } from '@/lib/services';
import useHandleError from '@/hooks/use-handle-error';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { useAppRootLoaderData } from '@/routes/root';

const useSignUpStyles = createUseThemedStyles((theme) => ({
	signUpOuter: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
	signUp: {
		paddingTop: 96,
		[mediaQueries.lg]: {
			paddingTop: 32,
		},
	},
}));

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
	const { subdomain } = useAppRootLoaderData();
	const handleError = useHandleError();
	const navigate = useNavigate();
	const classes = useSignUpStyles();

	async function handleFormSubmit(values: SignUpFormData) {
		try {
			const { accountInviteId } = await accountService
				.inviteAccount({
					subdomain,
					accountSourceId: 'EMAIL_PASSWORD',
					emailAddress: values.emailAddress,
					password: values.password,
				})
				.fetch();

			navigate('/sign-up-verify', {
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
		<Container fluid className={classes.signUpOuter}>
			<Container className={classes.signUp}>
				<Row>
					<h1 className="mb-4 text-center">Create account</h1>
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
									<Form className="mb-6" onSubmit={handleSubmit}>
										<InputHelper
											className="mb-2"
											name="emailAddress"
											type="email"
											label="Email address"
											value={values.emailAddress}
											onChange={handleChange}
											required={requiredFields.emailAddress}
											error={
												touched.emailAddress && errors.emailAddress ? errors.emailAddress : ''
											}
										/>
										<InputHelper
											className="mb-4"
											name="password"
											type="password"
											label="Create your password"
											helperText="8+ characters, including a number"
											value={values.password}
											onChange={handleChange}
											required={requiredFields.password}
											error={touched.password && errors.password ? errors.password : ''}
										/>
										<div className="text-center mb-3">
											<Button className="d-block w-100" variant="primary" type="submit">
												Create Account
											</Button>
										</div>
									</Form>
								);
							}}
						</Formik>
						<p className="text-center">
							Already have an account? <Link to="/sign-in/email">Sign In</Link>
						</p>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default SignUp;
