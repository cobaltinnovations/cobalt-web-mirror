import { createUseThemedStyles, useCobaltTheme } from '@/jss/theme';
import { AdminAnalyticsWidgetChartData } from '@/lib/services/admin-analytics-service';
import {
	ChartDataset,
	ChartTypeRegistry,
	CoreChartOptions,
	DatasetChartOptions,
	ElementChartOptions,
	LinearScaleOptions,
	LineControllerChartOptions,
	PluginChartOptions,
	ScaleChartOptions,
} from 'chart.js';
import Color from 'color';
import React, { useMemo } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Table, TableBody, TableCell, TableHead, TableRow } from './table';
import { _DeepPartialObject, DeepPartial } from 'chart.js/dist/types/utils';

interface ChartProps<T extends keyof ChartTypeRegistry> {
	label: string;
	data: AdminAnalyticsWidgetChartData[];
	options?: _DeepPartialObject<
		CoreChartOptions<T> &
			ElementChartOptions<T> &
			PluginChartOptions<T> &
			DatasetChartOptions<T> &
			ScaleChartOptions<T> &
			LineControllerChartOptions
	>;
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

const BarChart = ({ label, data }: ChartProps<'bar'>) => {
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
								<TableCell className="text-right">{bar.countDescription}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</>
	);
};

const PieChart = ({ label, data }: ChartProps<'pie'>) => {
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
						onClick: (e) => {
							e.native?.preventDefault();
						},
					},
				},
			}}
			data={chartData}
		/>
	);
};

const LineChart = ({ label, data, options }: ChartProps<'line'>) => {
	const theme = useCobaltTheme();

	const chartData = useMemo(() => {
		const labels: string[] = [];

		const dataset = data.reduce<ChartDataset<'line', number[]>>(
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

		console.log('labels', labels);
		console.log('labels', [dataset]);

		return {
			labels,
			datasets: [dataset],
		};
	}, [data, label, theme.colors.p500]);

	return <Line data={chartData} options={options} />;
};

export const Chart = {
	Bar: BarChart,
	Pie: PieChart,
	Line: LineChart,
} as const;
