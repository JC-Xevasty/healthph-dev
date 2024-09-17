import { forwardRef, useEffect, useState } from "react";

const PrintTrendsMap = forwardRef(({ mapImage, dateTable }, ref) => {
  const formatDataLength = (value, minDigit) => {
    return value.length > minDigit
      ? value.toString().padStart(minDigit, "0").slice(0, minDigit)
      : value.toString().padStart(minDigit, "0");
  };

  const mapLegends = [
    { id: "TB", label: "Pulmonary Tuberculosis", color: "#F5D76E" },
    { id: "PN", label: "Pneumonia", color: "#6A8EB5" },
    { id: "COVID", label: "COVID", color: "#78C6B2" },
    { id: "AURI", label: "AURI", color: "#F78C6B" },
  ];

  return (
    <div className="print-component">
      <div className="print-container" ref={ref}>
        <div className="page">
          <div className="page-header mb-[36px]">
            <p>Trends Map</p>
            <p>HealthPH</p>
          </div>
          <div className="page-content">
            <div className="content-header">
              <div className="flex items-center">
                <p>Trends Map</p>
              </div>
              <p>As of {dateTable}</p>
            </div>
            <div className="flex items-center mt-[12px]">
              {mapLegends.map((mapLegend, i) => {
                return <MapLegendItem key={i} {...mapLegend} />;
              })}
            </div>
            <div className="h-[900px] w-full">
              <img
                src={mapImage}
                className="w-full h-full object-contain"
                alt=""
              />
            </div>
          </div>
          <div className="page-footer mt-[36px]">
            <p></p>
            <p>Page {formatDataLength(0 + 1, 2)} </p>
          </div>
        </div>
      </div>
    </div>
  );
});

const MapLegendItem = ({ id, label, color }) => {
  const bgColor = `bg-[${color}]`;
  return (
    <div className="flex items-center me-[16px]">
      <div
        className={`h-[16px] w-[16px] rounded-[4px] me-[10px]`}
        style={{ backgroundColor: color }}
      ></div>
      <span className="prod-l3 font-medium">{label}</span>
    </div>
  );
};
export default PrintTrendsMap;
