import { useNavigate } from "react-router-dom";
import { PROFILE_ORIGIN_PARAM } from "../constants";
import type { Person, ProfileSourceType } from "../types/person";
import { toFullName } from "../utils/person";

type PeopleListProps = {
  people: Person[];
  origin: ProfileSourceType;
};

export const PeopleList = ({ people, origin }: PeopleListProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="people-list" role="list">
      {people.map((person) => (
        <button
          className="person-row"
          key={person.id}
          onClick={() =>
            navigate(`/profile/${person.source}/${person.id}?${PROFILE_ORIGIN_PARAM}=${origin}`)
          }
          role="listitem"
        >
          <img src={person.picture.thumbnail} alt={toFullName(person.name)} />
          <span className="person-name">{toFullName(person.name)}</span>
          <span>{person.gender}</span>
          <span>{person.location.country}</span>
          <span>{person.phone}</span>
          <span className="person-email">{person.email}</span>
        </button>
      ))}
    </div>
  );
};
