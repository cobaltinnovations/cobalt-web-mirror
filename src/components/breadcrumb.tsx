import React, { FC, PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { createUseStyles } from 'react-jss';

import colors from '@/jss/colors';

import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

const useBreadcrumbStyles = createUseStyles({
	breadcrumb: {
		padding: 0,
		backgroundColor: colors.white,
	},
	breadcrumbLink: {
		marginRight: 10,
		position: 'relative',
	},
	chevron: {
		fill: colors.border,
		marginRight: 10,
	},
});

type BreadCrumbModel = {
	to: LinkProps['to'];
	title: string;
};

type ColSpec = { span?: number; offset?: number; };

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
					<Col md={props.md || { span: 10, offset: 1 }} lg={ props.lg || { span: 8, offset: 2 }} xl={ props.xl || { span: 6, offset: 3 }}>
						<div className="d-flex align-items-center">
							{props.breadcrumbs.map((breadcrumb, index) => {
								const isLast = index === props.breadcrumbs.length - 1;
								const key = breadcrumb.title;

								if (isLast) {
									return (
										<p key={key} className="mb-0">
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
