import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BusinessIcon from "@mui/icons-material/Business";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import HubIcon from "@mui/icons-material/Hub";
import PersonIcon from "@mui/icons-material/Person";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  Paper,
  Slider,
  Stack,
  type Theme,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useMemo, useState, type ReactNode } from "react";
import { Button } from "../components/Button";
import { PageShell } from "../components/PageShell";
import {
  LINK_KIND_LABELS,
  linkVisuals,
  MOCK_ENTITIES,
  MOCK_LINKS,
  positionForLayout,
  type GraphEntity,
  type GraphLink,
} from "./graph/mockGraph";

type LayoutMode = "force" | "radial" | "hierarchy";

type EntityNodeData = {
  entity: GraphEntity;
  selected: boolean;
};

const riskColor = (theme: Theme, risk: number): string => {
  if (risk >= 70) return theme.palette.error.main;
  if (risk >= 45) return theme.palette.warning.main;
  return theme.palette.success.main;
};

const kindIcon = (kind: GraphEntity["kind"]): ReactNode => {
  if (kind === "organization") return <BusinessIcon sx={{ fontSize: 16 }} />;
  if (kind === "asset") return <AccountBalanceIcon sx={{ fontSize: 16 }} />;
  return <PersonIcon sx={{ fontSize: 16 }} />;
};

const EntityNode = ({ data, selected }: NodeProps<Node<EntityNodeData>>): JSX.Element => {
  const theme = useTheme();
  const entity = data.entity;
  const risk = riskColor(theme, entity.risk);

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
        borderLeft: `4px solid ${risk}`,
        borderRadius: 1.5,
        px: 1.25,
        py: 0.75,
        minWidth: 200,
        boxShadow: selected
          ? `0 0 0 3px ${alpha(theme.palette.primary.main, 0.25)}, 0 6px 16px ${alpha("#000", 0.32)}`
          : `0 4px 12px ${alpha("#000", 0.22)}`,
        transition: "all .15s",
        "&:hover": { borderColor: theme.palette.primary.main },
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {entity.avatar ? (
          <Avatar src={entity.avatar} sx={{ width: 32, height: 32 }} />
        ) : (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.18),
              color: "primary.main",
            }}
          >
            {kindIcon(entity.kind)}
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 12, lineHeight: 1.2 }} noWrap>
            {entity.name}
          </Typography>
          <Typography
            sx={{
              fontSize: 10,
              fontFamily: "JetBrains Mono, monospace",
              color: "text.secondary",
            }}
            noWrap
          >
            {entity.role ?? entity.kind} · {entity.countryCode ?? "??"}
          </Typography>
        </Box>
        <Box
          sx={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: 10,
            fontWeight: 700,
            color: risk,
            border: `1px solid ${alpha(risk, 0.5)}`,
            borderRadius: 0.5,
            px: 0.5,
          }}
        >
          {entity.risk}
        </Box>
      </Stack>
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </Box>
  );
};

const nodeTypes = { entity: EntityNode };

const InspectorRow = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: ReactNode;
  tone?: "info" | "warning" | "danger";
}): JSX.Element => {
  const theme = useTheme();
  const color =
    tone === "danger"
      ? theme.palette.error.main
      : tone === "warning"
        ? theme.palette.warning.main
        : "text.primary";
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "center" }}>
      <Typography
        variant="caption"
        sx={{ fontFamily: "JetBrains Mono, monospace", color: "text.secondary", letterSpacing: "0.05em" }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 12,
          fontWeight: 600,
          color,
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};

