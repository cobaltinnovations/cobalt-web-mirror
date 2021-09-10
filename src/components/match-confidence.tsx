import React, { FC, useState, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import classNames from 'classnames';

import { ReactComponent as ConfidenceSearchIcon } from '@/assets/icons/confidence.svg';
import colors from '@/jss/colors';

const useMatchConfidenceStyles = createUseStyles({
	barOuter: {
		height: 4,
		width: '100%',
		backgroundColor: colors.gray500,
	},
	bar: ({ percent, color }: { percent: number; color: string }) => ({
		width: `${percent}%`,
		height: '100%',
		backgroundColor: color,
		transition: '0.2s width, 0.5s background-color',
	}),
});

interface MatchConfidenceProps {
	percent: number;
	description: string;
	className?: string;
	hideIcon?: boolean;
}

const MatchConfidence: FC<MatchConfidenceProps> = ({ className, percent, description, hideIcon }) => {
	const [color, setColor] = useState(colors.danger);

	const classes = useMatchConfidenceStyles({
		percent,
		color,
	});

	useEffect(() => {
		if (percent > 33 && percent <= 66) {
			setColor(colors.warning);
		} else if (percent > 66) {
			setColor(colors.success);
		} else {
			setColor(colors.danger);
		}
	}, [percent]);

	return (
		<>
			<div className={classNames('d-flex', className)}>
				{!hideIcon && <ConfidenceSearchIcon className="mr-3" />}

				<div className="flex-grow-1">
					<h6 className="mb-2 font-karla-regular">
						<span className="font-karla-bold">match confidence:</span> {description}
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
