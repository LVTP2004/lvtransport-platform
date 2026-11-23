const zoom = 12;
const across = 3;
const down = 2;

function tilePosition(lat: number, lng: number) {
  const scale = 2 ** zoom;
  const radians = Math.max(-85.0511, Math.min(85.0511, lat)) * Math.PI / 180;
  return {
    x: (lng + 180) / 360 * scale,
    y: (1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2 * scale,
  };
}

const antwerp = tilePosition(51.2194, 4.4025);
const left = Math.floor(antwerp.x) - 1;
const top = Math.floor(antwerp.y - .5);
const tiles = Array.from({ length: across * down }, (_, index) => ({
  x: left + index % across,
  y: top + Math.floor(index / across),
}));

export type OperationsMapPoint = { referenceCode: string; lat: number; lng: number };

export function FounderOperationsMap({ points, caption }: { points: OperationsMapPoint[]; caption: string }) {
  return <>
    <div className="fd-geo-map" aria-label="Antwerp operations map">
      <div className="fd-geo-tiles" aria-hidden="true">{tiles.map(({ x, y }) =>
        <img key={`${x}/${y}`} src={`https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`}
          alt="" loading="lazy" width="256" height="256" referrerPolicy="no-referrer" />
      )}</div>
      {points.map(point => {
        const { x, y } = tilePosition(point.lat, point.lng);
        const horizontal = (x - left) / across;
        const vertical = (y - top) / down;
        if (horizontal <= 0 || horizontal >= 1 || vertical <= 0 || vertical >= 1) return null;
        return <span className="fd-geo-pin" role="img" key={point.referenceCode}
          aria-label={`Reported position for ${point.referenceCode}`} title={point.referenceCode}
          style={{ left: `${horizontal * 100}%`, top: `${vertical * 100}%` }}>●</span>;
      })}
      <a className="fd-geo-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
    </div>
    <p className="fd-note">{caption}</p>
    {points.length > 0 && <ul className="fd-feed">{points.map(point => <li key={point.referenceCode}>
      <strong>{point.referenceCode}</strong><span>{point.lat.toFixed(5)}, {point.lng.toFixed(5)}</span>
    </li>)}</ul>}
  </>;
}
