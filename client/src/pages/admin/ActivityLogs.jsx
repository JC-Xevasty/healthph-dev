import { NavLink } from "react-router-dom";
import Icon from "../../components/Icon";
import Input from "../../components/Input";
import { useEffect, useState } from "react";
import X from "../../test.json";
import Datatable from "../../components/admin/Datatable";
import { useFetchActivityLogsQuery } from "../../features/api/activityLogsSlice";
import { format } from "date-fns";
import SkeletonTable from "../../components/SkeletonTable";
import EmptyState from "../../components/admin/EmptyState";
import Highlighter from "react-highlight-words";

const ActivityLogs = () => {
  const [search, setSearch] = useState("");

  const {
    data: activity_logs,
    error,
    isSuccess,
    isError,
    isLoading,
  } = useFetchActivityLogsQuery();

  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (activity_logs) {
      setRows(activity_logs);
    }
  }, [activity_logs, isLoading]);

  useEffect(() => {
    if (activity_logs) {
      let searches = search.split(" ");
      searches = searches.filter((s) => s.length > 0);

      const filteredRows = activity_logs.filter((log) => {
        return searches.some((s) => {
          const reg = new RegExp("^.*" + s + ".*$", "i");
          if (
            reg.test(log["user_name"]) ||
            reg.test(log["entry"]) ||
            reg.test(log["module"])
          ) {
            return true;
          }
        });
      });

      setRows(search.length > 0 ? filteredRows : activity_logs);
    }
  }, [search]);

  useEffect(() => {
    console.log("rows", rows.length);
  }, [rows]);

  return (
    <>
      {isLoading ? (
        <SkeletonTable columns={9} />
      ) : (
        <div className="admin-wrapper flex flex-col h-full">
          <div className="header items-start sm:items-center flex-col sm:flex-row">
            <div className="breadcrumbs-wrapper">
              <div className="breadcrumb-item">
                <NavLink to="/dashboard/activity-logs">Activity Logs</NavLink>
                <Icon
                  iconName="ChevronRight"
                  height="16px"
                  width="16px"
                  fill="#A1ACB8"
                  className="icon"
                />
              </div>
            </div>
            <div className="flex items-center mt-[20px] sm:mt-0">
              <Input
                size="input-md"
                id="search"
                additionalClasses="w-full max-w-[328px]"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leadingIcon="Search"
                trailingIcon={search.length > 0 ? "Close" : undefined}
                onClickTrailing={
                  search.length > 0 ? () => setSearch("") : undefined
                }
              />
              <button className="prod-btn-base prod-btn-secondary flex justify-center items-center ms-[16px]">
                <span>Print</span>

                <Icon
                  iconName="Printer"
                  height="20px"
                  width="20px"
                  fill="#8693A0"
                  className="ms-[8px]"
                />
              </button>
            </div>
          </div>
          <div className="content">
            <Datatable
              datatableHeader="User Activities"
              datatableColumns={[
                { label: "User" },
                { label: "Entry", tooltip: "Sample tooltip" },
                { label: "Module" },
                { label: "Logged At" },
              ]}
              datatableData={activity_logs}
              setDatatableData={setRows}
              rowsPerPage={10}
              search={search}
            >
              {activity_logs.length > 0 ? (
                rows.length > 0 ? (
                  rows.map(({ user_name, entry, module, created_at }, i) => {
                    const searchWords = search
                      .split(" ")
                      .filter((s) => s.length > 0);
                    return (
                      <div className="content-row" key={i}>
                        <div className="row-item">
                          <Highlighter
                            highlightClassName="bg-[#FFE81A] text-[#000] font-medium rounded-[2px] p-[2px]"
                            searchWords={searchWords}
                            autoEscape={true}
                            textToHighlight={user_name}
                          />
                        </div>
                        <div className="row-item">
                          <Highlighter
                            highlightClassName="bg-[#FFE81A] text-[#000] font-medium rounded-[2px] p-[2px]"
                            searchWords={searchWords}
                            autoEscape={true}
                            textToHighlight={entry}
                          />
                        </div>
                        <div className="row-item">
                          <Highlighter
                            highlightClassName="bg-[#FFE81A] text-[#000] font-medium rounded-[2px] p-[2px]"
                            searchWords={searchWords}
                            autoEscape={true}
                            textToHighlight={module}
                          />
                        </div>
                        <div className="row-item">
                          {format(new Date(created_at), "MMM-dd-yyyy KK:mm a")}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  search != "" && (
                    <EmptyState
                      iconName="Search"
                      heading="No Results Found"
                      content="We couldn't find any matches for your search. Please try adjusting your search terms or criteria."
                    >
                      <button
                        className="prod-btn-base prod-btn-secondary flex justify-center items-center"
                        onClick={() => setSearch("")}
                      >
                        <span>Clear Search</span>
                      </button>
                    </EmptyState>
                  )
                )
              ) : (
                <EmptyState
                  iconName="ActivityLog"
                  heading="No Activities Logged"
                  content="Activities and actions will be recorded here to help you track engagement and progress."
                />
              )}
            </Datatable>
          </div>
        </div>
      )}
    </>
  );
};
export default ActivityLogs;