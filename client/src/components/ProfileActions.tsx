import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Stack } from "@mui/material";
import { Button } from "./Button";

type ProfileActionsProps = {
  canSave: boolean;
  canUpdate: boolean;
  isSavedProfile: boolean;
  isLoading: boolean;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: () => void;
};

export const ProfileActions = ({
  canSave,
  canUpdate,
  isSavedProfile,
  isLoading,
  onSave,
  onDelete,
  onUpdate,
}: ProfileActionsProps): JSX.Element => (
  <Stack direction={{ sm: "row", xs: "column" }} spacing={1.5}>
    {canSave ? (
      <Button disabled={isLoading} onClick={onSave} startIcon={<SaveIcon />}>
        Save
      </Button>
    ) : null}
    {isSavedProfile ? (
      <Button
        disabled={isLoading}
        onClick={onDelete}
        startIcon={<DeleteIcon />}
        variant="danger"
      >
        Delete
      </Button>
    ) : null}
    <Button
      disabled={isLoading || !canUpdate}
      onClick={onUpdate}
      startIcon={<EditIcon />}
      variant="secondary"
    >
      Update Profile
    </Button>
  </Stack>
);
