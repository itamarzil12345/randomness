import { Box, Chip, Stack, Typography, alpha, useTheme } from "@mui/material";
import type {
  EmailEnrichment,
  Enrichment,
  EnrichmentScraper,
  GeoEnrichment,
  IdentityEnrichment,
} from "../types/enrichment";

type Props = {
  enrichment: Enrichment;
};

const Stat = ({ label, value }: { label: string; value: string }): JSX.Element => (
  <Box>
    <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
      {label}
    </Typography>
    <Typography
      sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13, fontWeight: 600 }}
    >
      {value}
    </Typography>
  </Box>
);

const formatNumber = (n: number | null | undefined): string =>
  n == null ? "—" : new Intl.NumberFormat().format(n);

const GeoView = ({ payload }: { payload: GeoEnrichment }): JSX.Element => (
  <Stack spacing={2}>
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
      {payload.flagPng ? (
        <Box
          component="img"
          src={payload.flagPng}
          alt={payload.country}
          sx={{
            width: 56,
            height: 36,
            objectFit: "cover",
            borderRadius: 0.5,
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        />
      ) : null}
      <Box>
        <Typography sx={{ fontWeight: 700 }}>{payload.country}</Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {payload.region}
          {payload.subregion ? ` · ${payload.subregion}` : null}
        </Typography>
      </Box>
    </Stack>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      <Stat label="Capital" value={payload.capital ?? "—"} />
      <Stat label="Population" value={formatNumber(payload.population)} />
      <Stat label="Area km²" value={formatNumber(payload.area)} />
      <Stat
        label="Coords"
        value={payload.latlng ? payload.latlng.map((n) => n.toFixed(2)).join(", ") : "—"}
      />
    </Box>
    {payload.languages.length > 0 ? (
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
        {payload.languages.map((lang) => (
          <Chip key={lang} label={lang} size="small" variant="outlined" />
        ))}
      </Stack>
    ) : null}
    {payload.currencies.length > 0 ? (
      <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", rowGap: 0.5 }}>
        {payload.currencies.map((cur) => (
          <Chip key={cur} label={cur} size="small" />
        ))}
      </Stack>
    ) : null}
  </Stack>
);

const IdentityView = ({ payload }: { payload: IdentityEnrichment }): JSX.Element => {
  const theme = useTheme();
  const score = payload.consistencyScore;
  const scoreColor =
    score >= 75
      ? theme.palette.success.main
      : score >= 50
        ? theme.palette.warning.main
        : theme.palette.error.main;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            border: `3px solid ${scoreColor}`,
            color: scoreColor,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {score}
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>Self-claim consistency</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Confidence that the reported gender + age align with name-based statistical models.
          </Typography>
        </Box>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
        }}
      >
        <Stat label="Reported gender" value={payload.reportedGender} />
        <Stat
          label="Predicted gender"
          value={
            payload.predictedGender
              ? `${payload.predictedGender} (${Math.round((payload.genderProbability ?? 0) * 100)}%)`
              : "—"
          }
        />
        <Stat label="Reported age" value={`${payload.reportedAge}`} />
        <Stat
          label="Predicted age"
          value={
            payload.predictedAge != null
              ? `${payload.predictedAge}${
                  payload.ageDelta != null ? ` (Δ${payload.ageDelta})` : ""
                }`
              : "—"
          }
        />
      </Box>
    </Stack>
  );
};

const EmailView = ({ payload }: { payload: EmailEnrichment }): JSX.Element => {
  const theme = useTheme();
  const signalColor =
    payload.signal === "trustworthy"
      ? theme.palette.success.main
      : payload.signal === "disposable"
        ? theme.palette.error.main
        : payload.signal === "suspect"
          ? theme.palette.warning.main
          : theme.palette.text.secondary;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Chip
          label={payload.signal.toUpperCase()}
          sx={{
            bgcolor: alpha(signalColor, 0.18),
            color: signalColor,
            fontFamily: "JetBrains Mono, monospace",
            fontWeight: 700,
            letterSpacing: "0.12em",
            border: `1px solid ${alpha(signalColor, 0.4)}`,
          }}
        />
        <Typography sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 13 }}>
          {payload.email}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <Stat label="Domain" value={payload.domain || "—"} />
        <Stat label="Format" value={payload.isFormatValid ? "valid" : "invalid"} />
        <Stat
          label="Disposable"
          value={
            payload.isDisposable == null ? "unknown" : payload.isDisposable ? "yes" : "no"
          }
        />
      </Box>
      {payload.notes.length > 0 ? (
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary" }}>
            Notes
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {payload.notes.map((note, index) => (
              <Typography key={index} variant="caption" sx={{ color: "text.secondary" }}>
                · {note}
              </Typography>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
};

const renderPayload = (
  scraper: EnrichmentScraper,
  payload: unknown,
): JSX.Element => {
  if (scraper === "geo") return <GeoView payload={payload as GeoEnrichment} />;
  if (scraper === "identity") return <IdentityView payload={payload as IdentityEnrichment} />;
  if (scraper === "email") return <EmailView payload={payload as EmailEnrichment} />;
  return <Typography variant="caption">Unknown scraper.</Typography>;
};

export const EnrichmentResult = ({ enrichment }: Props): JSX.Element => (
  <Box>{renderPayload(enrichment.scraper, enrichment.payload)}</Box>
);
