import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const DATA_URL = `${import.meta.env.BASE_URL}data.json`;

const createChartOptions = (maxValue, stepSize = 1) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 2000,
    easing: 'easeInOutQuart',
    delay: (context) => {
      let delay = 0;
      if (context.type === 'data' && context.mode === 'default') {
        delay = context.dataIndex * 300 + context.datasetIndex * 100;
      }
      return delay;
    },
  },
  interaction: {
    mode: 'nearest',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
      callbacks: {
        label: (context) => `${context.label}: ${context.parsed.y}`,
        title: () => '',
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        font: { size: 14, weight: 600 },
        color: '#4a4a5e',
      },
    },
    y: {
      beginAtZero: true,
      max: maxValue,
      ticks: {
        stepSize,
        font: { size: 12 },
        color: '#7a7a8e',
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
        drawBorder: false,
      },
    },
  },
});

const createGradient = (ctx, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

const getUnitLabel = (title) => {
  if (title.includes('Stage')) return 'stages';
  if (title.includes('Tour de France Wins')) return 'wins';
  if (title.includes('Grand Tour')) return 'wins';
  if (title.includes('Monument')) return 'wins';
  if (title.includes('World')) return 'wins';
  if (title.includes('Career')) return 'wins*';
  return '';
};

const RiderCard = ({ rider, fallbackLabel }) => (
  <div className="rider-card">
    <h2>{rider?.name ?? fallbackLabel}</h2>
    <p className="nickname">{rider ? `"${rider.nickname}"` : ''}</p>
    <p className="era">
      {rider ? `${rider.country} | Active: ${rider.active}` : ''}
    </p>
  </div>
);

const RidersIntro = ({ riders, isLoading }) => (
  <section className="riders-intro">
    <RiderCard
      rider={riders?.merckx}
      fallbackLabel={isLoading ? 'Loading…' : 'Merckx'}
    />
    <RiderCard
      rider={riders?.pogacar}
      fallbackLabel={isLoading ? 'Loading…' : 'Pogačar'}
    />
  </section>
);

const MetricLegend = ({ riders, metric }) => {
  if (!riders) {
    return (
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color merckx-color" />
          <span>Loading…</span>
        </div>
        <div className="legend-item">
          <div className="legend-color pogacar-color" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="legend">
      <div className="legend-item">
        <div className="legend-color merckx-color" />
        <span>
          {riders.merckx.name}: {metric.merckx} {getUnitLabel(metric.title)}
        </span>
      </div>
      <div className="legend-item">
        <div className="legend-color pogacar-color" />
        <span>
          {riders.pogacar.name}: {metric.pogacar} {getUnitLabel(metric.title)}
        </span>
      </div>
    </div>
  );
};

const MetricChart = ({ metric, riders, colors }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !riders || !colors) {
      return undefined;
    }

    const ctx = canvasRef.current.getContext('2d');
    const gradientMerckx = createGradient(
      ctx,
      colors.merckx.primary,
      colors.merckx.light
    );
    const gradientPogacar = createGradient(
      ctx,
      colors.pogacar.primary,
      colors.pogacar.light
    );

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [riders.merckx.name, riders.pogacar.name],
        datasets: [
          {
            data: [metric.merckx, metric.pogacar],
            backgroundColor: [gradientMerckx, gradientPogacar],
            borderColor: [colors.merckx.secondary, colors.pogacar.secondary],
            borderWidth: 3,
            borderRadius: 8,
            barThickness: 80,
          },
        ],
      },
      options: createChartOptions(metric.maxValue, metric.stepSize),
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [metric, riders, colors]);

  return <canvas ref={canvasRef} aria-label={metric.title} role="img" />;
};

const MetricCard = ({ metric, riders, colors, isLoading }) => (
  <div className="metric-card">
    <h3>{metric.title}</h3>
    <div className={`chart-container${isLoading ? ' loading' : ''}`}>
      <MetricChart metric={metric} riders={riders} colors={colors} />
    </div>
    <MetricLegend riders={riders} metric={metric} />
    {metric.note && <p className="note">{metric.note}</p>}
  </div>
);

const ErrorBanner = ({ message }) => (
  <div className="error-banner" role="alert">
    {message}
  </div>
);

function App() {
  const [riders, setRiders] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const headerRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        setIsLoading(true);
        const response = await fetch(DATA_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to load rider data.');
        }
        const data = await response.json();
        setRiders(data.riders);
        setMetrics(data.metrics);
        setError('');
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Unable to load rider data. Please refresh to try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, []);

  const colors = useMemo(() => {
    if (!riders) {
      return null;
    }
    return {
      merckx: {
        primary: riders.merckx.colorPrimary,
        secondary: riders.merckx.colorSecondary,
        light: riders.merckx.colorLight,
      },
      pogacar: {
        primary: riders.pogacar.colorPrimary,
        secondary: riders.pogacar.colorSecondary,
        light: riders.pogacar.colorLight,
      },
    };
  }, [riders]);

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) {
        return;
      }
      const scrolled = window.pageYOffset;
      headerRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        document
          .querySelectorAll('.active')
          .forEach((el) => el.classList.remove('active'));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    console.log(
      '%c🚴‍♂️ Merckx vs Pogačar 🚴‍♂️',
      'font-size: 24px; font-weight: bold; color: #667eea;'
    );
    console.log(
      '%cTwo legends, different eras, one passion!',
      'font-size: 14px; color: #764ba2;'
    );
    console.log(
      '%cEddy Merckx: The Cannibal 🇧🇪',
      'font-size: 12px; color: #FF6B6B;'
    );
    console.log('%cTadej Pogačar: Pogi 🇸🇮', 'font-size: 12px; color: #4ECDC4;');
  }, []);

  return (
    <div className="container">
      <header ref={headerRef}>
        <h1>⚡ Merckx vs Pogačar ⚡</h1>
        <p className="subtitle">
          Comparing Two Cycling Legends Across Generations
        </p>
      </header>

      {error && <ErrorBanner message={error} />}

      <RidersIntro riders={riders} isLoading={isLoading} />

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            riders={riders}
            colors={colors}
            isLoading={isLoading}
          />
        ))}
      </section>

      <footer>
        <p>
          Data accurate as of Nov 2025 | Pogačar's statistics are still being
          written!
        </p>
        <p className="footer-note">
          Note: Different eras had different racing calendars and competition
          levels
        </p>
      </footer>
    </div>
  );
}

export default App;
