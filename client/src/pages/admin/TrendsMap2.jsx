import { useEffect, useRef, useState } from "react";
import { format, subDays } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
// import { toJpeg, toPng, toSvg, toCanvas } from "dom-to-image-more";
import { toPng, toJpeg } from "html-to-image";

import { updateInitialLogin } from "../../features/auth/authSlice";
import useSwipe from "../../hooks/useSwipe";

import Icon from "../../components/Icon";
import MultiSelect from "../../components/MultiSelect";
import CustomSelect from "../../components/CustomSelect";
import SidebarDataItem from "../../components/admin/SidebarDataItem";
import Map from "../../components/admin/Map";
import Modal from "../../components/admin/Modal";

import Dummy from "../../dummy.json";
import Regions from "../../assets/data/regions.json";
import RegionsCenter from "../../assets/data/regions_center.json";
import Sample from "../../assets/data/sample.json";
import DummyData from "../../assets/data/dummy_data_v3.json";
import useDeviceDetect from "../../hooks/useDeviceDetect";
import { useReactToPrint } from "react-to-print";
import PrintTrendsMap from "../../components/admin/PrintTrendsMap";

const TrendsMap = () => {
  const user = useSelector((state) => state.auth.user);

  const { isPWA } = useDeviceDetect();

  const initialLogin = useSelector((state) => state.auth.initialLogin);

  const [sidebarActive, setSidebarActive] = useState(false);

  const [sideAnimate, setSideAnimate] = useState("");

  const swipeHandlers = useSwipe({
    directions: ["up", "down"],
    onSwipedUp: () => {
      setSidebarActive(true);
      setSideAnimate("show");
    },
    onSwipedDown: () => {
      setSidebarActive(false);
      setSideAnimate("hide");
    },
  });

  const handleOpenSidebar = () => {
    setSidebarActive(!sidebarActive);
    setSideAnimate(!sidebarActive ? "show" : "hide");
  };

  const handleAnimationEnd = (e) => {
    if (e.target.classList.contains("hide")) {
      setSideAnimate("");
    }
  };

  const [filters, setFilters] = useState({
    region: Regions.regions,
    dateRange: 7,
    disease: "all",
  });

  const getDateRangeOptions = () => {
    const dateNow = new Date();
    const values = [7, 14, 21, 28];
    const options = [];

    Array.from(values).forEach((v) => {
      options.push({
        label:
          `Past ${v} Days ` +
          format(subDays(dateNow, v), "(MMM d - ") +
          format(dateNow, "MMM d, yyyy)"),
        value: v,
      });
    });
    return options;
  };

  const handleChangeFilter = (key, value) => {
    setFilters((filters) => ({
      ...filters,
      [key]: value,
    }));
  };

  const getSidebarData = (disease) => {
    const diseases = Dummy["diseases"];
    let output = [];

    if (disease == "all") {
      output = diseases.reduce((acc, current) => {
        current.data.forEach((item) => {
          const existing = acc.find((obj) => obj.region === item.region);
          if (existing) {
            existing.data.push({
              disease_name: current.disease_name,
              count: item.count,
            });
          } else {
            acc.push({
              region: item.region,
              data: [{ disease_name: current.disease_name, count: item.count }],
            });
          }
        });
        return acc;
      }, []);
    } else {
      const specific_disease = diseases.find(
        (d) => d["disease_name"] == disease
      );
      output = specific_disease.data.map((item) => ({
        region: item.region,
        data: [
          { disease_name: specific_disease.disease_name, count: item.count },
        ],
      }));
    }

    output = output
      .sort((a, b) => {
        const indexA = Regions.regions.findIndex(
          (item) => item.value === a.region
        );
        const indexB = Regions.regions.findIndex(
          (item) => item.value === b.region
        );
        // Handle cases where a region might not be found in arr2
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
      .map((item) => ({
        ...item,
        region:
          item.region == "N/A" ? "Not Applicable" : `Region ${item.region}`,
      }));
    return output;
  };

  const [sidebarData, setSidebarData] = useState(getSidebarData("all"));

  const handleChangeDisease = (e) => {
    handleChangeFilter("disease", e.currentTarget.id.split("-")[1]);

    e.currentTarget.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });

    setSidebarData(getSidebarData(e.currentTarget.id.split("-")[1]));
  };

  const formatDataLength = (value, minDigit) => {
    return value.length > minDigit
      ? value.toString().padStart(minDigit, "0").slice(0, minDigit)
      : value.toString().padStart(minDigit, "0");
  };

  const getTotalCount = (disease) => {
    try {
      let count = 0;
      const diseases = Dummy["diseases"];
      if (disease == "all") {
        diseases.forEach((disease) => {
          disease["data"].forEach((d) => {
            if (filters.region.find((r) => r.value == d.region)) {
              count += d.count;
            }
          });
        });
      } else {
        const disease_data = diseases.find((d) => d["disease_name"] == disease);

        disease_data["data"].forEach((d) => {
          if (filters.region.find((r) => r.value == d.region)) {
            count += d.count;
          }
        });
      }
      return count;
    } catch {
      return 0;
    }
  };

  const [showDisclaimer, setShowDisclaimer] = useState(initialLogin);

  const dispatch = useDispatch();

  useEffect(() => {
    if (showDisclaimer == false) {
      dispatch(updateInitialLogin({ value: false }));
    }
  }, [showDisclaimer]);

  const getCenter = () => {
    if (user.user_type == "USER") {
      return RegionsCenter.find((c) => c.region == user.region).center;
    }
    return [13, 122];
  };

  const printRef = useRef();

  const convertMapToPng = async () => {
    //   var node = document.getElementById("trends-map-container");
    var node = document.getElementsByClassName("leaflet-container")[0];

    try {
      const dataUrl = await toPng(node, {
        height: node.clientHeight,
        width: node.clientWidth,
      });

      setMapImage(dataUrl);
    } catch (error) {
      console.error("Error converting component to PNG:", error);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "HealthPH - Trends Map",
    pageStyle:
      "@page { size: A4;  margin: 0mm; } @media print { body { -webkit-print-color-adjust: exact; } img { border: none;} }",
    onBeforeGetContent: convertMapToPng,
    onBeforePrint: convertMapToPng,
  });

  const [mapImage, setMapImage] = useState("");

  const [printData, setPrintData] = useState({
    printCenter: [],
    printZoom: 6,
  });

  function filter(node) {
    // if (node.class.contains)
    return node.tagName !== "img";
  }

  const handlePrintTrendsMap = async () => {
    // setPrintData({ printCenter: [10, 122], printZoom: 7 });

    // var node = document.getElementsByClassName("leaflet-container")[0];
    // try {
    //   const dataUrl = await toPng(node, {
    //     height: node.clientHeight,
    //     width: node.clientWidth,
    //     filter: filter,
    //     quality: 1,
    //   });
    //   setMapImage(dataUrl);
    // } catch (error) {
    //   console.error("Error converting component to PNG:", error);
    // }

    console.log("aaa");
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/fetch-full-map"
    );

    const data = await response.json();
    console.log(data);

    setMapImage(`data:image/png;base64,${data.message}`);
    setTimeout(handlePrint, 500);
  };

  return (
    <div className="trends-wrapper">
      <div
        className={`sidebar ${sidebarActive ? "" : "close-sidebar"} ${
          ["ADMIN", "SUPERADMIN"].includes(user.user_type) && !isPWA
            ? ""
            : "sidebar-sm"
        }`}
      >
        <div
          className="sidebar-toggler"
          onClick={handleOpenSidebar}
          {...swipeHandlers}
        >
          <span></span>
        </div>

        {/* FILTERS */}
        <div className="filter-group">
          <MultiSelect
            options={Regions.regions}
            defaultValue={user.user_type == "USER" ? user.region : null}
            placeHolder="Select Region/s"
            onChange={(e) => handleChangeFilter("region", e)}
            selectAllLabel="All Regions"
            selectAll={true}
            additionalClassname="w-full mb-[20px]"
            menuPlacement="top"
            menuClassname={`${
              sidebarActive ? "menu-bottom" : "menu-top"
            } md:menu-bottom`}
            editable={["ADMIN", "SUPERADMIN"].includes(user.user_type)}
          />
          {/* <CustomSelect
            options={getDateRangeOptions()}
            placeholder="Select Date Range"
            size="input-select-md"
            value={filters.dateRange}
            handleChange={(e) => handleChangeFilter("dateRange", e)}
            additionalClasses="w-full"
          /> */}

          {!isPWA && ["ADMIN", "SUPERADMIN"].includes(user.user_type) && (
            <Link
              to="/dashboard/trends-map/upload-dataset"
              className="prod-btn-base prod-btn-primary w-full flex items-center justify-center"
            >
              <span>Upload Dataset</span>
              <Icon
                iconName="Upload"
                height="20px"
                width="20px"
                fill="#FFF"
                className="ms-[8px]"
              />
            </Link>
          )}
          <button
            className="prod-btn-base prod-btn-secondary w-full flex items-center justify-center mt-[20px]"
            onClick={handlePrintTrendsMap}
          >
            <span>Print Trends Map</span>
            <Icon
              iconName="Printer"
              height="20px"
              width="20px"
              fill="#8693A0"
              className="ms-[8px]"
            />
          </button>
          <PrintTrendsMap
            ref={printRef}
            mapImage={mapImage}
            dateTable={format(new Date(), "MMMM dd, yyyy")}
          />
        </div>

        {/* TABS */}
        <div className="sidebar-tabs">
          <div className="tabs-wrapper">
            <div
              className={`tab-item ${filters.disease == "all" ? "active" : ""}`}
              id="disease-all"
              onClick={handleChangeDisease}
            >
              <span className="label">All</span>
              <span className="count">
                {formatDataLength(getTotalCount("all"), 3)}
              </span>
            </div>
            <div
              className={`tab-item ${
                filters.disease == "tuberculosis" ? "active" : ""
              }`}
              id="disease-tuberculosis"
              onClick={handleChangeDisease}
            >
              <span className="label">Tuberculosis</span>
              <span className="count">
                {formatDataLength(getTotalCount("tuberculosis"), 3)}
              </span>
            </div>
            <div
              className={`tab-item ${
                filters.disease == "pneumonia" ? "active" : ""
              }`}
              id="disease-pneumonia"
              onClick={handleChangeDisease}
            >
              <span className="label">Pneumonia</span>
              <span className="count">
                {formatDataLength(getTotalCount("pneumonia"), 3)}
              </span>
            </div>
            <div
              className={`tab-item ${
                filters.disease == "covid" ? "active" : ""
              }`}
              id="disease-covid"
              onClick={handleChangeDisease}
            >
              <span className="label">COVID</span>
              <span className="count">
                {formatDataLength(getTotalCount("covid"), 3)}
              </span>
            </div>
            <div
              className={`tab-item ${
                filters.disease == "auri" ? "active" : ""
              }`}
              id="disease-auri"
              onClick={handleChangeDisease}
            >
              <span className="label">AURI</span>
              <span className="count">
                {formatDataLength(getTotalCount("auri"), 3)}
              </span>
            </div>
          </div>
        </div>

        {/* DATA / TRENDS */}
        <div className="sidebar-data">
          {sidebarData.map(({ region, data }, i) => {
            if (filters.region.find((r) => r.label == region))
              return (
                <SidebarDataItem key={i} headerLabel={region} data={data} />
              );
          })}
        </div>
      </div>

      {/* BACKGROUND BLUR */}
      <div
        className={`sidebar-back ${sideAnimate}`}
        onAnimationEnd={handleAnimationEnd}
        onClick={handleOpenSidebar}
      ></div>

      <Map
        filters={filters}
        data={DummyData}
        mapCenter={getCenter}
        printData={printData}
      />

      {showDisclaimer && (
        <Modal
          additionalClasses="z-[12]"
          onConfirm={() => {
            setShowDisclaimer(false);
          }}
          onConfirmLabel="Agree & Continue"
          heading="The data you'll see isn't diagnostic."
          content="The data are based on suspected symptoms collected from social media, not verified by healthcare professionals that tested these areas affected."
          color="primary"
        />
      )}
    </div>
  );
};
export default TrendsMap;
