import { createUseThemedStyles, useCobaltTheme } from '@/jss/theme';
import { AdminAnalyticsWidgetChartData } from '@/lib/services/admin-analytics-service';
import { ChartDataset, LinearScaleOptions } from 'chart.js';
import Color from 'color';
import React, { useMemo } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Table, TableBody, TableCell, TableHead, TableRow } from './table';
import { DeepPartial } from 'chart.js/dist/types/utils';

interface ChartProps {
	label: string;
	data: AdminAnalyticsWidgetChartData[];
}

const useChartStyles = createUseThemedStyles((theme) => ({
	labelCell: {
		borderRight: `1px solid ${theme.colors.n100}`,
	},
}));

const defaultScaleOptions: DeepPartial<LinearScaleOptions> = {
	border: {
		dash: [4, 4],
	},
	grid: {
		color: '#bdbdbd',
		lineWidth: 1,
		tickWidth: 0,
	},
};

const BarChart = ({ label, data }: ChartProps) => {
	const theme = useCobaltTheme();
	const classes = useChartStyles();

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
				barPercentage: 0.25,
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
					scales: {
						x: defaultScaleOptions,
						y: defaultScaleOptions,
					},
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
						<TableCell header />
						<TableCell header className="text-right">
							{label}
						</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((bar, rowIdx) => {
						return (
							<TableRow key={rowIdx}>
								<TableCell header className={classes.labelCell}>
									{bar.label}
								</TableCell>
								<TableCell className="text-right">{bar.count}</TableCell>
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
