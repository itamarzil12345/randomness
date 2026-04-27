import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import {
  Autocomplete,
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import {
  DEFAULT_AGE_RANGE,
  defaultFilters,
  isFilterActive,
  type PeopleFiltersState,
  type SortBy,
  type SourceMode,
  type TriState,
} from "../utils/filters";

type FiltersProps = {
  filters: PeopleFiltersState;
  onChange: (next: PeopleFiltersState) => void;
  facets: { countries: string[]; cities: string[]; genders: string[] };
  resultCount: number;
  totalCount: number;
  showSourceFilter?: boolean;
};

export const Filters = ({
  filters,
  onChange,
  facets,
  resultCount,
  totalCount,
  showSourceFilter = true,
}: FiltersProps): JSX.Element => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const set = (patch: Partial<PeopleFiltersState>): void =>
    onChange({ ...filters, ...patch });

  const clearAll = (): void => onChange(defaultFilters());

  const active = isFilterActive(filters);

  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (filters.query.trim()) {
    activeChips.push({
      key: "query",
      label: `query · ${filters.query.trim()}`,
      clear: () => set({ query: "" }),
    });
  }
  for (const c of filters.countries) {
    activeChips.push({
      key: `country-${c}`,
      label: `country · ${c}`,
      clear: () => set({ countries: filters.countries.filter((v) => v !== c) }),
    });
  }
  for (const c of filters.cities) {
    activeChips.push({
      key: `city-${c}`,
      label: `city · ${c}`,
      clear: () => set({ cities: filters.cities.filter((v) => v !== c) }),
    });
  }
  for (const g of filters.genders) {
    activeChips.push({
      key: `gender-${g}`,
      label: `gender · ${g}`,
      clear: () => set({ genders: filters.genders.filter((v) => v !== g) }),
    });
  }
  if (filters.ageRange[0] !== DEFAULT_AGE_RANGE[0] || filters.ageRange[1] !== DEFAULT_AGE_RANGE[1]) {
    activeChips.push({
      key: "age",
      label: `age · ${filters.ageRange[0]}–${filters.ageRange[1]}`,
      clear: () => set({ ageRange: [...DEFAULT_AGE_RANGE] as [number, number] }),
    });
  }
  if (filters.hasPhone !== "any") {
    activeChips.push({
      key: "hasPhone",
      label: `phone · ${filters.hasPhone}`,
      clear: () => set({ hasPhone: "any" }),
    });
  }
  if (filters.source !== "all" && showSourceFilter) {
    activeChips.push({
      key: "source",
      label: `source · ${filters.source}`,
      clear: () => set({ source: "all" }),
    });
  }

  return (
    <Paper
      aria-label="People filters"
      component="section"
      sx={{
        p: 2,
        borderLeft: `3px solid ${theme.palette.primary.main}`,
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={1.5}
        sx={{ alignItems: { lg: "center" } }}
      >
        <TextField
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder="Search name, email, phone, city, country…"
          size="small"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ flex: 1 }}
        />
        <ToggleButtonGroup
          size="small"
          value={filters.genders}
          onChange={(_, value) => set({ genders: value as string[] })}
          aria-label="Gender filter"
        >
          {(facets.genders.length > 0 ? facets.genders : ["male", "female"]).map((g) => (
            <ToggleButton
              key={g}
              value={g}
              sx={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 11,
                letterSpacing: "0.06em",
                px: 1.5,
              }}
            >
              {g}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {showSourceFilter ? (
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filters.source}
            onChange={(_, value) => value && set({ source: value as SourceMode })}
            aria-label="Source filter"
          >
            <ToggleButton value="all" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, px: 1.5 }}>
              all
            </ToggleButton>
            <ToggleButton value="random" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, px: 1.5 }}>
              live
            </ToggleButton>
            <ToggleButton value="saved" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, px: 1.5 }}>
              saved
            </ToggleButton>
          </ToggleButtonGroup>
        ) : null}
        <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
          <Select
            size="small"
            value={filters.sortBy}
            onChange={(e) => set({ sortBy: e.target.value as SortBy })}
            sx={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 12,
              minWidth: 130,
            }}
          >
            <MenuItem value="name" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
              sort · name
            </MenuItem>
            <MenuItem value="age" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
              sort · age
            </MenuItem>
            <MenuItem value="country" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
              sort · country
            </MenuItem>
            <MenuItem value="recent" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
              sort · saved-first
            </MenuItem>
          </Select>
          <Tooltip title={filters.sortDir === "asc" ? "Ascending" : "Descending"}>
            <IconButton
              size="small"
              onClick={() => set({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" })}
            >
              {filters.sortDir === "asc" ? (
                <ArrowUpwardIcon fontSize="small" />
              ) : (
                <ArrowDownwardIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Stack>
        <Tooltip title={expanded ? "Hide advanced filters" : "Show advanced filters"}>
          <IconButton onClick={() => setExpanded((v) => !v)} size="small">
            <TuneIcon fontSize="small" />
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>

      <Collapse in={expanded} timeout={200}>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" },
          }}
        >
          <Autocomplete
            multiple
            size="small"
            options={facets.countries}
            value={filters.countries}
            onChange={(_, value) => set({ countries: value })}
            renderInput={(params) => (
              <TextField {...params} label="Countries" placeholder="any country" />
            )}
          />
          <Autocomplete
            multiple
            size="small"
            options={facets.cities}
            value={filters.cities}
            onChange={(_, value) => set({ cities: value })}
            renderInput={(params) => (
              <TextField {...params} label="Cities" placeholder="any city" />
            )}
          />
          <Box sx={{ px: 1 }}>
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="overline" sx={{ color: "text.secondary" }}>
                Age range
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontFamily: "JetBrains Mono, monospace", color: "text.secondary" }}
              >
                {filters.ageRange[0]} – {filters.ageRange[1]}
              </Typography>
            </Stack>
            <Slider
              size="small"
              value={filters.ageRange}
              onChange={(_, value) => set({ ageRange: value as [number, number] })}
              valueLabelDisplay="auto"
              min={DEFAULT_AGE_RANGE[0]}
              max={DEFAULT_AGE_RANGE[1]}
              step={1}
              disableSwap
            />
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
              Has phone
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filters.hasPhone}
              onChange={(_, value) => value && set({ hasPhone: value as TriState })}
            >
              <ToggleButton value="any" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, px: 1.5 }}>
                any
              </ToggleButton>
              <ToggleButton value="yes" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, px: 1.5 }}>
                with phone
              </ToggleButton>
              <ToggleButton value="no" sx={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, px: 1.5 }}>
                no phone
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Collapse>

      <Stack
        direction="row"
        sx={{
          mt: 2,
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <FilterAltIcon
          fontSize="small"
          sx={{ color: active ? "primary.main" : "text.secondary" }}
        />
        <Typography
          variant="caption"
          sx={{
            fontFamily: "JetBrains Mono, monospace",
            color: "text.secondary",
            mr: 0.5,
          }}
        >
          {resultCount} of {totalCount} match
        </Typography>
        {activeChips.map((chip) => (
          <Chip
            key={chip.key}
            label={chip.label}
            size="small"
            onDelete={chip.clear}
            sx={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 10,
              height: 22,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          />
        ))}
        {active ? (
          <Tooltip title="Clear all filters">
            <IconButton size="small" onClick={clearAll} sx={{ ml: "auto" }}>
              <ClearAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
    </Paper>
  );
};
