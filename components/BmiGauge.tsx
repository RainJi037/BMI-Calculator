import React from 'react';
import { BMI_CATEGORIES } from '../types';

interface BmiGaugeProps {
  bmi: number;
}

const BmiGauge: React.FC<BmiGaugeProps> = ({ bmi }) => {
  // Clamp BMI for visual representation (10 to 40)
  const MIN_BMI = 10;
  const MAX_BMI = 40;
  const clampedBmi = Math.min(Math.max(bmi, MIN_BMI), MAX_BMI);

  // SVG Configuration
  const width = 200;
  const height = 110;
  const centerX = width / 2;
  const centerY = 100;
  const radius = 80;
  const strokeWidth = 20;

  // Helper to calculate coordinates
  const polarToCartesian = (cx: number, cy: number, r: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 180) * Math.PI / 180.0;
    return {
      x: cx + (r * Math.cos(angleInRadians)),
      y: cy + (r * Math.sin(angleInRadians))
    };
  };

  // Helper to create SVG arc path
  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  // Define segments based on BMI values mapped to 180 degrees
  // 10 -> 180deg (Left), 40 -> 0deg (Right)
  // Scale: 30 BMI units = 180 degrees => 1 BMI unit = 6 degrees.
  const bmiToAngle = (val: number) => {
    const offset = val - MIN_BMI;
    return 180 - (offset * 6);
  };

  const segments = [
    { color: '#3b82f6', start: bmiToAngle(10), end: bmiToAngle(18.5) }, // Underweight
    { color: '#10b981', start: bmiToAngle(18.5), end: bmiToAngle(25) }, // Normal
    { color: '#f59e0b', start: bmiToAngle(25), end: bmiToAngle(30) },   // Overweight
    { color: '#ef4444', start: bmiToAngle(30), end: bmiToAngle(40) }    // Obese
  ];

  // Needle calculation
  const needleAngle = bmiToAngle(clampedBmi);
  // Convert gauge angle (0-180 counter-clockwise from right) to CSS rotation (0 is right)
  // Actually simpler: just use transform rotate with center pivot
  // My angle system: 180 is left, 90 up, 0 right.
  // CSS rotation: 0 is default. If needle points right by default.
  // Let's assume needle points UP by default (0deg).
  // Then Left is -90, Right is 90.
  // My gauge 180 (Left) -> should be -90 deg.
  // My gauge 0 (Right) -> should be 90 deg.
  // Formula: Rotation = (180 - Angle) - 90 = 90 - Angle.
  // Check: Angle 180 -> 90 - 180 = -90. Correct.
  // Check: Angle 90 -> 90 - 90 = 0. Correct.
  // Check: Angle 0 -> 90 - 0 = 90. Correct.
  const needleRotation = 90 - needleAngle;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Gauge Segments */}
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(centerX, centerY, radius, seg.end, seg.start)}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
          />
        ))}
        
        {/* Needle */}
        <g 
            transform={`translate(${centerX}, ${centerY}) rotate(${needleRotation})`} 
            className="transition-transform duration-700 ease-out"
        >
          {/* Needle Base */}
          <circle cx="0" cy="0" r="6" fill="#1f2937" />
          {/* Needle Body - Points Up initially if rotation is 0 */}
          {/* Since we calculated rotation assuming Up is 0, we draw pointing Up (-Y) */}
          <path d="M -2 0 L 0 -75 L 2 0 Z" fill="#1f2937" />
        </g>

        {/* Labels (Optional, simple start/end) */}
        <text x="20" y="105" textAnchor="middle" fontSize="10" fill="#9ca3af">10</text>
        <text x="180" y="105" textAnchor="middle" fontSize="10" fill="#9ca3af">40+</text>
      </svg>
      <div className="text-sm font-medium text-gray-400 mt-1">BMI Score</div>
    </div>
  );
};

export default BmiGauge;