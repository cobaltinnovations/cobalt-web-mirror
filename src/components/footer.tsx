import React, { FC, useEffect, useMemo, useRef } from 'react';
import { Link, useMatches } from 'react-router-dom';
import { Button, Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { exploreLinks } from '@/menu-links';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as CobaltLogo } from '@/assets/logos/logo-icon.svg';

import FooterContent from './footer-content';
import FooterLogo from './footer-logo';
import FooterNav from './footer-nav';

import { ReactComponent as ExternalIcon } from '@/assets/icons/icon-external.svg';
import { RouteHandle } from '@/routes';

const useFooterStyles = createUseThemedStyles((theme) => ({
	footer: {
		left: 0,
		bottom: 0,
		width: '100%',
		position: 'absolute',
		backgroundColor: theme.colors.n0,
	},
	footerBorderTop: {
		borderTop: `6px solid ${theme.colors.a300}`,
	},
	footerLogoIcon: {
		width: '19px',
		height: '18px',
		marginRight: 8,
		marginTop: -2,
		'& path': {
			fill: theme.colors.n500,
		},
	},
}));

const Footer: FC = () => {
	const classes = useFooterStyles();
	const footer = useRef<HTMLElement | null>(null);
	const { account, institution, isIntegratedCarePatient } = useAccount();
	const routeMatches = useMatches();

	const hideFooter = useMemo(() => {
		// check config for any route in the rendered hierarchy
		const routeHidesFooter = routeMatches.some((match) => {
			return (match.handle as RouteHandle)?.hideFooter;
		});
		return !account || routeHidesFooter;
	}, [account, routeMatches]);

	const routeHidesContactUs = useMemo(() => {
		// check config for any route in the rendered hierarchy
		return routeMatches.some((match) => {
			return (match.handle as RouteHandle)?.hideFooterContactUs;
		});
	}, [routeMatches]);

	useEffect(() => {
		if (hideFooter) {
			return;
		}

		function handleResize() {
			if (!footer.current) return;

			const footerHeight = footer.current.clientHeight;
			document.body.style.paddingBottom = `${footerHeight}px`;
			document.body.style.minBlockSize = `calc(100% + ${footerHeight + 1}px)`;
		}

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			document.body.style.paddingBottom = '0';
			document.body.style.minBlockSize = '100%';
		};
	}, [hideFooter]);

	if (hideFooter) {
		return null;
	}

	return (
		<>
			{institution.externalContactUsUrl && !routeHidesContactUs && (
				<Container fluid className="bg-n75">
					<Container className="py-10 py-lg-20">
						<Row>
							<Col md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
								<h2 className="mb-6 text-center">Not seeing what you need?</h2>
								<div className="text-center">
									<Button
										href={institution.externalContactUsUrl}
										variant="primary"
										target="_blank"
										rel="noopener noreferrer"
										className="d-inline-flex align-items-center text-white text-decoration-none"
									>
										Contact Us
										<ExternalIcon className="ms-2" />
									</Button>
								</div>
							</Col>
						</Row>
					</Container>
				</Container>
			)}

			<footer
				ref={footer}
				className={classNames(classes.footer, {
					[classes.footerBorderTop]: !isIntegratedCarePatient,
				})}
			>
				{!isIntegratedCarePatient && (
					<Container className="py-10 py-md-12">
						{institution?.featuresEnabled ? (
							<Row>
								<Col xs={12} lg={6}>
									<FooterLogo />
									<FooterContent />
								</Col>
								<Col xs={6} lg={2} className="mb-8">
									<p className="mb-3 fs-large fw-semibold text-primary">Support</p>
									<ul className="list-unstyled">
										{(institution?.features ?? [])
											.filter(
												(feature) =>
													feature.navigationHeaderId === 'CONNECT_WITH_SUPPORT' &&
													feature.navVisible
											)
											.map(({ featureId, name, urlName }) => (
												<li key={featureId} className="mb-3">
													<Link
														className="fw-normal text-decoration-none"
														to={
															featureId === 'THERAPY' && account?.institutionLocationId
																? `${urlName}?institutionLocationId=${account.institutionLocationId}`
																: urlName
														}
													>
														{name}
													</Link>
												</li>
											))}
									</ul>
								</Col>
								<Col xs={6} lg={2} className="mb-8">
									<p className="mb-3 fs-large fw-semibold text-primary">Resources</p>
									<ul className="list-unstyled">
										{(institution?.features ?? [])
											.filter(
												(feature) =>
													feature.navigationHeaderId === 'BROWSE_RESOURCES' &&
													feature.navVisible
											)
											.map(({ featureId, name, urlName }) => (
												<li key={featureId} className="mb-3">
													<Link className="fw-normal text-decoration-none" to={urlName}>
														{name}
													</Link>
												</li>
											))}
										{(institution?.additionalNavigationItems ?? []).map(({ name, url }, index) => (
											<li key={index} className="mb-3">
												<Link className="fw-normal text-decoration-none" to={url}>
													{name}
												</Link>
											</li>
										))}
										{exploreLinks.map(({ label, to }, index) => (
											<li key={index} className="mb-3">
												<Link className="fw-normal text-decoration-none" to={to()}>
													{label}
												</Link>
											</li>
										))}
									</ul>
								</Col>
								<Col xs={12} lg={2}>
									<p className="mb-3 fs-large fw-semibold text-primary">Cobalt</p>
									<ul className="list-unstyled">
										{institution.faqEnabled && (
											<li className="mb-3">
												<Link className="fw-normal text-decoration-none" to="/faqs">
													FAQ
												</Link>
											</li>
										)}
										<li className="mb-3">
											<Link className="fw-normal text-decoration-none" to="/feedback">
												Contact Us
											</Link>
										</li>
										<li className="mb-3">
											<Link className="fw-normal text-decoration-none" to="/privacy">
												Privacy Policy
											</Link>
										</li>
									</ul>
								</Col>
							</Row>
						) : (
							<Row>
								<Col xs={12} md={8}>
									<FooterLogo />
									<FooterContent />
								</Col>
								<Col xs={12} sm={12} md={4} lg={{ span: 3, offset: 1 }}>
									<FooterNav />
								</Col>
							</Row>
						)}
					</Container>
				)}

				{isIntegratedCarePatient && (
					<>
						<div className="border-top" />

						<Container className="py-10 py-md-12">
							<Row>
								<Col>
									<p className="text-gray mb-0">
										<CobaltLogo className={classes.footerLogoIcon} />
										Cobalt Innovations, Inc. &copy; {new Date().getFullYear()}
									</p>
								</Col>
							</Row>
						</Container>
					</>
				)}
			</footer>
		</>
	);
};

export default Footer;
