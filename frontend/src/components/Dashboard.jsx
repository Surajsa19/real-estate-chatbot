import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = ({ data }) => {
    if (!data) return null;

    const { chart_data, table_data } = data;

    // Safety check for chart data
    const hasChartData = chart_data && chart_data.years && chart_data.years.length > 0;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Real Estate Trends' },
        },
    };

    const chartData = hasChartData ? {
        labels: chart_data.years,
        datasets: [
            {
                label: 'Average Price',
                data: chart_data.prices,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                yAxisID: 'y',
            },
            {
                label: 'Total Sales',
                data: chart_data.sales,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                yAxisID: 'y1',
            }
        ]
    } : null;

    return (
        <div>
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title">Analysis Summary</h5>
                    <p className="card-text lead" style={{ fontSize: '1.1rem' }}>{data.summary}</p>
                </div>
            </div>

            {hasChartData && (
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <h5 className="card-title">Trends Chart</h5>
                        <div style={{ height: '300px' }}>
                            <Line options={chartOptions} data={chartData} />
                        </div>
                    </div>
                </div>
            )}

            {table_data && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="card-title mb-0">Detailed Data</h5>
                            <button className="btn btn-sm btn-success" onClick={() => {
                                if (!table_data) return;
                                const headers = table_data.headers.join(',');
                                const rows = table_data.rows.map(row => row.join(',')).join('\n');
                                const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
                                const encodedUri = encodeURI(csvContent);
                                const link = document.createElement("a");
                                link.setAttribute("href", encodedUri);
                                link.setAttribute("download", "real_estate_data.csv");
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}>Download Data</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped table-hover table-sm">
                                <thead>
                                    <tr>
                                        {table_data.headers.map((h, i) => <th key={i}>{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {table_data.rows.map((row, i) => (
                                        <tr key={i}>
                                            {row.map((cell, j) => <td key={j}>{cell}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
