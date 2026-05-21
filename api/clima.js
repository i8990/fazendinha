export default async function handler(req, res) {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=-21.9569&longitude=-44.8881&daily=precipitation_sum,temperature_2m_max,weathercode&current_weather=true&hourly=relativehumidity_2m&timezone=America%2FSao_Paulo&forecast_days=7'
  try {
    const r = await fetch(url)
    const data = await r.json()
    res.setHeader('Cache-Control', 's-maxage=600')
    res.status(200).json(data)
  } catch (e) {
    res.status(500).json({ error: 'clima indisponivel' })
  }
}
