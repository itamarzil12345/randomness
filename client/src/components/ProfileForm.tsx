import { Box, TextField } from "@mui/material";
import type { FormEvent } from "react";
import type { PersonName } from "../types/person";

type ProfileFormProps = {
  name: PersonName;
  onChange: (name: PersonName) => void;
  onSubmit: () => void;
};

export const ProfileForm = ({
  name,
  onChange,
  onSubmit,
}: ProfileFormProps): JSX.Element => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { md: "0.7fr 1fr 1fr", xs: "1fr" },
      }}
    >
        <TextField
          fullWidth
          label="Title"
          value={name.title}
          onChange={(event) => onChange({ ...name, title: event.target.value })}
        />
        <TextField
          fullWidth
          label="First name"
          value={name.first}
          onChange={(event) => onChange({ ...name, first: event.target.value })}
        />
        <TextField
          fullWidth
          label="Last name"
          value={name.last}
          onChange={(event) => onChange({ ...name, last: event.target.value })}
        />
      <button className="visually-hidden" type="submit">
        Update
      </button>
    </Box>
  );
};
