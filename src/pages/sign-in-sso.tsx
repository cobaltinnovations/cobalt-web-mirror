import React, { FC, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

import useSubdomain from '@/hooks/use-subdomain';

import AsyncPage from '@/components/async-page';
import Select from '@/components/select';

import config from '@/lib/config';
import { institutionService } from '@/lib/services';

import { AccountSource } from '@/lib/models/institution';
import HeroContainer from '@/components/hero-container';

const SignInSSO: FC = () => {
	const subdomain = useSubdomain();
	const history = useHistory();

	const [ssoOptions, setSsoOptions] = useState<AccountSource[]>([]);
	const [ssoSelectValue, setSsoSelectValue] = useState<string>('');

	const fetchData = useCallback(async () => {
		const { accountSources } = await institutionService
			.getAccountSources({
				...(subdomain ? { subdomain } : {}),
			})
			.fetch();

		const firstAccountSource = accountSources[0];

		if (accountSources.length === 1) {
			return (window.location.href = firstAccountSource.ssoUrl);
		}

		setSsoOptions(accountSources);
		setSsoSelectValue(firstAccountSource.accountSourceId);
	}, [subdomain]);

	function handleSsoSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
		setSsoSelectValue(event.currentTarget.value);
	}

	function handleNextButtonClick() {
		const option = ssoOptions.find((o) => o.accountSourceId === ssoSelectValue);

		if (!option) {
			return;
		}

		window.location.href = option.ssoUrl;
	}

	function handleBackButtonClick() {
		if (history.length > 1) {
			history.goBack();
		} else {
			window.location.pathname = '/sign-in';
		}
	}

	return (
		<AsyncPage fetchData={fetchData}>
			<HeroContainer>
				<h2 className="mb-0 text-white text-center">welcome!</h2>
			</HeroContainer>
			<Container className="pt-5">
				<Row>
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						{config.COBALT_WEB_DISABLE_SIGN_IN === 'true' && <p className="text-center">Coming soon!</p>}
						{config.COBALT_WEB_DISABLE_SIGN_IN !== 'true' && (
							<>
								<Form.Group controlId="sign-in-form__sso-select" className="mb-3">
									<Select onChange={handleSsoSelectChange} value={ssoSelectValue}>
										{ssoOptions.map((option) => {
											return (
												<option key={option.accountSourceId} value={option.accountSourceId}>
													{option.description}
												</option>
											);
										})}
									</Select>
								</Form.Group>
								<div className="mb-3 d-flex flex-row justify-content-between">
									<Button variant="outline-primary" onClick={handleBackButtonClick}>
										back
									</Button>
									<Button variant="primary" onClick={handleNextButtonClick}>
										next
									</Button>
								</div>
							</>
						)}
					</Col>
				</Row>
			</Container>
		</AsyncPage>
	);
};

export default SignInSSO;
