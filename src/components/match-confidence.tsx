import React, { FC, useState, useEffect } from 'react';
import classNames from 'classnames';

import { ReactComponent as ConfidenceSearchIcon } from '@/assets/icons/confidence.svg';
import { createUseThemedStyles, useCobaltTheme } from '@/jss/theme';

const useMatchConfidenceStyles = createUseThemedStyles((theme) => ({
	barOuter: {
		height: 4,
		width: '100%',
		backgroundColor: theme.colors.n500,
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
	const [color, setColor] = useState(theme.colors.d500);

	const classes = useMatchConfidenceStyles({
		percent,
		color,
	});

	useEffect(() => {
		if (percent > 33 && percent <= 66) {
			setColor(theme.colors.w500);
		} else if (percent > 66) {
			setColor(theme.colors.s500);
		} else {
			setColor(theme.colors.d500);
		}
	}, [percent, theme.colors.d500, theme.colors.s500, theme.colors.w500]);

	return (
		<>
			<div className={classNames('d-flex', className)}>
				{!hideIcon && <ConfidenceSearchIcon className="me-3" />}

				<div className="flex-grow-1">
					<h6 className="mb-2 fw-normal">
						<span className="fw-bold">match confidence:</span> {description}
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
