import {
  Chart as ChartJS,
  ChartData,
  ChartDataset,
  ChartOptions,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
} from 'chart.js';
import StreamingPlugin from '@robloche/chartjs-plugin-streaming';
import 'chartjs-adapter-moment';
import { useState } from 'react';
import { deepmerge, deepmergeCustom } from 'deepmerge-ts';
import { hexToRgba } from '@/lib/color';

ChartJS.register(LineElement, PointElement, Filler, LinearScale, StreamingPlugin);

const defaultOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      type: 'realtime',
      realtime: {
        duration: 20000,
        delay: 2000,
      },
      ticks: {
        display: false,
      },
      grid: { display: false },
    },
    y: {
      type: 'linear',
      min: 0,
      grid: { display: true, color: '#424242' },
      ticks: { color: '#f3f4f6', count: 3, font: { size: 11, weight: 'lighter' } },
      border: { color: '#424242' },
    },
  },
  elements: {
    point: { radius: 0 },
    line: { tension: 0.4 },
  },
  layout: { padding: 0 },
};

function getOptions(opts?: Partial<ChartOptions<'line'>>): ChartOptions<'line'> {
  return deepmerge(defaultOptions, opts ?? {});
}

type ChartDatasetCallback = (value: ChartDataset<'line'>, index: number) => ChartDataset<'line'>;

function getEmptyData(label: string, sets = 1, callback?: ChartDatasetCallback): ChartData<'line'> {
  const next = callback || ((v) => v);

  return {
    datasets: Array(sets)
      .fill(0)
      .map((_, index) =>
        next(
          {
            fill: true,
            label,
            data: [],
            borderColor: '#22d3ee',
            backgroundColor: hexToRgba('#0e7490', 0.5),
          },
          index,
        ),
      ),
  };
}

const merge = deepmergeCustom({ mergeArrays: false });

interface UseChartOptions {
  sets: number;
  options?: Partial<ChartOptions<'line'>> | number;
  callback?: ChartDatasetCallback;
}

function useChart(label: string, opts?: UseChartOptions) {
  const options =
    typeof opts?.options === 'number'
      ? getOptions({ scales: { y: { min: 0, suggestedMax: opts.options } } })
      : getOptions(opts?.options);

  const [data, setData] = useState(getEmptyData(label, opts?.sets || 1, opts?.callback));

  const push = (items: number | (number | null)[]) => {
    const time = Date.now();
    setData((state) =>
      merge(state, {
        datasets: (Array.isArray(items) ? items : [items]).map((item, index) => ({
          ...state.datasets[index],
          data: state.datasets[index]?.data?.concat({
            x: time,
            y: typeof item === 'number' ? Number(item.toFixed(2)) : item,
          }),
        })),
      }),
    );
  };

  const clear = () =>
    setData((state) =>
      merge(state, {
        datasets: state.datasets.map((value) => ({
          ...value,
          data: [],
        })),
      }),
    );

  return { props: { data, options }, push, clear };
}

function useChartTickLabel(label: string, max: number, tickLabel: string, roundTo?: number) {
  return useChart(label, {
    sets: 1,
    options: getOptions({
      scales: {
        y: {
          suggestedMax: max,
          ticks: {
            callback(value) {
              return `${roundTo ? Number(value).toFixed(roundTo) : value}${tickLabel}`;
            },
          },
        },
      },
    }),
  });
}

export { useChart, useChartTickLabel, getOptions, getEmptyData };
