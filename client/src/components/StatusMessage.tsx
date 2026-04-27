type StatusMessageProps = {
  message: string;
  tone?: "neutral" | "error";
};

export const StatusMessage = ({
  message,
  tone = "neutral",
}: StatusMessageProps): JSX.Element => (
  <div className={`status-message status-${tone}`}>{message}</div>
);
