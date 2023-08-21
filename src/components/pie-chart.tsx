import { useCobaltTheme } from '@/jss/theme';
import { ChartDataset } from 'chart.js';
import Color from 'color';
import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';

interface PieChartProps {
	label: string;
	data: {
		legend: string;
		count: number;
	}[];
}

export const PieChart = ({ label, data }: PieChartProps) => {
	const theme = useCobaltTheme();

	const chartData = useMemo(() => {
		const labels: string[] = [];

		const dataset = data.reduce<ChartDataset<'pie', number[]>>(
			(acc, point, index, arr) => {
				labels.push(point.legend);
				acc.data.push(point.count);

				const legendColor = Color(theme.colors.p500)
					.lighten(index * (1 / arr.length))
					.hex();

				Array.isArray(acc.backgroundColor) && acc.backgroundColor.push(legendColor);
				return acc;
			},
			{
				label,
				data: [],
				backgroundColor: [],
			}
		);

		return {
			labels,
			datasets: [dataset],
		};
	}, [data, label, theme.colors.p500]);

	return (
		<Pie
			options={{
				plugins: {
					legend: {
						position: 'right',
					},
				},
			}}
			data={chartData}
		/>
	);
};
