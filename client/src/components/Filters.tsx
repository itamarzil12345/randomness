type FiltersProps = {
  nameFilter: string;
  countryFilter: string;
  onNameChange: (value: string) => void;
  onCountryChange: (value: string) => void;
};

export const Filters = ({
  nameFilter,
  countryFilter,
  onNameChange,
  onCountryChange,
}: FiltersProps): JSX.Element => (
  <section className="filters" aria-label="People filters">
    <label>
      Name
      <input
        value={nameFilter}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Filter by name"
      />
    </label>
    <label>
      Country
      <input
        value={countryFilter}
        onChange={(event) => onCountryChange(event.target.value)}
        placeholder="Filter by country"
      />
    </label>
  </section>
);
