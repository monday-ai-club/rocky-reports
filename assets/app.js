function formatValue(value) {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    return Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
  }
  return String(value);
}

function getCssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function renderFallback(container, items) {
  if (!container || !Array.isArray(items) || !items.length) return;
  const max = Math.max(...items.map(i => Number(i.value) || 0), 1);
  container.innerHTML = items.map((item, idx) => {
    const pct = ((Number(item.value) || 0) / max) * 100;
    const colors = [getCssVar('--blue'), getCssVar('--green'), getCssVar('--purple'), getCssVar('--orange'), getCssVar('--pink'), getCssVar('--cyan')];
    return `
      <div style="margin: 14px 0;">
        <div style="display:flex;justify-content:space-between;gap:10px;margin-bottom:6px;">
          <span>${item.label}</span>
          <strong>${formatValue(item.value)}</strong>
        </div>
        <div style="height:12px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${colors[idx % colors.length]};border-radius:999px;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderChart(container, chart) {
  const items = chart.items || [];
  if (!container || !items.length) return;
  if (typeof Chart === 'undefined') {
    renderFallback(container, items);
    return;
  }

  const type = chart.type || 'bar';
  const labels = items.map(i => i.label);
  const values = items.map(i => i.value);
  const colors = [getCssVar('--blue'), getCssVar('--green'), getCssVar('--purple'), getCssVar('--orange'), getCssVar('--pink'), getCssVar('--cyan')];

  container.innerHTML = '<canvas></canvas>';
  const canvas = container.querySelector('canvas');

  new Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        label: chart.datasetLabel || chart.title || 'Value',
        data: values,
        backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        borderColor: labels.map((_, i) => colors[i % colors.length]),
        borderWidth: 1,
        borderRadius: type === 'bar' ? 8 : 0,
        tension: 0.35,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#f5f7fb' } },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${formatValue(ctx.parsed.y ?? ctx.parsed)}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#98a2b3' },
          grid: { color: 'rgba(255,255,255,0.04)' }
        },
        y: {
          ticks: { color: '#98a2b3' },
          grid: { color: 'rgba(255,255,255,0.06)' }
        }
      }
    }
  });
}

window.RockyReports = { renderChart, formatValue };
