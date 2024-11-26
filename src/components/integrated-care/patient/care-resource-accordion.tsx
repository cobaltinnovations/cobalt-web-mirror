import React, { useState } from 'react';
import { Collapse } from 'react-bootstrap';
import classNames from 'classnames';

import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as DownChevron } from '@/assets/icons/icon-chevron-down.svg';

const useStyles = createUseThemedStyles((theme) => ({
	careResourceAccordion: {
		borderRadius: 8,
		overflow: 'hidden',
		border: `1px solid ${theme.colors.n100}`,
	},
	button: {
		border: 0,
		padding: 16,
		width: '100%',
		display: 'flex',
		appearance: 'none',
		alignItems: 'center',
		background: 'transparent',
		justifyContent: 'space-between',
		backgroundColor: theme.colors.n75,
	},
	informationOuter: {
		width: '50%',
		backgroundColor: theme.colors.n0,
		borderRight: `1px solid ${theme.colors.n100}`,
	},
	inlineTitle: {
		width: 64,
		...theme.fonts.small,
		display: 'inline-block',
		color: theme.colors.n500,
	},
	mapOuter: {
		width: '50%',
		backgroundColor: theme.colors.n75,
	},
}));

interface CareResourceAccordionProps {
	className?: string;
}

export const CareResourceAccordion = ({ className }: CareResourceAccordionProps) => {
	const classes = useStyles();
	const [show, setShow] = useState(true);

	return (
		<div className={classNames(classes.careResourceAccordion, className)}>
			<button
				className={classes.button}
				onClick={() => {
					setShow(!show);
				}}
			>
				Resource Name
				<DownChevron className="d-flex" style={{ transform: `scaleY(${show ? -1 : 1})` }} />
			</button>
			<Collapse in={show}>
				<div>
					<div className="px-4 pb-4 bg-n75 border-bottom">
						<p className="m-0">
							There is a mandatory $99 enrollment + $39 monthly fee for the online system including same
							day appointments, 24-hour Q&A, etc. The fee for the online system is not covered by
							insurance and needs to be payed in addition to co-pay.
						</p>
					</div>
					<div className="d-flex">
						<div className={classes.informationOuter}>
							<div className="p-4">
								<span className="mb-2 small text-gray">Address</span>
								<span className="small">100 S. Broad Street, Suite 1304</span>
								<span className="small">Philadelphia, PA 19110</span>
							</div>
							<hr />
							<div className="p-4">
								<div className="mb-2">
									<span className={classes.inlineTitle}>Phone:</span>
									<span className="d-inline small">
										<a className="text-decoration-none fw-normal" href="tel:+1 000-000-0000">
											+1 000-000-0000
										</a>
									</span>
								</div>
								<div className="mb-2">
									<span className={classes.inlineTitle}>Email:</span>
									<span className="d-inline small">
										<a className="text-decoration-none fw-normal" href="mailto:email@email.com">
											email@email.com
										</a>
									</span>
								</div>
								<div>
									<span className={classes.inlineTitle}>Website:</span>
									<span className="d-inline small">
										<a
											className="text-decoration-none fw-normal"
											href="http://www.website.com"
											target="_blank"
											rel="noreferrer"
										>
											www.website.com
										</a>
									</span>
								</div>
							</div>
							<hr />
							<div className="p-4">
								<span className="mb-2 d-block small text-gray">Location Notes</span>
								<span className="d-block small">
									Lorem ipsum dolor sit amet consectetur. Porttitor sit bibendum sem nunc pulvinar
									eget aliquam. Scelerisque pulvinar pretium tempus gravida sagittis sapien dui ipsum
									nulla. Purus viverra cras fermentum elit augue sit feugiat integer.
								</span>
							</div>
						</div>
						<div className={classes.mapOuter}>[TODO]: Google Map</div>
					</div>
				</div>
			</Collapse>
		</div>
	);
};
