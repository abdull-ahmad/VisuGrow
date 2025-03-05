import { TimeScale } from "../../types/Chart";

const scaleFormatMap: Record<TimeScale, string> = {
  year: 'YYYY',
  month: 'MMM YYYY',
  week: 'Wo [week] YYYY',
  day: 'DD MMM YYYY'
};

export const TimeScaleControls = ({ scale, setScale }: { scale: TimeScale; setScale: (s: TimeScale) => void }) => (
  <div className="flex gap-2 mb-4 z-50">
    {Object.keys(scaleFormatMap).map((key) => (
      <button
        key={key}
        onClick={() => setScale(key as TimeScale)}
        className={`px-3 py-1 rounded ${
          scale === key ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        {key}
      </button>
    ))}
  </div>
);