const Inspector = ({
  entity,
  related,
  onSelect,
}: {
  entity: GraphEntity | null;
  related: { other: GraphEntity; link: GraphLink }[];
  onSelect: (id: string) => void;
}): JSX.Element => {
  const theme = useTheme();

  if (!entity) {
    return (
      <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
        <CenterFocusStrongIcon sx={{ color: "text.secondary", fontSize: 36, mb: 1 }} />
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          No entity selected
        </Typography>
        <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 1 }}>
          Click a node on the canvas to load its dossier and observed connections.
        </Typography>
      </Paper>
    );
  }

  const risk = riskColor(theme, entity.risk);

  return (
    <Paper sx={{ p: 0, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          p: 2.25,
          background: `linear-gradient(135deg, ${alpha(risk, 0.16)}, transparent 70%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          {entity.avatar ? (
            <Avatar
              src={entity.avatar}
              sx={{
                width: 56,
                height: 56,
                border: `2px solid ${risk}`,
                boxShadow: `0 0 14px ${alpha(risk, 0.55)}`,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 1.5,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.18),
                color: "primary.main",
                border: `2px solid ${risk}`,
              }}
            >
              {kindIcon(entity.kind)}
            </Box>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="overline" sx={{ color: risk }}>
              {entity.kind.toUpperCase()}
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }} noWrap>
              {entity.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }} noWrap>
              {entity.role ?? "—"}
              {entity.org ? ` · ${entity.org}` : ""}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              border: `3px solid ${risk}`,
              fontFamily: "JetBrains Mono, monospace",
              fontWeight: 800,
              fontSize: 16,
              color: risk,
            }}
          >
            {entity.risk}
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 2.25, overflowY: "auto", flex: 1 }}>
        <Stack spacing={1.25}>
          <InspectorRow label="Status" value={entity.status} />
          <InspectorRow label="Country" value={`${entity.country ?? "—"} (${entity.countryCode ?? "??"})`} />
          <InspectorRow label="Last seen" value={entity.lastSeen} />
          {entity.aliases?.length ? (
            <InspectorRow label="Aliases" value={entity.aliases.join(", ")} />
          ) : null}
        </Stack>

        {entity.signals?.length ? (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
              Recent signals
            </Typography>
            <Stack spacing={1}>
              {entity.signals.map((sig, idx) => (
                <InspectorRow key={idx} label={sig.label} value={sig.value} tone={sig.tone} />
              ))}
            </Stack>
          </>
        ) : null}

        <Divider sx={{ my: 2 }} />
        <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
          Connections ({related.length})
        </Typography>
        <Stack spacing={0.75}>
          {related.map(({ other, link }) => {
            const lv = linkVisuals(link.kind);
            return (
              <Box
                key={link.id}
                onClick={() => onSelect(other.id)}
                sx={{
                  cursor: "pointer",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  p: 1,
                  "&:hover": { borderColor: theme.palette.primary.main },
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: lv.color,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }} noWrap>
                      {other.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                      noWrap
                    >
                      {LINK_KIND_LABELS[link.kind]}
                      {link.label ? ` · ${link.label}` : ""}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: "text.secondary",
                    }}
                  >
                    {(link.weight * 100).toFixed(0)}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};

const CanvasInner = ({
  layout,
  riskMin,
  enabledKinds,
  selectedId,
  onSelect,
}: {
  layout: LayoutMode;
  riskMin: number;
  enabledKinds: Set<GraphLink["kind"]>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}): JSX.Element => {
  const theme = useTheme();
  const { fitView } = useReactFlow();

  const visibleEntities = useMemo(
    () => MOCK_ENTITIES.filter((e) => e.risk >= riskMin),
    [riskMin],
  );
  const visibleEntityIds = useMemo(
    () => new Set(visibleEntities.map((e) => e.id)),
    [visibleEntities],
  );

  const nodes = useMemo<Node<EntityNodeData>[]>(
    () =>
      visibleEntities.map((entity, idx) => ({
        id: entity.id,
        type: "entity",
        position: positionForLayout(layout, idx, visibleEntities.length, entity),
        data: { entity, selected: selectedId === entity.id },
        selected: selectedId === entity.id,
      })),
    [layout, selectedId, visibleEntities],
  );

  const edges = useMemo<Edge[]>(
    () =>
      MOCK_LINKS.filter(
        (link) =>
          enabledKinds.has(link.kind) &&
          visibleEntityIds.has(link.source) &&
          visibleEntityIds.has(link.target),
      ).map((link) => {
        const v = linkVisuals(link.kind);
        return {
          id: link.id,
          source: link.source,
          target: link.target,
          label: link.label,
          animated: v.animated,
          style: {
            stroke: v.color,
            strokeWidth: 1 + link.weight * 2.5,
            strokeDasharray: v.dashed ? "6 6" : undefined,
            opacity: 0.85,
          },
          labelStyle: {
            fontSize: 9,
            fontFamily: "JetBrains Mono, monospace",
            fill: theme.palette.text.secondary,
          },
          labelBgStyle: {
            fill: theme.palette.background.paper,
            fillOpacity: 0.9,
          },
          labelBgPadding: [2, 4] as [number, number],
        };
      }),
    [enabledKinds, theme, visibleEntityIds],
  );

  return (
    <Box sx={{ width: "100%", height: "100%", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        onNodeClick={(_, node) => onSelect(node.id)}
        onPaneClick={() => onSelect(null)}
        colorMode={theme.palette.mode}
        minZoom={0.3}
        maxZoom={1.8}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={alpha(theme.palette.text.primary, 0.18)}
        />
        <Controls
          style={{
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
          }}
        />
        <MiniMap
          pannable
          zoomable
          style={{
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
          }}
          maskColor={alpha(theme.palette.background.default, 0.6)}
          nodeColor={(node) => {
            const entity = MOCK_ENTITIES.find((e) => e.id === node.id);
            return entity ? riskColor(theme, entity.risk) : theme.palette.primary.main;
          }}
        />
      </ReactFlow>
      <Tooltip title="Re-center" placement="left">
        <IconButton
          onClick={() => fitView({ padding: 0.2 })}
          size="small"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            bgcolor: "background.paper",
            border: `1px solid ${theme.palette.divider}`,
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const ALL_KINDS: GraphLink["kind"][] = [
  "communicates_with",
  "financial_link",
  "associate",
  "family",
  "employed_by",
  "suspected_handoff",
];

export const GraphPage = (): JSX.Element => {
  const theme = useTheme();
  const [layout, setLayout] = useState<LayoutMode>("force");
  const [riskMin, setRiskMin] = useState<number>(0);
  const [enabledKinds, setEnabledKinds] = useState<Set<GraphLink["kind"]>>(
    () => new Set(ALL_KINDS),
  );
  const [selectedId, setSelectedId] = useState<string | null>("e-karim");

  const toggleKind = (kind: GraphLink["kind"]): void => {
    setEnabledKinds((current) => {
      const next = new Set(current);
      if (next.has(kind)) next.delete(kind);
      else next.add(kind);
      return next;
    });
  };

  const selectedEntity = useMemo(
    () => MOCK_ENTITIES.find((e) => e.id === selectedId) ?? null,
    [selectedId],
  );

  const related = useMemo(() => {
    if (!selectedEntity) return [] as { other: GraphEntity; link: GraphLink }[];
    return MOCK_LINKS.filter(
      (l) => l.source === selectedEntity.id || l.target === selectedEntity.id,
    )
      .map((link) => {
        const otherId = link.source === selectedEntity.id ? link.target : link.source;
        const other = MOCK_ENTITIES.find((e) => e.id === otherId);
        return other ? { other, link } : null;
      })
      .filter((row): row is { other: GraphEntity; link: GraphLink } => row !== null);
  }, [selectedEntity]);

  return (
    <PageShell
      title="Connections"
      subtitle="Live network of observed relationships between people, organizations, and assets. Filter by link type, raise the risk floor to surface high-signal nodes, and select any entity to open its dossier."
      fullHeight
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{ flexShrink: 0, mb: 2, alignItems: { lg: "center" }, justifyContent: "space-between" }}
      >
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          {ALL_KINDS.map((kind) => {
            const v = linkVisuals(kind);
            const enabled = enabledKinds.has(kind);
            return (
              <Chip
                key={kind}
                onClick={() => toggleKind(kind)}
                label={LINK_KIND_LABELS[kind]}
                size="small"
                icon={
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: v.color,
                      ml: "8px !important",
                    }}
                  />
                }
                sx={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  bgcolor: enabled ? alpha(v.color, 0.16) : "transparent",
                  color: enabled ? v.color : "text.secondary",
                  border: `1px solid ${enabled ? alpha(v.color, 0.45) : theme.palette.divider}`,
                  cursor: "pointer",
                }}
              />
            );
          })}
        </Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={{ minWidth: 220 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Risk floor: {riskMin}
            </Typography>
            <Slider
              size="small"
              value={riskMin}
              min={0}
              max={100}
              step={5}
              onChange={(_, v) => setRiskMin(v as number)}
              sx={{ py: 1 }}
            />
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={layout}
            onChange={(_, value) => value && setLayout(value)}
          >
            <ToggleButton value="force">Force</ToggleButton>
            <ToggleButton value="radial">Radial</ToggleButton>
            <ToggleButton value="hierarchy">Tiers</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 360px" },
          gap: 2,
        }}
      >
        <Paper
          sx={{
            position: "relative",
            overflow: "hidden",
            bgcolor: theme.palette.mode === "dark" ? "#06091a" : "#f8fafc",
          }}
        >
          <ReactFlowProvider>
            <CanvasInner
              layout={layout}
              riskMin={riskMin}
              enabledKinds={enabledKinds}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </ReactFlowProvider>
        </Paper>
        <Box sx={{ minHeight: 0 }}>
          <Inspector entity={selectedEntity} related={related} onSelect={setSelectedId} />
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          mt: 2,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <HubIcon sx={{ color: "text.secondary", fontSize: 18 }} />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", fontFamily: "JetBrains Mono, monospace" }}
          >
            {MOCK_ENTITIES.length} entities · {MOCK_LINKS.length} observed relationships · last refresh 2m ago
          </Typography>
        </Stack>
        <Button
          variant="secondary"
          onClick={() => {
            setRiskMin(0);
            setEnabledKinds(new Set(ALL_KINDS));
            setLayout("force");
            setSelectedId(null);
          }}
        >
          Reset filters
        </Button>
      </Stack>
    </PageShell>
  );
};
