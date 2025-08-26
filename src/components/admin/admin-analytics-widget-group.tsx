import {
	AdminAnalyticsWidget,
	isChartWidget,
	isCounterWidget,
	isLineChartWidget,
	isTableWidget,
} from '@/lib/services/admin-analytics-service';

import React from 'react';
import { Col, Row, RowProps } from 'react-bootstrap';
import { Chart } from '../chart';
import { AnalyticsWidgetCard, AnalyticsWidgetTableCard } from './admin-analytics-widget-card';

interface AdminAnalyticsWidgetGroupProps extends RowProps {
	widgets: AdminAnalyticsWidget[];
}

export const AdminAnalyticsWidgetGroup = ({ widgets, ...rowProps }: AdminAnalyticsWidgetGroupProps) => {
	return (
		<Row {...rowProps}>
			{widgets.map((widget, idx) => {
				if (isCounterWidget(widget)) {
					return (
						<Col key={idx} xs={12} sm={6}>
							<AnalyticsWidgetCard widget={widget} />
						</Col>
					);
				} else if (isChartWidget(widget)) {
					return (
						<Col key={idx} xs={12} sm={6} md={4}>
							<AnalyticsWidgetCard
								widget={widget}
								chart={
									widget.widgetTypeId === 'PIE_CHART' ? (
										<Chart.Pie label={widget.widgetChartLabel} data={widget.widgetData} />
									) : widget.widgetTypeId === 'BAR_CHART' ? (
										<Chart.Bar label={widget.widgetChartLabel} data={widget.widgetData} />
									) : null
								}
							/>
						</Col>
					);
				} else if (isTableWidget(widget)) {
					return (
						<Col key={idx}>
							<AnalyticsWidgetTableCard widget={widget} />
						</Col>
					);
				} else if (isLineChartWidget(widget)) {
					return (
						<Col key={idx}>
							<AnalyticsWidgetCard
								widget={widget}
								chart={
									<Chart.Line
										label={widget.widgetChartLabel}
										data={widget.widgetData}
										options={
											widget.widgetTypeId === 'LINE_CHART'
												? {
														scales: {
															x: {
																type: 'time',
																time: {
																	unit: 'month',
																},
															},
														},
												  }
												: undefined
										}
									/>
								}
							/>
						</Col>
					);
				}

				throw new Error(`Unknown widget type: ${widget['widgetTypeId']}`);
			})}
		</Row>
	);
};
