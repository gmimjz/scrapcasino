type Props = {
  title: string;
  children?: React.ReactNode;
};

export const Section = ({ title, children }: Props) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-semibold text-white">{title}</p>
      {children}
    </div>
  );
};
