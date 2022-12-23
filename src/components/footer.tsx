import React, { FC, useEffect, useRef } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import classNames from 'classnames';

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
		};
	}, []);

	return (
		<footer ref={footer} className={classNames(classes.footer, 'py-10 py-md-12')}>
			<Container>
				<Row>
					<Col xs={12} md={8}>
						<FooterLogo />
						<FooterContent />
					</Col>
					<Col xs={12} sm={12} md={4} lg={{ span: 3, offset: 1 }}>
						<FooterNav />
					</Col>
				</Row>
			</Container>
		</footer>
	);
};

export default Footer;
