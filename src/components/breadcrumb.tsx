import React, { FC, PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as HomeIcon } from '@/assets/icons/icon-home.svg';
import { ReactComponent as RightChevron } from '@/assets/icons/icon-chevron-right.svg';

const useBreadcrumbStyles = createUseThemedStyles((theme) => ({
	breadcrumb: {
		padding: 0,
		overflow: 'hidden',
		backgroundColor: theme.colors.n0,
	},
	breadcrumbLink: {
		marginRight: 10,
		textDecoration: 'none',
		...theme.fonts.small,
		...theme.fonts.bodyBold,
	},
	chevron: {
		flexShrink: 0,
		marginRight: 10,
		fill: theme.colors.border,
	},
	p: {
		overflow: 'hidden',
		whiteSpace: 'nowrap',
		textOverflow: 'ellipsis',
	},
	breadcrumbTitle: {
		top: 2,
		position: 'relative',
	},
}));

type BreadCrumbModel = {
	to: LinkProps['to'];
	title: string;
};

interface BreadcrumbProps extends PropsWithChildren {
	breadcrumbs: BreadCrumbModel[];
}

const Breadcrumb: FC<BreadcrumbProps> = (props) => {
	const classes = useBreadcrumbStyles();

	return (
		<Container fluid className={classes.breadcrumb}>
			<Container className="py-3">
				<Row>
					<Col>
						<div className="d-flex align-items-center">
							<p className={classNames(classes.p, 'mb-0 fs-small')}>
								{props.breadcrumbs.map((breadcrumb, index) => {
									const isLast = index === props.breadcrumbs.length - 1;

									if (isLast) {
										return (
											<span key={index} className={classes.breadcrumbTitle}>
												{breadcrumb.title}
											</span>
										);
									}

									return (
										<React.Fragment key={breadcrumb.title}>
											<Link className={classes.breadcrumbLink} to={breadcrumb.to}>
												{breadcrumb.to === '/' ? (
													<HomeIcon width={16} height={16} />
												) : (
													<span className={classes.breadcrumbTitle}>{breadcrumb.title}</span>
												)}
											</Link>
											<RightChevron className={classes.chevron} width={16} height={16} />
										</React.Fragment>
									);
								})}
							</p>
						</div>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default Breadcrumb;
