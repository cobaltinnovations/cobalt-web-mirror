import React, { ReactNode } from 'react';
import { Card } from 'react-bootstrap';

interface ChartCardProps {
	title: string;
	total: number;
	subTitle: string;
	chart: ReactNode;
}

export const ChartCard = ({ chart, title, total, subTitle }: ChartCardProps) => {
	return (
		<Card>
			<Card.Header>
				<p>{title}</p>
				<p>{total}</p>
				<p>{subTitle}</p>
			</Card.Header>

			<Card.Body>{chart}</Card.Body>
		</Card>
	);
};
