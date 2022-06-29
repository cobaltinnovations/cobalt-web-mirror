import React, { FC, useState, useEffect } from 'react';
import classNames from 'classnames';

import { ReactComponent as ConfidenceSearchIcon } from '@/assets/icons/confidence.svg';
import { createUseThemedStyles, useCobaltTheme } from '@/jss/theme';

const useMatchConfidenceStyles = createUseThemedStyles((theme) => ({
	barOuter: {
		height: 4,
		width: '100%',
		backgroundColor: theme.colors.gray500,
	},
	bar: ({ percent, color }: { percent: number; color: string }) => ({
		width: `${percent}%`,
		height: '100%',
		backgroundColor: color,
		transition: '0.2s width, 0.5s background-color',
	}),
}));

interface MatchConfidenceProps {
	percent: number;
	description: string;
	className?: string;
	hideIcon?: boolean;
}

const MatchConfidence: FC<MatchConfidenceProps> = ({ className, percent, description, hideIcon }) => {
	const theme = useCobaltTheme();
	const [color, setColor] = useState(theme.colors.danger);

	const classes = useMatchConfidenceStyles({
		percent,
		color,
	});

	useEffect(() => {
		if (percent > 33 && percent <= 66) {
			setColor(theme.colors.warning);
		} else if (percent > 66) {
			setColor(theme.colors.success);
		} else {
			setColor(theme.colors.danger);
		}
	}, [percent, theme.colors.danger, theme.colors.success, theme.colors.warning]);

	return (
		<>
			<div className={classNames('d-flex', className)}>
				{!hideIcon && <ConfidenceSearchIcon className="me-3" />}

				<div className="flex-grow-1">
					<h6 className="mb-2 font-body-normal">
						<span className="font-body-bold">match confidence:</span> {description}
					</h6>

					<div className={classes.barOuter}>
						<div className={classes.bar} />
					</div>
				</div>
			</div>
		</>
	);
};

export default MatchConfidence;
