import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: '10M+', label: 'Links Shortened' },
  { value: '50M+', label: 'Clicks Tracked' },
  { value: '99.9%', label: 'Uptime' },
];

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

export default function Stats() {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <section className="stats" id="stats" ref={ref}>
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div
            className="stat-item"
            key={i}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.15}s`,
            }}
          >
            <div className="stat-number">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
