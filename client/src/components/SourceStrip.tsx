import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Chip,
  IconButton,
  InputBase,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

type SourceStripProps = {
  label: string;
  value: string;
  saving: boolean;
  onSave: (next: string) => Promise<void> | void;
  onRefresh?: () => void;
  status?: string;
};

export const SourceStrip = ({
  label,
  value,
  saving,
  onSave,
  onRefresh,
  status,
}: SourceStripProps): JSX.Element => {
  const theme = useTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [editing, value]);

  const handleSave = async (): Promise<void> => {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === value) {
      setEditing(false);
      return;
    }
    await onSave(trimmed);
    setEditing(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1,
        borderRadius: 1.5,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Chip
        label={label}
        size="small"
        sx={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
          letterSpacing: "0.12em",
          bgcolor: alpha(theme.palette.primary.main, 0.18),
          color: "primary.main",
          height: 20,
        }}
      />
      {editing ? (
        <>
          <InputBase
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://…"
            autoFocus
            sx={{
              flex: 1,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              px: 1,
              py: 0.5,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              bgcolor: "background.paper",
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleSave();
              if (event.key === "Escape") setEditing(false);
            }}
          />
          <Tooltip title="Save">
            <span>
              <IconButton size="small" onClick={() => void handleSave()} disabled={saving} color="primary">
                <CheckIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Cancel">
            <IconButton size="small" onClick={() => setEditing(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <>
          <Typography
            sx={{
              flex: 1,
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              color: "text.primary",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {value}
          </Typography>
          {status ? (
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ alignItems: "center", color: "text.secondary" }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  boxShadow: (t) => `0 0 6px ${t.palette.success.main}`,
                }}
              />
              <Typography
                variant="caption"
                sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}
              >
                {status}
              </Typography>
            </Stack>
          ) : null}
          <Tooltip title="Edit endpoint">
            <IconButton size="small" onClick={() => setEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {onRefresh ? (
            <Tooltip title="Refresh sample">
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </>
      )}
    </Box>
  );
};
