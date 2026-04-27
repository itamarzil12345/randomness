import { Box, Container, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

type PageShellProps = {
  title: string;
  children: ReactNode;
  subtitle?: string;
  fullHeight?: boolean;
};

export const PageShell = ({
  title,
  subtitle,
  children,
  fullHeight = false,
}: PageShellProps): JSX.Element => (
  <Container
    component="main"
    maxWidth="lg"
    sx={
      fullHeight
        ? {
            display: "flex",
            flexDirection: "column",
            height: "100vh",
            py: 3,
            overflow: "hidden",
          }
        : { minHeight: "100vh", py: 5 }
    }
  >
    <Box component="header" sx={{ mb: 3.5, flexShrink: 0 }}>
      <Stack spacing={1}>
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
        {subtitle ? (
          <Typography color="text.secondary" variant="body1">
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
    </Box>
    {children}
  </Container>
);
