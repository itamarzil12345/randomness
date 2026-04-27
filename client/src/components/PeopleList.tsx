import {
  Avatar,
  Box,
  Chip,
  List,
  ListItemAvatar,
  ListItemButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
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
    <List component={Paper} disablePadding role="list" sx={{ overflow: "hidden" }}>
      {people.map((person) => (
        <ListItemButton
          divider
          key={person.id}
          onClick={() =>
            navigate(`/profile/${person.source}/${person.id}?${PROFILE_ORIGIN_PARAM}=${origin}`)
          }
          role="listitem"
          sx={{
            alignItems: "center",
            gap: 2,
            py: 1.5,
            ...(person.source === "saved" && {
              background:
                "linear-gradient(90deg, rgba(76, 175, 80, 0.18) 0%, rgba(129, 199, 132, 0.10) 60%, rgba(255, 255, 255, 0) 100%)",
              borderLeft: "4px solid",
              borderLeftColor: "success.main",
              "&:hover": {
                background:
                  "linear-gradient(90deg, rgba(76, 175, 80, 0.28) 0%, rgba(129, 199, 132, 0.16) 60%, rgba(255, 255, 255, 0) 100%)",
              },
            }),
          }}
        >
          <ListItemAvatar>
            <Avatar alt={toFullName(person.name)} src={person.picture.thumbnail} />
          </ListItemAvatar>
          <Box
            sx={{
              alignItems: { md: "center", xs: "flex-start" },
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { md: "1.4fr 0.7fr 1fr 1fr 1.5fr", xs: "1fr" },
              width: "100%",
            }}
          >
            <Typography sx={{ fontWeight: 900 }}>{toFullName(person.name)}</Typography>
            <Chip label={person.gender} size="small" sx={{ justifySelf: "start" }} />
            <Typography>{person.location.country}</Typography>
            <Typography>{person.phone}</Typography>
            <Stack spacing={0.5}>
              <Typography sx={{ overflowWrap: "anywhere" }}>{person.email}</Typography>
              {person.source === "saved" ? (
                <Chip color="secondary" label="Saved" size="small" sx={{ width: 72 }} />
              ) : null}
            </Stack>
          </Box>
        </ListItemButton>
      ))}
    </List>
  );
};
