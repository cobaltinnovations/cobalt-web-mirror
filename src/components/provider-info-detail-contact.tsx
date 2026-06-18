import React from 'react';
import classNames from 'classnames';

import SvgIcon from './svg-icon';
import { Clinic, Provider } from '@/lib/models';
import { createUseThemedStyles } from '@/jss/theme';

interface useStylesProps {
	showCardStyle?: boolean;
}

const useStyles = createUseThemedStyles((theme) => ({
	providerInfoDetailContact: {
		borderRadius: ({ showCardStyle }: useStylesProps) => (showCardStyle ? 8 : 0),
		padding: ({ showCardStyle }: useStylesProps) => (showCardStyle ? '32px 24px' : 0),
		boxShadow: ({ showCardStyle }: useStylesProps) => (showCardStyle ? theme.elevation.e200 : 'none'),
		backgroundColor: ({ showCardStyle }: useStylesProps) => (showCardStyle ? theme.colors.n0 : 'transparent'),
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

interface ProviderInfoDetailContactProps {
	provider?: Provider;
	clinic?: Clinic;
	showCardStyle?: boolean;
	className?: string;
}

const ProviderInfoDetailContact = ({
	provider,
	clinic,
	showCardStyle = true,
	className,
}: ProviderInfoDetailContactProps) => {
	const classes = useStyles({ showCardStyle });

	if (!provider && !clinic) {
		return null;
	}

	return (
		<div className={classNames(classes.providerInfoDetailContact, className)}>
			<h5 className="mb-0">Contact</h5>

			{provider?.phoneNumber && (
				<div className={classNames('pt-6 d-flex align-items-center')}>
					<div className="me-4 p-3 bg-p50 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0">
						<SvgIcon kit="far" icon="phone" size={16} className="text-primary" />
					</div>
					<a
						className="d-block mb-0 fw-bold text-dark text-decoration-none"
						href={`tel:${provider?.phoneNumber}`}
					>
						{provider?.phoneNumber}
					</a>
				</div>
			)}

			{clinic?.phoneNumber && (
				<div className={classNames('pt-6 d-flex align-items-center')}>
					<div className="me-4 p-3 bg-p50 rounded-circle d-inline-flex align-items-center justify-content-center flex-shrink-0">
						<SvgIcon kit="far" icon="phone" size={16} className="text-primary" />
					</div>
					<a
						className="d-block mb-0 fw-bold text-dark text-decoration-none"
						href={`tel:${clinic?.phoneNumber}`}
					>
						{clinic?.phoneNumber}
					</a>
				</div>
			)}
		</div>
	);
};

export default ProviderInfoDetailContact;
