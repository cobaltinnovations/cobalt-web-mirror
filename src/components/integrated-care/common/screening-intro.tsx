import { ReactComponent as WomanAtDeskIllustration } from '@/assets/illustrations/woman-at-desk.svg';
import { createUseThemedStyles } from '@/jss/theme';
import { PatientOrderModel } from '@/lib/models';
import React from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';

const useStyles = createUseThemedStyles((theme) => ({
	gradient: {
		background: `linear-gradient(180deg, ${theme.colors.p50} 45.31%, ${theme.colors.background} 100%)`,
	},
}));

interface ScreeningIntroProps {
	isMhic?: boolean;
	patientOrder?: PatientOrderModel;
	onBegin: () => void;
}

export const ScreeningIntro = ({ isMhic = false, patientOrder, onBegin }: ScreeningIntroProps) => {
	const classes = useStyles();

	return (
		<Container fluid className={classes.gradient}>
			<Container className="py-20">
				<Row className="mb-2">
					<Col md={{ span: 10, offset: 1 }} lg={{ span: 8, offset: 2 }} xl={{ span: 6, offset: 3 }}>
						<div className="mb-10 text-center">
							<WomanAtDeskIllustration width={408} height={218} />
						</div>
						<h1 className="mb-6 text-center">
							{isMhic ? 'Begin assessment for ' : 'Welcome '}
							{patientOrder?.patientFirstName ?? 'Patient'}.
						</h1>
						{isMhic ? (
							<p className="mb-6 text-center fs-large">
								This assessment takes 15-20 minutes to complete, and asks a series of questions to
								understand the patient’s background and how they’re feeling.
							</p>
						) : (
							<>
								<p className="mb-6 text-center fs-large">
									This assessment takes 15-20 minutes to complete, and asks a series of questions to
									understand the patient’s background and how they’re feeling.
								</p>
								<p className="mb-6 text-center fs-large">
									We'll start by asking a series of questions to understand your background and how
									you're feeling.
								</p>
							</>
						)}
						<div className="text-center">
							<Button
								onClick={() => {
									onBegin();
								}}
							>
								Begin Assessment
							</Button>
						</div>
					</Col>
				</Row>
			</Container>
		</Container>
	);
};
