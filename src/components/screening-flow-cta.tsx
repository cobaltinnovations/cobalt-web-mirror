import React from 'react';
import { Button } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import classNames from 'classnames';

import { useScreeningFlow } from '@/pages/screening/screening.hooks';
import { createUseThemedStyles } from '@/jss/theme';
import useAccount from '@/hooks/use-account';
import SvgIcon from './svg-icon';

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
	const { startScreeningFlow, renderedCollectPhoneModal, renderedPreScreeningLoader } = useScreeningFlow({
		screeningFlowId: institution?.contentScreeningFlowId,
		instantiateOnLoad: false,
	});

	if (renderedPreScreeningLoader) {
		return renderedPreScreeningLoader;
	}

	return (
		<div className={classNames(classes.screeningFlowCta, className)}>
			{renderedCollectPhoneModal}
			<h2 className="mb-4 text-center">Get Personalized Recommendations</h2>
			<p className="mb-6 fs-large text-center">
				Complete a wellness assessment to get personalized recommendations
			</p>
			<div className="text-center">
				<Button
					size="lg"
					variant={buttonVariant ?? 'primary'}
					className="d-inline-flex align-items-center"
					onClick={() => {
						startScreeningFlow();
					}}
				>
					<SvgIcon kit="far" icon="clipboard-list-check" size={16} className="me-2" />
					Take the Assessment
				</Button>
			</div>
		</div>
	);
};

export default ScreeningFlowCta;
