import { forwardRef, useEffect, useState } from "react";

const PrintComponent = forwardRef(
  (
    { pageName, tableName, data, columns, rowsPerPage, dateTable, displayFunc },
    ref
  ) => {
    const [pageData, setPageData] = useState([]);
    useEffect(() => {
      let splitArray = [];

      let currentSubArray = [];

      data.forEach((v, i) => {
        if (currentSubArray.length < rowsPerPage) {
          currentSubArray.push(v);
        }

        if (currentSubArray.length == rowsPerPage || i == data.length - 1) {
          splitArray.push(currentSubArray);
          currentSubArray = [];
        }
      });

      setPageData(splitArray);
    }, [data]);

    const formatDataLength = (value, minDigit) => {
      return value.length > minDigit
        ? value.toString().padStart(minDigit, "0").slice(0, minDigit)
        : value.toString().padStart(minDigit, "0");
    };

    const displayRowRange = (currentPage) => {
      const startIndex =
        data.length == 0 ? 0 : currentPage * rowsPerPage - rowsPerPage + 1;
      const endIndex =
        currentPage * rowsPerPage < data.length
          ? currentPage * rowsPerPage
          : data.length;

      return `Row ${startIndex} - ${endIndex} of ${data.length}`;
    };

    return pageData.length > 0 ? (
      <div className="print-component">
        <div className="print-container" ref={ref}>
          {pageData.map((v, i) => {
            return (
              <div className="page" key={i}>
                <div className="page-header mb-[36px]">
                  <p>{pageName}</p>
                  <p>HealthPH</p>
                </div>
                <div
                  className="page-content"
                  style={{ "--page-columns": columns.length }}
                >
                  <div className="content-header">
                    <div className="flex items-center">
                      <p>{tableName}</p>
                      <span className="ms-[8px]">
                        {formatDataLength(data.length, 3)}
                      </span>
                    </div>
                    <p>As of {dateTable}</p>
                  </div>
                  <div className="row-header">
                    {columns.map((c, i) => {
                      return (
                        <div key={i} className="row-item">
                          {c}
                        </div>
                      );
                    })}
                  </div>
                  {v.map((val, index) => {
                    const displayData = displayFunc(val);
                    return (
                      <div className="row" key={index}>
                        {displayData.map((v, i) => {
                          return (
                            <div key={i} className="row-item">
                              {v}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
                <div className="page-footer mt-[36px]">
                  <p>{displayRowRange(i + 1)}</p>
                  <p>Page {formatDataLength(i + 1, 2)} </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ) : (
      <div className="print-component">
        <div className="print-container" ref={ref}>
          <div className="page">
            <div className="page-header mb-[36px]">
              <p>{pageName}</p>
              <p>HealthPH</p>
            </div>
            <div
              className="page-content"
              style={{ "--page-columns": columns.length }}
            >
              <div className="content-header">
                <div className="flex items-center">
                  <p>{tableName}</p>
                  <span className="ms-[8px]">
                    {formatDataLength(data.length, 3)}
                  </span>
                </div>
                <p>As of {dateTable}</p>
              </div>
              <div className="row-header">
                {columns.map((c, i) => {
                  return (
                    <div key={i} className="row-item">
                      {c}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="page-footer mt-[36px]">
              <p>{displayRowRange(0 + 1)}</p>
              <p>Page {formatDataLength(0 + 1, 2)} </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
export default PrintComponent;
