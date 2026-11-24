interface Props {
  step: number;
  total: number;
  label: string;
}

const ProgressDots = ({ step, total, label }: Props) => (
  <div className="flex items-center justify-between gap-4">
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={label}
    >
      {Array.from({ length: total }, (_, index) => {
        const current = index + 1 === step;
        const done = index + 1 < step;
        return (
          <span
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              current ? "w-7 bg-[#282035]" : done ? "w-3 bg-[#282035]" : "w-3 bg-[#EAE2F8]"
            }`}
          />
        );
      })}
    </div>
    <p className="text-[13px] text-[#71677F]">{label}</p>
  </div>
);

export default ProgressDots;
