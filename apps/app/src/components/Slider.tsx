type Props = {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange?: (value: number) => void;
};

export const Slider = ({
  min,
  max,
  step,
  value,
  onChange = () => {},
}: Props) => {
  const percent = ((value - min) / (max - min)) * 100;

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="slider mb-[11px] h-1.5 min-w-0 cursor-pointer appearance-none bg-transparent"
      style={{ "--slider-percent": `${percent}%` } as React.CSSProperties}
    />
  );
};
