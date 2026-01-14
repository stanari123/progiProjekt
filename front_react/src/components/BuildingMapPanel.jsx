import { useEffect, useState } from "react";
import { loadBuildings } from "../services/buildings";

export default function BuildingMapPanel({ buildingId }) {
  const [buildings, setBuildings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBuildings() {
      try {
        setError("");
        const data = await loadBuildings();
        setBuildings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Ne mogu dohvatiti zgrade.");
        setBuildings([]);
      }
    }

    fetchBuildings();
  }, []);

  const selectedBuilding = buildings.find(
    (b) => String(b.id) === String(buildingId)
  );

  let address = "";
  if (selectedBuilding) {
    if (selectedBuilding.address) {
      address = selectedBuilding.address;
    } else {
      const street = selectedBuilding.street || "";
      const number = selectedBuilding.street_number || "";
      const city = selectedBuilding.city || "";
      address = [ `${street} ${number}`.trim(), city ]
        .filter(Boolean)
        .join(", ");
    }
  }

  const mapSrc = address
    ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
    : "";

  return (
    <div className="card" style={{ minHeight: 420 }}>
      <div>
        <strong>Lokacija</strong>
        <div className="muted" style={{ marginTop: 4 }}>
          {selectedBuilding ? selectedBuilding.name : "Odaberi zgradu"}
        </div>
      </div>

      {error && (
        <div className="muted" style={{ color: "crimson", marginTop: 10 }}>
          {error}
        </div>
      )}

      {!selectedBuilding && (
        <div className="muted" style={{ marginTop: 12 }}>
          Odaberi zgradu da se prikaže karta.
        </div>
      )}

      {selectedBuilding && !address && (
        <div className="muted" style={{ marginTop: 12 }}>
          Ova zgrada nema upisanu adresu.
        </div>
      )}

      {selectedBuilding && address && (
        <>
          <div className="muted" style={{ marginTop: 10 }}>
            {address}
          </div>

          <div
            style={{
              marginTop: 10,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <iframe
              title="Google Maps"
              src={mapSrc}
              width="100%"
              height="380"
              style={{ border: 0 }}
              loading="lazy"
            />
          </div>
        </>
      )}
    </div>
  );
}
