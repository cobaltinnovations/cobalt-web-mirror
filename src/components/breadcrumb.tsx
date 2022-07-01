import React, { FC, PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';

import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';
import { createUseThemedStyles } from '@/jss/theme';

const useBreadcrumbStyles = createUseThemedStyles((theme) => ({
	breadcrumb: {
		padding: 0,
		backgroundColor: theme.colors.n0,
	},
	breadcrumbLink: {
		...theme.fonts.bodyBold,
		...theme.fonts.uiSmall,
		textDecoration: 'none',
		marginRight: 10,
		position: 'relative',
	},
	chevron: {
		fill: theme.colors.border,
		height: 10,
		marginRight: 10,
	},
}));

type BreadCrumbModel = {
	to: LinkProps['to'];
	title: string;
};

type ColSpec = { span?: number; offset?: number };

interface BreadcrumbProps extends PropsWithChildren {
	breadcrumbs: BreadCrumbModel[];
	xs?: ColSpec;
	sm?: ColSpec;
	md?: ColSpec;
	lg?: ColSpec;
	xl?: ColSpec;
}

const Breadcrumb: FC<BreadcrumbProps> = (props) => {
	const classes = useBreadcrumbStyles();

	return (
		<Container fluid className={classes.breadcrumb}>
			<Container className="pt-2 pb-2">
				<Row>
					<Col
						md={props.md || { span: 10, offset: 1 }}
						lg={props.lg || { span: 8, offset: 2 }}
						xl={props.xl || { span: 6, offset: 3 }}
					>
						<div className="d-flex align-items-center">
							{props.breadcrumbs.map((breadcrumb, index) => {
								const isLast = index === props.breadcrumbs.length - 1;
								const key = breadcrumb.title;

								if (isLast) {
									return (
										<p key={key} className="mb-0 fs-ui-small">
											{breadcrumb.title}
										</p>
									);
								}

								return (
									<React.Fragment key={key}>
										<Link className={classes.breadcrumbLink} to={breadcrumb.to}>
											{breadcrumb.title}
										</Link>
										<RightChevron className={classes.chevron} />
									</React.Fragment>
								);
							})}
						</div>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default Breadcrumb;
