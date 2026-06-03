interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: boolean;
}

export function Sparkline({ data, width = 80, height = 28, color = '#6366F1', fill = true }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  const polyline = pts.join(' ');
  const lastPt = pts[pts.length - 1];
  const [lx, ly] = lastPt.split(',').map(Number);

  const area = `M0,${height} L${polyline.replace(/,/g, ' L').split(' L').map(p => p).join(' L')} L${width},${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && (
        <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      )}
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* last point dot */}
      <circle cx={lx} cy={ly} r="2.5" fill={color} />
    </svg>
  );
}
