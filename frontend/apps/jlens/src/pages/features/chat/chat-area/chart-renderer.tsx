import { useEffect, useState } from "react";
import DOMPurify from 'dompurify';

interface ChartData {
  type: "bar" | "line" | "pie" | "donut" | "area" | "horizontal-bar";
  title?: string;
  data: Array<{ label: string; value: number; color?: string }>;
  xLabel?: string;
  yLabel?: string;
}

export function ChartRenderer({ code }: { code: string }) {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const data: ChartData = JSON.parse(code);
      
      // Validate and sanitize chart data
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid chart data');
      }
      
      // Sanitize string fields to prevent XSS
      const sanitizedData: ChartData = {
        type: data.type,
        title: data.title ? DOMPurify.sanitize(data.title, { ALLOWED_TAGS: [] }) : undefined,
        xLabel: data.xLabel ? DOMPurify.sanitize(data.xLabel, { ALLOWED_TAGS: [] }) : undefined,
        yLabel: data.yLabel ? DOMPurify.sanitize(data.yLabel, { ALLOWED_TAGS: [] }) : undefined,
        data: data.data?.map(item => ({
          label: DOMPurify.sanitize(String(item.label || ''), { ALLOWED_TAGS: [] }),
          value: Number(item.value) || 0,
          color: item.color ? DOMPurify.sanitize(item.color, { ALLOWED_TAGS: [] }) : undefined
        })) || []
      };
      
      setChartData(sanitizedData);
      setError(null);
    } catch (e) {
      console.error("Failed to parse chart data:", e);
      setError("Invalid chart data");
      setChartData(null);
    }
  }, [code]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">Error: {error}</p>
      </div>
    );
  }

  if (!chartData) {
    return <div className="my-4" />;
  }

  switch (chartData.type) {
    case "bar":
      return <BarChart data={chartData} />;
    case "horizontal-bar":
      return <HorizontalBarChart data={chartData} />;
    case "line":
      return <LineChart data={chartData} />;
    case "pie":
      return <PieChart data={chartData} />;
    case "donut":
      return <DonutChart data={chartData} />;
    case "area":
      return <AreaChart data={chartData} />;
    default:
      return <div className="my-4" />;
  }
}

const colors = [
  "#19105B", "#8b7bc7", "#A16BDB", "#FF6196", "#3B82F6", 
  "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"
];

