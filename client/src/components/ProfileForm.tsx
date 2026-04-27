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
    <form className="profile-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          value={name.title}
          onChange={(event) => onChange({ ...name, title: event.target.value })}
        />
      </label>
      <label>
        First name
        <input
          value={name.first}
          onChange={(event) => onChange({ ...name, first: event.target.value })}
        />
      </label>
      <label>
        Last name
        <input
          value={name.last}
          onChange={(event) => onChange({ ...name, last: event.target.value })}
        />
      </label>
      <button className="visually-hidden" type="submit">
        Update
      </button>
    </form>
  );
};
