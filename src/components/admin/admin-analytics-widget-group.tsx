import {
	AdminAnalyticsWidget,
	isChartWidget,
	isCounterWidget,
	isLineChartWidget,
	isTableWidget,
} from '@/lib/services/admin-analytics-service';

import React from 'react';
import { Col, ColProps, Row, RowProps } from 'react-bootstrap';
import { Chart } from '../chart';
import { AnalyticsWidgetCard, AnalyticsWidgetTableCard } from './admin-analytics-widget-card';

interface AdminAnalyticsWidgetGroupProps extends RowProps {
	widgets: AdminAnalyticsWidget[];
	colConfig?: ColProps;
	showOptions?: boolean;
}

export const AdminAnalyticsWidgetGroup = ({
	widgets,
	colConfig,
	showOptions = true,
	...rowProps
}: AdminAnalyticsWidgetGroupProps) => {
	return (
		<Row {...rowProps}>
			{widgets.map((widget, idx) => {
				if (isCounterWidget(widget)) {
					return (
						<Col key={idx} {...(colConfig ? colConfig : { xs: 12, sm: 6 })}>
							<AnalyticsWidgetCard widget={widget} showOptions={showOptions} />
						</Col>
					);
				} else if (isChartWidget(widget)) {
					return (
						<Col key={idx} {...colConfig} {...(colConfig ? colConfig : { xs: 12, md: 4, sm: 6 })}>
							<AnalyticsWidgetCard
								widget={widget}
								chart={
									widget.widgetTypeId === 'PIE_CHART' ? (
										<Chart.Pie label={widget.widgetChartLabel} data={widget.widgetData} />
									) : widget.widgetTypeId === 'BAR_CHART' ? (
										<Chart.Bar label={widget.widgetChartLabel} data={widget.widgetData} />
									) : null
								}
								showOptions={showOptions}
							/>
						</Col>
					);
				} else if (isTableWidget(widget)) {
					return (
						<Col key={idx} {...colConfig}>
							<AnalyticsWidgetTableCard widget={widget} showOptions={showOptions} />
						</Col>
					);
				} else if (isLineChartWidget(widget)) {
					return (
						<Col key={idx} {...colConfig}>
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
																	unit:
																		widget.widgetData.length > 31 ? 'month' : 'day',
																},
															},
														},
												  }
												: undefined
										}
									/>
								}
								showOptions={showOptions}
							/>
						</Col>
					);
				}

				throw new Error(`Unknown widget type: ${widget['widgetTypeId']}`);
			})}
		</Row>
	);
};
