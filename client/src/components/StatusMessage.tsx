import Alert from "@mui/material/Alert";

type StatusMessageProps = {
  message: string;
  tone?: "neutral" | "error";
};

export const StatusMessage = ({
  message,
  tone = "neutral",
}: StatusMessageProps): JSX.Element => (
  <Alert severity={tone === "error" ? "error" : "info"} sx={{ my: 2 }}>
    {message}
  </Alert>
);
