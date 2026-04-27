import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children: ReactNode;
  subtitle?: string;
  fullHeight?: boolean;
  eyebrow?: string;
  actions?: ReactNode;
  topActions?: ReactNode;
};

export const PageShell = ({
  title,
  subtitle,
  children,
  fullHeight = false,
  eyebrow,
  actions,
  topActions,
}: PageShellProps): JSX.Element => (
  <Box
    sx={
      fullHeight
        ? {
            display: "flex",
            flexDirection: "column",
            flex: 1,
            px: { xs: 2, md: 3 },
            py: 2.5,
            overflow: "hidden",
            width: "100%",
          }
        : { px: { xs: 2, md: 3 }, py: 3, flex: 1, width: "100%" }
    }
  >
    {topActions ? (
      <Box sx={{ mb: 1.5, flexShrink: 0 }}>{topActions}</Box>
    ) : null}
    <Box component="header" sx={{ mb: 2.5, flexShrink: 0 }}>
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
