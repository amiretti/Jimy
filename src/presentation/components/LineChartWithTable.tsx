import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDate } from './format'

export interface ChartSeries {
  readonly key: string
  readonly label: string
}

interface Props<T extends { date: string }> {
  readonly title: string
  readonly unit: string
  readonly data: readonly T[]
  readonly series: readonly ChartSeries[]
}

/** Gráfico de líneas con su tabla equivalente (alternativa accesible al gráfico). */
export function LineChartWithTable<T extends { date: string }>({ title, unit, data, series }: Props<T>) {
  if (data.length === 0) return <p className="status">Todavía no hay datos para graficar.</p>
  const rows = data as readonly (T & Record<string, number>)[]
  return (
    <figure className="chart">
      <figcaption className="chart__title">{title}</figcaption>
      <div className="chart__plot" aria-hidden="true">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={[...rows]} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDate} stroke="var(--color-muted)" fontSize={12} />
            <YAxis stroke="var(--color-muted)" fontSize={12} domain={['auto', 'auto']} unit={` ${unit}`} />
            <Tooltip labelFormatter={(d) => formatDate(String(d))} />
            {series.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={i === 0 ? 'var(--color-accent)' : 'var(--color-muted)'}
                strokeWidth={i === 0 ? 3 : 1.5}
                dot={i !== 0}
                isAnimationActive={!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <details className="chart__table">
        <summary>Ver datos en tabla</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Fecha</th>
              {series.map((s) => (
                <th key={s.key} scope="col">
                  {s.label} ({unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...rows].reverse().map((row) => (
              <tr key={row.date}>
                <th scope="row">{formatDate(row.date)}</th>
                {series.map((s) => (
                  <td key={s.key}>{row[s.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  )
}
