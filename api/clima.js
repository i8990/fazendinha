export default async function handler(req, res) {
  const base = 'https://api.open-meteo.com/v1'
  const coords = 'latitude=-21.9569&longitude=-44.8881'
  const tz = 'timezone=America%2FSao_Paulo'

  // Data de início do mês atual
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const startOfMonth = `${year}-${month}-01`
  const today = now.toISOString().split('T')[0]

  try {
    const [forecastRes, histRes] = await Promise.all([
      fetch(`${base}/forecast?${coords}&daily=precipitation_sum,temperature_2m_max,weathercode&current_weather=true&hourly=relativehumidity_2m&${tz}&forecast_days=7`),
      fetch(`${base}/archive?${coords}&start_date=${startOfMonth}&end_date=${today}&daily=precipitation_sum&${tz}`)
    ])

    const forecast = await forecastRes.json()
    const hist = await histRes.json()

    const rainMonthSoFar = (hist.daily?.precipitation_sum || [])
      .reduce((s, v) => s + (v || 0), 0)

    res.setHeader('Cache-Control', 's-maxage=600')
    res.status(200).json({ ...forecast, rainMonthSoFar: Math.round(rainMonthSoFar) })
  } catch (e) {
    res.status(500).json({ error: 'clima indisponivel' })
  }
}
