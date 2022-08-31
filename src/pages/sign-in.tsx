import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { accountService } from '@/lib/services';
import useSubdomain from '@/hooks/use-subdomain';
import useHandleError from '@/hooks/use-handle-error';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';
import { ReactComponent as Logo } from '@/assets/logos/logo-small.svg';
import { ReactComponent as AppointmentIllustration } from '@/assets/illustrations/appointment.svg';

const useSignInStyles = createUseThemedStyles((theme) => ({
	signInOuter: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
	signIn: {
		paddingTop: 96,
		[mediaQueries.lg]: {
			paddingTop: 32,
		},
	},
	illustration: {
		height: 'auto',
		maxWidth: '100%',
	},
}));

const SignIn: FC = () => {
	const handleError = useHandleError();
	const { subdomainInstitution } = useAccount();
	const subdomain = useSubdomain();
	const classes = useSignInStyles();
	const navigate = useNavigate();

	const handleEnterAnonymouslyButtonClick = async () => {
		try {
			const { accessToken } = await accountService
				.createAnonymousAccount({
					...(subdomain && { subdomain }),
				})
				.fetch();

			navigate(`/auth?${new URLSearchParams({ accessToken }).toString()}`, {
				replace: true,
			});
		} catch (error) {
			handleError(error);
		}
	};

	return (
		<Container fluid className={classes.signInOuter}>
			<Container className={classes.signIn}>
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="mb-6 text-center">
							<Logo className="text-primary" />
						</div>
						<h3 className="mb-4 text-center">Connecting you to mental health resources.</h3>
						<p className="mb-8 text-center">
							Find the right level of mental healthcare, personalized for you.
						</p>

						<div className="text-center mb-3">
							<Button
								className="d-block w-100"
								variant="primary"
								onClick={() => {
									navigate('/sign-in/options');
								}}
							>
								Sign In
							</Button>
						</div>

						{subdomainInstitution?.anonymousEnabled && (
							<div className="text-center">
								<Button variant="link" onClick={handleEnterAnonymouslyButtonClick}>
									Browse All Resources Anonymously
								</Button>
							</div>
						)}
					</Col>
				</Row>
				<Row>
					<Col>
						<div className="text-center">
							<AppointmentIllustration className={classes.illustration} />
						</div>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default SignIn;
