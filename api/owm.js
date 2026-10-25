// Proxy de teselas de OpenWeatherMap para LABMET Avisos Cuba.
// La llave vive SOLO en la variable de entorno OWM_KEY del proyecto en
// Vercel; nunca se escribe en el código ni en la página pública.
// Uso: /api/owm?layer=temp_new&z=6&x=17&y=27  →  PNG de la tesela.
const CAPAS = ["clouds_new", "precipitation_new", "temp_new", "wind_new", "pressure_new"];

module.exports = async (req, res) => {
  const q = req.query || {};
  const layer = String(q.layer || "");
  const z = parseInt(q.z, 10), x = parseInt(q.x, 10), y = parseInt(q.y, 10);
  if (!CAPAS.includes(layer) || !(z >= 0 && z <= 18) || !(x >= 0 && x < Math.pow(2, z)) || !(y >= 0 && y < Math.pow(2, z))) {
    res.status(400).send("bad request");
    return;
  }
  const key = process.env.OWM_KEY;
  if (!key) { res.status(500).send("missing key"); return; }
  try {
    const r = await fetch("https://tile.openweathermap.org/map/" + layer + "/" + z + "/" + x + "/" + y + ".png?appid=" + key);
    if (!r.ok) { res.status(r.status).send("tile error"); return; }
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=1800");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(buf);
  } catch (e) {
    res.status(502).send("upstream error");
  }
};
