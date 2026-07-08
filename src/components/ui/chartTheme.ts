export const chartTheme = {
  grid: "rgb(var(--color-line) / 0.55)",
  axis: "rgb(var(--color-steel) / 0.9)",
  tooltipBackground: "rgb(var(--color-surface) / 0.98)",
  tooltipBorder: "rgb(var(--color-line) / 0.95)",
  tooltipText: "rgb(var(--color-ink))",
  mint: "rgb(var(--color-mint))",
  amber: "rgb(var(--color-amber))",
  coral: "rgb(var(--color-coral))",
  steel: "rgb(var(--color-steel))",
};

export const chartTooltipStyle = {
  backgroundColor: chartTheme.tooltipBackground,
  border: `1px solid ${chartTheme.tooltipBorder}`,
  borderRadius: 12,
  color: chartTheme.tooltipText,
  boxShadow: "0 24px 70px rgb(0 0 0 / 0.28)",
  padding: "10px 12px",
};

export const chartLabelStyle = {
  color: chartTheme.axis,
};
