type InfoGridProps = {
  items: Array<{
    label: string;
    value: string | number;
  }>;
};

export const InfoGrid = ({ items }: InfoGridProps): JSX.Element => (
  <dl className="info-grid">
    {items.map((item) => (
      <div key={item.label}>
        <dt>{item.label}</dt>
        <dd>{item.value}</dd>
      </div>
    ))}
  </dl>
);
