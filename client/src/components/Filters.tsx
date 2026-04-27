import { Box, Paper, TextField } from "@mui/material";

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
  <Paper aria-label="People filters" component="section" sx={{ my: 3, p: 2 }}>
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { md: "1fr 1fr", xs: "1fr" },
      }}
    >
        <TextField
          fullWidth
          label="Name"
          value={nameFilter}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Filter by name"
        />
        <TextField
          fullWidth
          label="Country"
          value={countryFilter}
          onChange={(event) => onCountryChange(event.target.value)}
          placeholder="Filter by country"
        />
    </Box>
  </Paper>
);
