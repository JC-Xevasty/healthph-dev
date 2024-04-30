import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../Icon";
import {
  AttributionControl,
  MapContainer,
  Polygon,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  LayerGroup,
} from "react-leaflet";
import Regions from "../../assets/data/regions.json";
import RegionsCoordinates from "../../assets/data/regions_coordinates.json";
import { format } from "date-fns";

const Map = ({ filters, data }) => {
  const zoomOptions = { max: 10, min: 7 };

  const [zoom, setZoom] = useState(zoomOptions.min);

  const center = [13, 122];

  const maxBounds = [
    [22, 116],
    [4, 128],
  ];

  const purpleOptions = { color: "purple" };

  const [map, setMap] = useState(null);

  const mapOptions = {
    center: center,
    zoom: zoom,
    scrollWheelZoom: true,
    minZoom: zoomOptions.min,
    maxZoom: zoomOptions.max,
    maxBounds: maxBounds,
    maxBoundsViscosity: 1,
    attributionControl: false,
    zoomControl: false,
    ref: setMap,
  };

  useEffect(() => {
    if (map) map.setZoom(zoom);
  }, [map, zoom]);

  const [showAttribution, setShowAttribution] = useState(false);

  const displayRegion = (id) => {
    const flag = filters.region.find((f) => f.value == id);
    if (flag !== undefined && flag !== null) return true;

    return false;
  };

  const mapLegends = [
    { id: "TB", label: "Tuberculosis", color: "#DBB324" },
    { id: "PN", label: "Pneumonia", color: "#007AFF" },
    { id: "COVID", label: "COVID", color: "#D82727" },
    { id: "AURI", label: "AURI", color: "#35CA3B" },
  ];

  const getColor = (id) => {
    const legend = mapLegends.find((v) => v.id == id);
    return legend.color;
  };

  return (
    <>
      {/* MAP CONTAINER */}
      <div className="map-container">
        <div className="map-header">
          <div className="attribution-controls hidden xs:block">
            <div
              className="control-wrapper rounded-[6px]"
              onClick={() => {
                setShowAttribution(!showAttribution);
              }}
            >
              <Icon
                iconName="Information"
                height="20px"
                width="20px"
                fill="#465360"
              />
            </div>
          </div>
          <div className="map-legend-wrapper">
            <div className="map-date">
              Updated as of {format(new Date(), "MMMM dd, yyyy")}
            </div>
            <div className="map-legends">
              {mapLegends.map(({ label, color }, i) => {
                return (
                  <div className="map-legend-item" key={i}>
                    <div
                      className="color"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* MAP CONTROLS */}
        <div className="map-controls">
          <div
            className="control-wrapper mb-[16px] rounded-[6px]"
            onClick={useCallback(() => {
              map.panTo(center, { animate: true });
            }, [map])}
          >
            <Icon
              iconName="CurrentLocation"
              height="20px"
              width="20px"
              fill="#465360"
            />
          </div>
          <div className="zoom-controls">
            <div
              className="control-wrapper rounded-t-[6px]"
              onClick={() => setZoom((zoom) => zoom + 1)}
            >
              <Icon iconName="Plus" height="20px" width="20px" fill="#465360" />
            </div>
            <div
              className="control-wrapper rounded-b-[6px]"
              onClick={() => setZoom((zoom) => zoom - 1)}
            >
              <Icon
                iconName="Minus"
                height="20px"
                width="20px"
                fill="#465360"
              />
            </div>
          </div>
        </div>

        {/* MAP */}
        {useMemo(
          () => (
            <MapContainer {...mapOptions}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {showAttribution && <AttributionControl position="topleft" />}

              {RegionsCoordinates.map(({ id, coordinates }, i) => {
                return (
                  displayRegion(id) &&
                  filters.region.length !== Regions.regions.length && (
                    <Polygon
                      key={id}
                      pathOptions={{ color: "#88F" }}
                      positions={coordinates}
                    />
                  )
                );
              })}
              <LayerGroup>
                {data &&
                  data.map(
                    ({ latitude, longitude, region, sickness, text }, i) => {
                      return (
                        (displayRegion(region) ||
                          filters.region.length == Regions.regions.length) && (
                          <CircleMarker
                            key={i}
                            center={[latitude, longitude]}
                            pathOptions={{ color: getColor(sickness) }}
                            radius={15}
                            // radius={radius * 5}
                          >
                            <Popup>{text}</Popup>
                          </CircleMarker>
                        )
                      );
                    }
                  )}
              </LayerGroup>
            </MapContainer>
          ),
          [filters, showAttribution, data]
        )}
      </div>
    </>
  );
};
export default Map;
