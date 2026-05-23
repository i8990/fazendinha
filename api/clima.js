export default async function handler(req, res) {
  const coords = 'latitude=-21.9569&longitude=-44.8881'
  const tz = 'timezone=America%2FSao_Paulo'

  const url = `https://api.open-meteo.com/v1/forecast?${coords}&daily=precipitation_sum,temperature_2m_max,weathercode&current_weather=true&hourly=relativehumidity_2m&${tz}&past_days=31&forecast_days=15`

  try {
    const r = await fetch(url)
    const data = await r.json()

    // Soma só os dias do mês atual até hoje
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const rainMonthSoFar = data.daily.time.reduce((sum, dateStr, i) => {
      const d = new Date(dateStr)
      if (d.getFullYear() === currentYear && d.getMonth() === currentMonth && d <= now) {
        return sum + (data.daily.precipitation_sum[i] || 0)
      }
      return sum
    }, 0)

    res.setHeader('Cache-Control', 's-maxage=600')
    res.status(200).json({ ...data, rainMonthSoFar: Math.round(rainMonthSoFar) })
  } catch (e) {
    res.status(500).json({ error: 'clima indisponivel' })
  }
}
