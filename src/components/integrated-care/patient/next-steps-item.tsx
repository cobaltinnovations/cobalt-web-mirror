import React, { PropsWithChildren } from 'react';
import { Button } from 'react-bootstrap';

import { createUseThemedStyles } from '@/jss/theme';
import classNames from 'classnames';
import mediaQueries from '@/jss/media-queries';
import SvgIcon from '@/components/svg-icon';

const useStyles = createUseThemedStyles((theme) => ({
	checkOuter: {
		width: 48,
		height: 48,
		flexShrink: 0,
		display: 'flex',
		borderRadius: '50%',
		alignItems: 'center',
		justifyContent: 'center',
		color: theme.colors.n300,
		border: `2px solid ${theme.colors.n300}`,
	},
	checkOuterGreen: {
		color: theme.colors.s500,
		backgroundColor: theme.colors.s50,
		border: `2px solid ${theme.colors.s300}`,
	},
	infoOuter: {
		flex: 1,
		display: 'flex',
		paddingLeft: 16,
		[mediaQueries.lg]: {
			display: 'block',
		},
	},
}));

interface NextStepsItemProps {
	title: string;
	description: string;
	complete?: boolean;
	button?: {
		variant?: string;
		title?: string;
		onClick?(): void;
	};
}

export const NextStepsItem = ({
	title,
	description,
	complete,
	button,
	children,
}: PropsWithChildren<NextStepsItemProps>) => {
	const classes = useStyles();

	return (
		<>
			<div className="px-6 py-5">
				<div className="d-flex">
					<div
						className={classNames(classes.checkOuter, {
							[classes.checkOuterGreen]: complete,
						})}
					>
						<SvgIcon kit="fak" icon="check" size={20} />
					</div>
					<div className={classes.infoOuter}>
						<div className="mb-4 pe-0 pe-lg-4 mb-lg-0 flex-grow-1">
							<p className="mb-1 fs-large fw-semibold">{title}</p>
							<p className="mb-0 text-gray">{description}</p>
						</div>
						<div>
							{button && (
								<Button className="text-nowrap" variant={button.variant} onClick={button.onClick}>
									{button.title}
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
			{React.Children.toArray(children).length > 0 && <div className="px-6 pb-6">{children}</div>}
		</>
	);
};
