import React, { useState, useRef, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import { RowGroupingModule } from "@ag-grid-enterprise/row-grouping";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { MenuModule } from "@ag-grid-enterprise/menu";
import { GridChartsModule } from "@ag-grid-enterprise/charts";
import { RangeSelectionModule } from "@ag-grid-enterprise/range-selection";
import { FiltersToolPanelModule } from "@ag-grid-enterprise/filter-tool-panel";
import { ColumnsToolPanelModule } from "@ag-grid-enterprise/column-tool-panel";
import { MultiFilterModule } from "@ag-grid-enterprise/multi-filter";
import { SetFilterModule } from "@ag-grid-enterprise/set-filter";
import "./style.css";

import { LicenseManager } from "ag-grid-enterprise";

//------------- Test code for importing appropriate license key for {production, development} run ---

LicenseManager.setLicenseKey(`${process.env.REACT_APP_LICENCE_KEY}`);
//--------------------------------------------- Test code end ---------------------------------------

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  MenuModule,
  GridChartsModule,
  RowGroupingModule,
  RangeSelectionModule,
  SetFilterModule,
  FiltersToolPanelModule,
  ColumnsToolPanelModule,
  MultiFilterModule,
]);

const barChartCountry = (gridApi) => {
  gridApi.createCrossFilterChart({
    chartType: "column",
    cellRange: {
      columns: ["PLATFORMS", "GENRES"],
    },
    aggFunc: "count",
    chartThemeOverrides: {
      common: {
        title: {
          enabled: true,
          //text: "SCHEDULES BY GENRE",
        },
        legend: {
          enabled: false,
        },
        axes: {
          category: {
            label: {
              rotation: 0,
            },
          },
          number: {},
        },
      },
    },
    chartContainer: document.querySelector("#columnChart"),
  });
};

const pieChartRef = (gridApi) => {
  gridApi.createCrossFilterChart({
    chartType: "pie",
    cellRange: {
      columns: ["PLATFORMS", "OFFERS"],
    },
    aggFunc: "count",

    chartThemeOverrides: {
      column: {
        legend: {
          position: "bottom",
        },
      },
      pie: {
        series: {
          title: {
            enabled: true,
            //text: "SCHEDULES BY GENRE",
          },
          calloutLabel: {
            enabled: true,
          },
        },
      },
    },
    chartContainer: document.querySelector("#pieChart"),
  });
};

// const histChartYear = (gridApi) => {
//   gridApi.createCrossFilterChart({
//     chartType: "bar",
//     cellRange: {
//       columns: ["year", "total"],
//     },
//     aggFunc: "count",
//     chartThemeOverrides: {
//       common: {
//         title: {
//           enabled: true,
//           text: "Total by year",
//         },
//         legend: {
//           enabled: false,
//         },
//       },
//     },
//     chartContainer: document.querySelector("#barChart"),
//   });
// };

const App = () => {
  const gridRef = useRef();

  const [rowData, setRowData] = useState();
  const autoGroupColumnDef = useMemo(() => {
    return {
      minWidth: 200,
    };
  }, []);
  const [columnDefs, setColumnDefs] = useState([
    {
      field: "GENRES",
      aggFunc: "count",
      enableRowGroup: true,
      rowGroup: true,
      width: 150,
      chartDataType: "series",
    },
    { field: "SCHEDULE", chartDataType: "category" },
    {
      field: "OFFERS",
      aggFunc: "count",
      enableRowGroup: true,
      rowGroup: true,
      width: 150,
      chartDataType: "series",
    },
    {
      field: "PLATFORMS",
      width: 150,
      chartDataType: "category",
    },
    { field: "CATEGORY", width: 150, chartDataType: "category" },
    { field: "DURATION", width: 150, chartDataType: "series" },
  ]);

  // DefaultColDef sets props common to all Columns
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      sortable: true,
      filter: "agSetColumnFilter",
      floatingFilter: true,
      resizable: true,
    };
  }, []);

  const onGridReady = useCallback((params) => {
    fetch("ondemand.json")
      .then((resp) => resp.json())
      .then((data) => {
        var withGenreOnly = data.analysis.filter(function (entry) {
          return entry.GENRES !== undefined && entry.CATEGORY !== undefined;
        });
        console.log(withGenreOnly);
        setRowData(withGenreOnly);
      });
  }, []);
  const onFirstDataRendered = useCallback((params) => {
    barChartCountry(params.api);
    pieChartRef(params.api);
    //histChartYear(params.api);
  }, []);
  const sideBar = {
    toolPanels: [
      {
        id: "columns",
        labelDefault: "Columns",
        labelKey: "columns",
        iconKey: "columns",
        toolPanel: "agColumnsToolPanel",
        minWidth: 225,
        maxWidth: 225,
        width: 225,
      },
      {
        id: "filters",
        labelDefault: "Filters",
        labelKey: "filters",
        iconKey: "filter",
        toolPanel: "agFiltersToolPanel",
        minWidth: 180,
        maxWidth: 400,
        width: 250,
      },
    ],
    hiddenByDefault: true,

    position: "right",
    defaultToolPanel: "filters",
  };

  return (
    <div id="containerdiv">
      <div id="grid" className="ag-theme-alpine">
        <AgGridReact
          ref={gridRef}
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          animateRows={true}
          sideBar={sideBar} // Optional - set to 'true' to have rows animate when sorted
          rowSelection="multiple" // Options - allows click selection of rows
          onGridReady={onGridReady}
          rowGroupPanelShow={"always"}
          groupDisplayType={"multipleColumns"} //groupRows
          autoGroupColumnDef={autoGroupColumnDef}
          groupRowsSticky={true}
          enableRangeSelection={true}
          enableRangeHandle={true}
          enableCharts={true}
          onFirstDataRendered={onFirstDataRendered}
        />
      </div>

      <div id="pieChart" className="ag-theme-alpine"></div>

      <div id="barChart" className="ag-theme-alpine"></div>
      <div id="columnChart" className="ag-theme-alpine"></div>
    </div>
  );
};

export default App;
