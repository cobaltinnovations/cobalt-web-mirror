import React, { FC, useCallback, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import Color from 'color';

import { Chart as ChartModel } from '@/lib/models';

import fonts from '@/jss/fonts';
import { useCobaltTheme } from '@/jss/theme';

interface Dataset {
	id: string;
	label: string;
	data: number[];
	backgroundColor?: string;
	borderColor?: string;
	pointBackgroundColor?: string;
}

interface Props {
	configuration: ChartModel;
}

enum CHART_TYPE_ID {
	BAR = 'BAR',
	LINE = 'LINE',
}

interface Dataset {
	id: string;
	label: string;
	data: number[];
	backgroundColor?: string;
	borderColor?: string;
	pointBackgroundColor?: string;
}

export const Chart: FC<Props> = ({ configuration }) => {
	const { colors } = useCobaltTheme();
	const [labels, setLabels] = useState<string[]>([]);
	const [datasets, setDatasets] = useState<Dataset[]>([]);

	useEffect(() => {
		const formattedDatasets: Dataset[] = [];
		const formattedLabels = configuration.elements.flatMap((element) => element.description);

		configuration.elements.forEach((element) => {
			element.metrics.forEach((metric) => {
				const existingDataset = formattedDatasets.find((fd) => fd.id === metric.metricTypeId);

				if (existingDataset) {
					existingDataset.data.push(metric.count);
				} else {
					formattedDatasets.push({
						id: metric.metricTypeId,
						label: metric.description,
						data: [metric.count],
						backgroundColor: metric.color,
						borderColor: metric.color,
						pointBackgroundColor: metric.color,
					});
				}
			});
		});

		setDatasets(formattedDatasets);
		setLabels(formattedLabels);
	}, [configuration.elements]);

	const chartOptions = {
		layout: {
			padding: {
				top: 50, // Extra on the top to make some room for the tooltip
			},
		},
		plugins: {
			legend: {
				position: 'bottom',
				labels: {
					boxWidth: 6,
					boxHeight: 6,
					color: colors.dark,
					font: {
						family: fonts.karlaRegular.fontFamily,
						weight: fonts.karlaRegular.fontWeight,
						size: 11,
						lineHeight: '14px',
					},
					padding: 15,
					usePointStyle: true,
				},
			},
			tooltip: {
				backgroundColor: colors.dark,
				bodyFontColor: colors.white,
				titleFont: {
					family: fonts.karlaRegular.fontFamily,
					weight: fonts.karlaRegular.fontWeight,
					size: 12,
				},
				bodyFont: {
					family: fonts.karlaRegular.fontFamily,
					weight: fonts.karlaRegular.fontWeight,
					size: 12,
				},
				callbacks: {
					label: (context: any) => {
						return `${context.dataset.label}: ${context.formattedValue}`;
					},
				},
				caretPadding: 8,
				caretSize: 6,
				displayColors: false,
				yAlign: 'bottom',
				xAlign: 'center',
				padding: {
					x: 15,
					y: 8,
				},
				cornerRadius: 0,
			},
		},
		elements: {
			point: {
				radius: 0,
				borderWidth: 0,
				hitRadius: 15,
				hoverRadius: 5,
				hoverBorderWidth: 2,
				hoverBackgroundColor: colors.white,
			},
			line: {
				tension: 0,
				borderWidth: 2,
			},
		},
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				stacked: true,
				grid: {
					display: false,
					tickLength: 0,
					borderColor: colors.border,
				},
				ticks: {
					color: colors.dark,
					padding: 5,
					font: {
						family: fonts.karlaRegular.fontFamily,
						weight: fonts.karlaRegular.fontWeight,
						size: 11,
						lineHeight: '14px',
					},
				},
			},
			y: {
				stacked: true,
				beginAtZero: true,
				grid: {
					borderDash: [3, 2],
					color: (context: any) => {
						if (context.tick.value > 0) {
							return colors.border;
						}

						return 'transparent';
					},
					drawBorder: false,
					tickLength: 0,
				},
				ticks: {
					padding: 20,
					color: colors.dark,
					font: {
						family: fonts.karlaRegular.fontFamily,
						weight: fonts.karlaRegular.fontWeight,
						size: 11,
						lineHeight: '14px',
					},
				},
			},
		},
	};

	const chartData = useCallback(
		(canvas: HTMLCanvasElement) => {
			const ctx = canvas.getContext('2d');
			let gradient: string | CanvasGradient = 'transparent';

			return {
				labels,
				datasets: datasets.map((ds) => {
					if (ctx) {
						gradient = ctx.createLinearGradient(0, 0, 0, 250);
						gradient.addColorStop(0, Color(ds.backgroundColor).alpha(1).string());
						gradient.addColorStop(1, Color(ds.backgroundColor).alpha(0).string());
					}

					return {
						...ds,
						fill: true,
						backgroundColor:
							configuration.displayPreferenceId === CHART_TYPE_ID.LINE ? gradient : ds.backgroundColor,
					};
				}),
			};
		},
		[configuration.displayPreferenceId, datasets, labels]
	);

	return (
		<Card>
			<Card.Header>
				<Card.Title>{configuration.title}</Card.Title>
				<Card.Subtitle>{configuration.detail}</Card.Subtitle>
			</Card.Header>
			<Card.Body>
				{configuration.displayPreferenceId === CHART_TYPE_ID.LINE && (
					// @ts-ignore
					<Line height={340} data={chartData} options={chartOptions} />
				)}
				{configuration.displayPreferenceId === CHART_TYPE_ID.BAR && (
					// @ts-ignore
					<Bar height={340} data={chartData} options={chartOptions} />
				)}
			</Card.Body>
		</Card>
	);
};
