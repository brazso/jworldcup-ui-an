import { LineChartDataset } from "./line-chart-dataset.model";

export interface LineChartData {
    matchDates?: Date[]; // to labels
    labels?: string[];
	datasets?: LineChartDataset[];
}
