import { Box, Paper, Typography } from "@mui/material";

type InfoGridProps = {
  items: Array<{
    label: string;
    value: string | number;
  }>;
};

export const InfoGrid = ({ items }: InfoGridProps): JSX.Element => (
  <Box
    component="dl"
    sx={{
      display: "grid",
      gap: 2,
      gridTemplateColumns: { md: "repeat(3, 1fr)", sm: "repeat(2, 1fr)", xs: "1fr" },
      m: 0,
    }}
  >
    {items.map((item) => (
      <Box key={item.label}>
        <Paper sx={{ height: "100%", p: 2 }}>
          <Typography
            color="text.secondary"
            component="dt"
            sx={{ fontWeight: 800 }}
            variant="caption"
          >
            {item.label}
          </Typography>
          <Typography component="dd" sx={{ m: 0, mt: 0.5 }} variant="body1">
            {item.value}
          </Typography>
        </Paper>
      </Box>
    ))}
  </Box>
);