function renderBarChart(data: ChartData, container: HTMLElement) {
  const maxValue = Math.max(...data.data.map((d) => d.value));

  container.innerHTML = `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      ${data.title ? `<h4 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">${data.title}</h4>` : ""}
      <div class="flex items-end justify-around gap-2 h-64 border-b border-l border-gray-300 dark:border-gray-600 pb-2 pl-2">
        ${data.data
          .map(
            (item, i) => `
          <div class="flex flex-col items-center flex-1 h-full justify-end group">
            <div class="relative w-full flex items-end justify-center h-full">
              <div
                class="w-full bg-gradient-to-t from-[${item.color || colors[i % colors.length]}] to-[${item.color || colors[i % colors.length]}]/70 rounded-t-lg transition-all duration-700 ease-out hover:opacity-80 cursor-pointer relative"
                style="height: ${(item.value / maxValue) * 100}%"
              >
                <span class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  ${formatValue(item.value)}
                </span>
              </div>
            </div>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center truncate w-full" title="${item.label}">
              ${item.label}
            </span>
          </div>
        `
          )
          .join("")}
      </div>
      ${data.yLabel ? `<div class="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">${data.yLabel}</div>` : ""}
    </div>
  `;
}

function renderHorizontalBarChart(data: ChartData, container: HTMLElement) {
  const maxValue = Math.max(...data.data.map((d) => d.value));

  container.innerHTML = `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      ${data.title ? `<h4 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">${data.title}</h4>` : ""}
      <div class="space-y-3">
        ${data.data
          .map(
            (item, i) => `
          <div class="flex items-center gap-3 group">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300 w-32 truncate" title="${item.label}">
              ${item.label}
            </span>
            <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-10 relative overflow-hidden">
              <div
                class="bg-gradient-to-r from-[${item.color || colors[i % colors.length]}] to-[${item.color || colors[i % colors.length]}]/70 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-700 ease-out group-hover:opacity-90"
                style="width: ${(item.value / maxValue) * 100}%"
              >
                <span class="text-sm font-bold text-white">${formatValue(item.value)}</span>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderLineChart(data: ChartData, container: HTMLElement) {
  const maxValue = Math.max(...data.data.map((d) => d.value));
  const minValue = Math.min(...data.data.map((d) => d.value));
  const range = maxValue - minValue;
  const points = data.data.map((item, i) => {
    const x = (i / (data.data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  container.innerHTML = `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      ${data.title ? `<h4 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">${data.title}</h4>` : ""}
      <div class="relative h-64">
        <svg viewBox="0 0 100 100" class="w-full h-full" preserveAspectRatio="none">
          <polyline
            points="${points}"
            fill="none"
            stroke="url(#lineGradient)"
            stroke-width="0.5"
            class="transition-all duration-700"
          />
          ${data.data.map((item, i) => {
            const x = (i / (data.data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return `
              <circle cx="${x}" cy="${y}" r="1" fill="${colors[0]}" class="hover:r-2 transition-all cursor-pointer">
                <title>${item.label}: ${formatValue(item.value)}</title>
              </circle>
            `;
          }).join("")}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#19105B;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#8b7bc7;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="flex justify-between mt-2">
        ${data.data.map(item => `
          <span class="text-xs text-gray-600 dark:text-gray-400">${item.label}</span>
        `).join("")}
      </div>
    </div>
  `;
}

function renderPieChart(data: ChartData, container: HTMLElement) {
  const total = data.data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const slices = data.data.map((item, i) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      path: `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`,
      color: item.color || colors[i % colors.length],
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1),
    };
  });

  container.innerHTML = `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      ${data.title ? `<h4 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">${data.title}</h4>` : ""}
      <div class="flex items-center gap-6">
        <svg viewBox="0 0 100 100" class="w-48 h-48">
          ${slices.map(slice => `
            <path d="${slice.path}" fill="${slice.color}" class="hover:opacity-80 transition-opacity cursor-pointer" stroke="white" stroke-width="0.5">
              <title>${slice.label}: ${formatValue(slice.value)} (${slice.percentage}%)</title>
            </path>
          `).join("")}
        </svg>
        <div class="flex-1 space-y-2">
          ${slices.map(slice => `
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded" style="background-color: ${slice.color}"></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">${slice.label}</span>
              <span class="text-sm font-bold text-gray-900 dark:text-white ml-auto">${slice.percentage}%</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderDonutChart(data: ChartData, container: HTMLElement) {
  const total = data.data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  const slices = data.data.map((item, i) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    const outerRadius = 40;
    const innerRadius = 25;

    const x1Outer = 50 + outerRadius * Math.cos((startAngle * Math.PI) / 180);
    const y1Outer = 50 + outerRadius * Math.sin((startAngle * Math.PI) / 180);
    const x2Outer = 50 + outerRadius * Math.cos((currentAngle * Math.PI) / 180);
    const y2Outer = 50 + outerRadius * Math.sin((currentAngle * Math.PI) / 180);

    const x1Inner = 50 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
    const y1Inner = 50 + innerRadius * Math.sin((startAngle * Math.PI) / 180);
    const x2Inner = 50 + innerRadius * Math.cos((currentAngle * Math.PI) / 180);
    const y2Inner = 50 + innerRadius * Math.sin((currentAngle * Math.PI) / 180);

    const largeArc = angle > 180 ? 1 : 0;

    return {
      path: `M ${x1Outer} ${y1Outer} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer} L ${x2Inner} ${y2Inner} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner} Z`,
      color: item.color || colors[i % colors.length],
      label: item.label,
      value: item.value,
      percentage: percentage.toFixed(1),
    };
  });

  container.innerHTML = `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      ${data.title ? `<h4 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">${data.title}</h4>` : ""}
      <div class="flex items-center gap-6">
        <div class="relative">
          <svg viewBox="0 0 100 100" class="w-48 h-48">
            ${slices.map(slice => `
              <path d="${slice.path}" fill="${slice.color}" class="hover:opacity-80 transition-opacity cursor-pointer" stroke="white" stroke-width="0.5">
                <title>${slice.label}: ${formatValue(slice.value)} (${slice.percentage}%)</title>
              </path>
            `).join("")}
          </svg>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900 dark:text-white">${formatValue(total)}</div>
              <div class="text-xs text-gray-600 dark:text-gray-400">Total</div>
            </div>
          </div>
        </div>
        <div class="flex-1 space-y-2">
          ${slices.map(slice => `
            <div class="flex items-center gap-2">
              <div class="w-4 h-4 rounded-full" style="background-color: ${slice.color}"></div>
              <span class="text-sm text-gray-700 dark:text-gray-300">${slice.label}</span>
              <span class="text-sm font-bold text-gray-900 dark:text-white ml-auto">${slice.percentage}%</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderAreaChart(data: ChartData, container: HTMLElement) {
  const maxValue = Math.max(...data.data.map((d) => d.value));
  const minValue = Math.min(...data.data.map((d) => d.value));
  const range = maxValue - minValue;
  
  const points = data.data.map((item, i) => {
    const x = (i / (data.data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,100 ${points} 100,100`;

  container.innerHTML = `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg">
      ${data.title ? `<h4 class="font-bold text-lg mb-4 text-gray-900 dark:text-white">${data.title}</h4>` : ""}
      <div class="relative h-64">
        <svg viewBox="0 0 100 100" class="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#19105B;stop-opacity:0.3" />
              <stop offset="100%" style="stop-color:#8b7bc7;stop-opacity:0.05" />
            </linearGradient>
          </defs>
          <polygon points="${areaPoints}" fill="url(#areaGradient)" class="transition-all duration-700" />
          <polyline points="${points}" fill="none" stroke="#19105B" stroke-width="0.5" />
        </svg>
      </div>
      <div class="flex justify-between mt-2">
        ${data.data.map(item => `
          <span class="text-xs text-gray-600 dark:text-gray-400">${item.label}</span>
        `).join("")}
      </div>
    </div>
  `;
}

function formatValue(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}
