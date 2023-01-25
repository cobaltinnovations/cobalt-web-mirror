import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { InstitutionTeamMember } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';
import mediaQueries from '@/jss/media-queries';

const useStyles = createUseThemedStyles((theme) => ({
	team: {
		paddingTop: 72,
		paddingBottom: 32,
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
	teamMembers: {
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
	},
	teamMember: {
		width: '25%',
		display: 'flex',
		marginBottom: 48,
		flexDirection: 'column',
		alignItems: 'center',
		[mediaQueries.lg]: {
			width: '33.33%',
		},
		[mediaQueries.md]: {
			width: '50%',
		},
		[mediaQueries.sm]: {
			width: '100%',
		},
	},
	headshot: {
		width: 188,
		height: 188,
		marginBottom: 24,
		borderRadius: '50%',
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepear: 'no-repeat',
	},
}));

interface TeamProps {
	teamMembers: InstitutionTeamMember[];
}

const Team = ({ teamMembers }: TeamProps) => {
	const classes = useStyles();

	return (
		<Container fluid className={classes.team}>
			<Container>
				<Row className="mb-14">
					<Col>
						<h1 className="text-center">The Team</h1>
					</Col>
				</Row>
				<Row>
					<Col>
						<div className={classes.teamMembers}>
							{teamMembers.map((tm) => {
								return (
									<div className={classes.teamMember}>
										<div
											className={classes.headshot}
											style={{ backgroundImage: `url(${tm.imageUrl})` }}
										/>
										<h4 className="mb-2">{tm.name}</h4>
										<p className="m-0 fs-small text-center">{tm.title}</p>
									</div>
								);
							})}
						</div>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};

export default Team;
