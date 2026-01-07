import React, { useState } from "react";

// Put your real OpenWeatherMap API key here
// Copy it from https://openweathermap.org under "API keys"
const API_KEY = "4e3c9f793fca4e70baa23a38b05ba960";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [searchHover, setSearchHover] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [mapHover, setMapHover] = useState(false);
  const [mapActive, setMapActive] = useState(false);

  const getWeather = async () => {
    // Do nothing if city is empty
    if (!city) return;

    // Show clear error if API key is missing
    if (!API_KEY || API_KEY === "YOUR_API_KEY") {
      setError("Please set your OpenWeatherMap API key in app.js.");
      setWeather(null);
      return;
    }

    try {
      // Search by city name
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();

      if (data.cod !== 200) {
        // If you want to use latitude/longitude instead of city:
        // https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid=${API_KEY}&units=metric
        setError(data.message || "City not found");
        setWeather(null);
        return;
      }

      setWeather(data);
      setError("");
    } catch (err) {
      setError("Error fetching data");
    }
  };

  const toTime = (unix, timezone) => {
    // OpenWeatherMap returns Unix timestamp in UTC (seconds)
    // timezone is offset in seconds from UTC (e.g., 19800 for IST = +5:30)
    // Convert to city's local time by adding timezone offset
    const localUnixSeconds = unix + timezone;
    
    // Convert to Date object (this will be interpreted as UTC, but we've already adjusted)
    const date = new Date(localUnixSeconds * 1000);
    
    // Extract UTC components (since we've already adjusted for timezone)
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');
    
    return `${displayHours}:${formattedMinutes}:${formattedSeconds} ${period}`;
  };

  const showCityOnMap = () => {
    // If no city text, do nothing
    if (!city) return;

    // Prefer precise coordinates if we already have weather data
    if (weather?.coord?.lat && weather?.coord?.lon) {
      const { lat, lon } = weather.coord;
      const delta = 0.15; // small span for bbox
      const bbox = [
        lon - delta,
        lat - delta,
        lon + delta,
        lat + delta,
      ].join("%2C");
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
      setMapUrl(url);
      return;
    }

    // Fallback: search by city name on OSM (no API key needed)
    const url = `https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(
      city
    )}&layer=mapnik`;
    setMapUrl(url);
  };

  const buttonStyle = (hover, active, fullWidth = false) => {
    const baseBg = "rgba(79, 195, 247, 0.15)";
    const hoverBg = "#4FC3F7"; // sky blue
    const activeBg = "#1976d2"; // dark blue
    const bg = active ? activeBg : hover ? hoverBg : baseBg;
    const color = active || hover ? "#ffffff" : "#e9f6ff";
    return {
      width: fullWidth ? "100%" : undefined,
      padding: fullWidth ? "10px 0" : "10px 20px",
      borderRadius: "999px",
      border: "1px solid rgba(79, 195, 247, 0.45)",
      background: bg,
      color,
      fontWeight: 600,
      fontSize: "14px",
      cursor: "pointer",
      boxShadow: active
        ? "0 4px 10px rgba(25, 118, 210, 0.5)"
        : hover
        ? "0 6px 16px rgba(79, 195, 247, 0.45)"
        : "0 4px 10px rgba(79, 195, 247, 0.25)",
      whiteSpace: "nowrap",
      transition: "all 0.15s ease",
    };
  };

  return (
    <div
      style={{
        borderRadius: "20px",
        padding: "24px 28px 28px",
        background: "rgba(15, 25, 35, 0.32)", // lighter glass for more transparency
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.12)",
        backdropFilter: "blur(8px)",
        color: "#f5f7fa",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "26px",
              color: "#f8fbff",
            }}
          >
            🌤 Weather Dashboard
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#d6e4f5" }}>
            Enter a city name to see current weather details.
          </p>
        </div>
        <span
          style={{
            fontSize: "11px",
            color: "#e3f2fd",
            background: "rgba(33, 150, 243, 0.25)",
            padding: "4px 10px",
            borderRadius: "999px",
          }}
        >
          Powered by OpenWeatherMap
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "12px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Enter city name (e.g. Pune, Mumbai, London)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              getWeather();
            }
          }}
          style={{
            flex: 1,
            minWidth: "200px",
            padding: "10px 12px",
            borderRadius: "999px",
            border: "1px solid #b3e0ff",
            outline: "none",
            fontSize: "14px",
            boxShadow: "0 0 0 2px transparent",
          }}
        />
        <button
          onClick={getWeather}
          style={buttonStyle(searchHover, searchActive)}
          onMouseEnter={() => setSearchHover(true)}
          onMouseLeave={() => {
            setSearchHover(false);
            setSearchActive(false);
          }}
          onMouseDown={() => setSearchActive(true)}
          onMouseUp={() => setSearchActive(false)}
        >
          Search
        </button>
      </div>

      {/* Sky blue "Show on Map" button just below city input & search */}
      <div style={{ marginBottom: "12px" }}>
        <button
          onClick={showCityOnMap}
          style={buttonStyle(mapHover, mapActive, true)}
          onMouseEnter={() => setMapHover(true)}
          onMouseLeave={() => {
            setMapHover(false);
            setMapActive(false);
          }}
          onMouseDown={() => setMapActive(true)}
          onMouseUp={() => setMapActive(false)}
        >
          Show City on Map
        </button>
      </div>

      {error && (
        <p
          style={{
            color: "#d32f2f",
            marginTop: "4px",
            marginBottom: "8px",
            fontSize: "13px",
          }}
        >
          {error}
        </p>
      )}

      {weather && (
        <div style={{ marginTop: "16px" }}>
          {/* City name */}
          <h3
            style={{
              margin: 0,
              textAlign: "center",
              fontSize: "18px",
              fontWeight: 600,
            }}
          >
            {weather.name}, {weather.sys.country}
          </h3>

          {/* Circle + temperature */}
          <div
            style={{
              marginTop: "12px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                backgroundColor: "#9e9e9e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 0 8px rgba(255, 112, 67, 0.5)",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "#ff7043",
                }}
              ></div>
            </div>

            <div
              style={{
                marginTop: "12px",
                fontSize: "22px",
                fontWeight: 700,
                color: "#1565c0",
              }}
            >
              {weather.main.temp}°C
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#444",
              }}
            >
              {weather.weather?.[0]?.description
                ? weather.weather[0].description
                : ""}
            </div>
          </div>

          {/* Table: Name / Value */}
          <div
            style={{
              marginTop: "16px",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.24)",
              maxWidth: "450px",
              marginLeft: "auto",
              marginRight: "auto",
              backgroundColor: "rgba(10, 18, 28, 0.35)",
              backdropFilter: "blur(6px)",
            }}
          >
            <table
              cellPadding="8"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "rgba(255, 255, 255, 0.08)" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                      borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "#e9f1ff",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "8px 10px",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#e9f1ff",
                    }}
                  >
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRight: "1px solid rgba(255, 255, 255, 0.05)",
                      padding: "8px 10px",
                      color: "#f5f7fa",
                      background: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    Longitude
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "8px 10px",
                      color: "#f5f7fa",
                      background: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    {weather.coord.lon}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRight: "1px solid rgba(255, 255, 255, 0.05)",
                      padding: "8px 10px",
                      color: "#f5f7fa",
                      background: "rgba(255, 255, 255, 0.02)",
                    }}
                  >
                    Latitude
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "8px 10px",
                      color: "#f5f7fa",
                      background: "rgba(255, 255, 255, 0.02)",
                    }}
                  >
                    {weather.coord.lat}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRight: "1px solid rgba(255, 255, 255, 0.05)",
                      padding: "8px 10px",
                      color: "#f5f7fa",
                      background: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    Temperature
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      padding: "8px 10px",
                      color: "#f5f7fa",
                      background: "rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    {weather.main.temp}°C
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Feels Like
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.main.feels_like}°C
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Min Temp
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.main.temp_min}°C
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Max Temp
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.main.temp_max}°C
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Pressure
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.main.pressure} hPa
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Humidity
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.main.humidity} %
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Sea Level
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.main.sea_level || "N/A"} hPa
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Ground Level
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.main.grnd_level || "N/A"} hPa
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Visibility
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.visibility} m
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Wind Speed
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.wind.speed} m/s
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Wind Direction
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.wind.deg}°
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Wind Gust
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.wind.gust || "N/A"} m/s
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Cloudiness
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.clouds.all} %
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Sunrise
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {toTime(weather.sys.sunrise, weather.timezone)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Sunset
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {toTime(weather.sys.sunset, weather.timezone)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Timezone
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.timezone / 3600} hours from UTC
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    City ID
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    {weather.id}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      borderRight: "1px solid #eee",
                      padding: "8px 10px",
                    }}
                  >
                    Base
                  </td>
                  <td
                    style={{
                      padding: "8px 10px",
                    }}
                  >
                    {weather.base}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Map section for the entered city */}
      {mapUrl && (
        <div
          style={{
            marginTop: "16px",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #e0f0ff",
            height: "260px",
          }}
        >
          <iframe
            title="City Map"
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: "0" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default App;
