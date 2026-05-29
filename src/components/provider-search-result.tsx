import React from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import classNames from 'classnames';

import useRandomPlaceholderImage from '@/hooks/use-random-placeholder-image';

import SvgIcon from '@/components/svg-icon';

import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	providerResult: {
		borderRadius: 8,
		padding: '32px 24px',
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
		display: 'flex',
	},
	imageOuter: {
		width: 120,
		height: 120,
		flexShrink: 0,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat',
		[mediaQueries.md]: {
			width: 64,
			height: 64,
		},
	},
	scheduleCtaOuter: {
		padding: 16,
		borderRadius: 8,
		boxShadow: theme.elevation.e200,
		backgroundColor: theme.colors.n0,
	},
	iconOuter: {
		width: 36,
		height: 36,
		display: 'flex',
		borderRadius: 500,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: theme.colors.p100,
	},
}));

interface ProviderSearchResultProps {
	onTitleButtonClick(): void;
}

const ProviderSearchResult = ({ onTitleButtonClick }: ProviderSearchResultProps) => {
	const classes = useStyles();
	const placeholderImage = useRandomPlaceholderImage();

	return (
		<div className={classes.providerResult}>
			<Row>
				<Col xl={7}>
					<div className="d-flex mb-6 mb-xl-0">
						<div
							className={classNames(classes.imageOuter, 'me-6')}
							style={{ backgroundImage: `url(${placeholderImage})` }}
						/>
						<div>
							<h3 className="mb-2">
								<Button
									variant="link"
									className="p-0 text-decoration-none fs-h3"
									onClick={onTitleButtonClick}
								>
									Title
								</Button>
							</h3>
							<div className="mb-4 d-flex align-items-center">
								<SvgIcon kit="far" icon="phone" size={16} className="me-2" />{' '}
								<p className="mb-0">Phone</p>
							</div>
							<p className="mb-0 fs-large">
								The Employee Assistance Program (EAP) offers up to 8 sessions of free, confidential,
								solution-focused counseling per issue. An 'issue' is the reason for seeking support,
								such as relationship challenges or grief.
							</p>
						</div>
					</div>
					<hr className="mb-6 d-xl-none" />
				</Col>
				<Col xl={5}>
					<p className="mb-2 fs-large">
						<strong>Schedule Appointment</strong>
					</p>
					<p className="mb-4">
						Your first appointment is a 30 minute phone call with a clinician to assess your needs and
						discuss potential resources.
					</p>
					<div className={classNames(classes.scheduleCtaOuter, 'mb-4')}>
						<div className="d-md-flex justify-content-between">
							<div className="mb-4 mb-md-0 me-4 d-flex align-items-center">
								<div className={classNames(classes.iconOuter, 'me-4')}>
									<SvgIcon kit="far" icon="calendar" size={16} className="text-primary" />
								</div>
								<div>
									<p className="mb-0">First Available Appointment:</p>
									<p className="mb-0">
										<strong>Mon, May 4, 2:00PM</strong>
									</p>
								</div>
							</div>
							<Button variant="primary">Schedule Appointment</Button>
						</div>
					</div>
					<div className={classNames(classes.scheduleCtaOuter, 'mb-4')}>
						<Button variant="primary" className="d-block w-100">
							Schedule Appointment
						</Button>
					</div>
					<div className={classNames(classes.scheduleCtaOuter, 'mb-4')}>
						<div className="d-md-flex justify-content-between">
							<div className="mb-4 mb-md-0 me-4 d-flex align-items-center">
								<div className={classNames(classes.iconOuter, 'me-4')}>
									<SvgIcon kit="far" icon="phone" size={16} className="text-primary" />
								</div>
								<div>
									<p className="mb-0">
										<strong>Call (000) 000-0000 to schedule</strong>
									</p>
								</div>
							</div>
							<Button variant="primary">Call Clinic</Button>
						</div>
					</div>
					<Button variant="link" className="d-block w-100 text-decoration-none">
						View more appointments
					</Button>
				</Col>
			</Row>
		</div>
	);
};

export default ProviderSearchResult;
