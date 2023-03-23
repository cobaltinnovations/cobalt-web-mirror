import React from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import classNames from 'classnames';

import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import { createUseThemedStyles } from '@/jss/theme';
import { ReactComponent as AssessmentIcon } from '@/assets/icons/icon-assessment.svg';
import useAccount from '@/hooks/use-account';

const useStyles = createUseThemedStyles((theme) => ({
	screeningFlowCta: {
		borderRadius: 12,
		padding: '40px 24px',
		backgroundColor: theme.colors.p50,
		border: `1px solid ${theme.colors.p500}`,
	},
}));

interface Props {
	buttonVariant?: ButtonVariant;
	className?: string;
}

const ScreeningFlowCta = ({ buttonVariant, className }: Props) => {
	const classes = useStyles();
	const { institution } = useAccount();
	const { checkAndStartScreeningFlow } = useScreeningFlow({
		screeningFlowId: institution?.contentScreeningFlowId,
		instantiateOnLoad: false,
	});

	return (
		<div className={classNames(classes.screeningFlowCta, className)}>
			<h2 className="mb-4 text-center">Get Personalized Recommendations</h2>
			<p className="mb-6 fs-large text-center">
				Complete a wellness assessment to get personalized recommendations
			</p>
			<div className="text-center">
				<Button
					size="lg"
					variant={buttonVariant ?? 'primary'}
					className="d-inline-flex align-items-center"
					onClick={checkAndStartScreeningFlow}
				>
					<AssessmentIcon className="me-2" />
					Take the Assessment
				</Button>
			</div>
		</div>
	);
};

export default ScreeningFlowCta;
