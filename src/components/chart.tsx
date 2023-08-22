import { useCobaltTheme } from '@/jss/theme';
import { AdminAnalyticsWidgetChartData } from '@/lib/services/admin-analytics-service';
import { ChartDataset } from 'chart.js';
import Color from 'color';
import React, { useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Table, TableBody, TableCell, TableHead, TableRow } from './table';

interface ChartProps {
	label: string;
	data: AdminAnalyticsWidgetChartData[];
}

const BarChart = ({ label, data }: ChartProps) => {
	const theme = useCobaltTheme();

	const chartData = useMemo(() => {
		const labels: string[] = [];

		const dataset = data.reduce<ChartDataset<'bar', number[]>>(
			(acc, point, index, arr) => {
				labels.push(point.label);
				acc.data.push(point.count);

				const legendColor =
					point.color ||
					Color(theme.colors.p500)
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
		<>
			<Bar
				options={{
					plugins: {
						legend: {
							display: false,
						},
					},
				}}
				data={chartData}
			/>

			<Table className="mt-10">
				<TableHead>
					<TableRow>
						<TableCell />
						<TableCell>{label}</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((bar, rowIdx) => {
						return (
							<TableRow key={rowIdx}>
								<TableCell>{bar.label}</TableCell>
								<TableCell>{bar.count}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</>
	);
};

const PieChart = ({ label, data }: ChartProps) => {
	const theme = useCobaltTheme();

	const chartData = useMemo(() => {
		const labels: string[] = [];

		const dataset = data.reduce<ChartDataset<'pie', number[]>>(
			(acc, point, index, arr) => {
				labels.push(point.label);
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

export const Chart = {
	Bar: BarChart,
	Pie: PieChart,
} as const;
