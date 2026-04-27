import { useNavigate } from "react-router-dom";
import type { ProfileSourceType, Person } from "../types/person";
import { toFullName } from "../utils/person";

type PeopleListProps = {
  people: Person[];
  source: ProfileSourceType;
};

export const PeopleList = ({ people, source }: PeopleListProps): JSX.Element => {
  const navigate = useNavigate();

  return (
    <div className="people-list" role="list">
      {people.map((person) => (
        <button
          className="person-row"
          key={person.id}
          onClick={() => navigate(`/profile/${source}/${person.id}`)}
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
