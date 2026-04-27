import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children: ReactNode;
  subtitle?: string;
  fullHeight?: boolean;
  eyebrow?: string;
  actions?: ReactNode;
};

export const PageShell = ({
  title,
  subtitle,
  children,
  fullHeight = false,
  eyebrow,
  actions,
}: PageShellProps): JSX.Element => (
  <Box
    sx={
      fullHeight
        ? {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            px: 4,
            py: 3,
            overflow: "hidden",
          }
        : { px: 4, py: 4, flex: 1 }
    }
  >
    <Box component="header" sx={{ mb: 3, flexShrink: 0 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "flex-end" }, justifyContent: "space-between" }}
      >
        <Stack spacing={0.5}>
          {eyebrow ? (
            <Typography variant="overline" sx={{ color: "primary.main" }}>
              {eyebrow}
            </Typography>
          ) : null}
          <Typography component="h1" variant="h1">
            {title}
          </Typography>
          {subtitle ? (
            <Typography color="text.secondary" variant="body1" sx={{ maxWidth: 720 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Stack>
        {actions ? <Box>{actions}</Box> : null}
      </Stack>
    </Box>
    {children}
  </Box>
);
