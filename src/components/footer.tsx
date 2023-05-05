import React, { FC, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

import { exploreLinks } from '@/menu-links';
import useAccount from '@/hooks/use-account';
import { createUseThemedStyles } from '@/jss/theme';

import FooterContent from './footer-content';
import FooterLogo from './footer-logo';
import FooterNav from './footer-nav';

const useFooterStyles = createUseThemedStyles((theme) => ({
	footer: {
		left: 0,
		bottom: 0,
		width: '100%',
		position: 'absolute',
		borderTop: `6px solid ${theme.colors.a300}`,
		backgroundColor: theme.colors.n0,
	},
}));

const Footer: FC = () => {
	const classes = useFooterStyles();
	const footer = useRef<HTMLElement | null>(null);
	const { account, institution } = useAccount();

	useEffect(() => {
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
	}, []);

	return (
		<footer ref={footer} className={classNames(classes.footer, 'py-10 py-md-12')}>
			<Container>
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
									.filter((feature) => feature.navigationHeaderId === 'CONNECT_WITH_SUPPORT')
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
									.filter((feature) => feature.navigationHeaderId === 'BROWSE_RESOURCES')
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
		</footer>
	);
};

export default Footer;
