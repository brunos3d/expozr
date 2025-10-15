// Data processing utilities module for UMD federation

export interface DataRecord {
  id: string;
  timestamp: string;
  value: any;
  type: string;
  metadata?: Record<string, any>;
}

export interface ProcessedData {
  originalCount: number;
  processedCount: number;
  processingTime: number;
  results: DataRecord[];
  summary: Record<string, any>;
}

export interface TransformOptions {
  filterBy?: (record: DataRecord) => boolean;
  sortBy?: keyof DataRecord;
  limit?: number;
  transformValue?: (value: any) => any;
}

export function processData(
  data: any[],
  type: string = "generic"
): ProcessedData {
  const startTime = Date.now();

  const results: DataRecord[] = data.map((item, index) => ({
    id: `${type}_${index + 1}`,
    timestamp: new Date().toISOString(),
    value: item,
    type,
    metadata: {
      index,
      processed: true,
      originalType: typeof item,
    },
  }));

  const processingTime = Date.now() - startTime;

  return {
    originalCount: data.length,
    processedCount: results.length,
    processingTime,
    results,
    summary: {
      averageProcessingTime: processingTime / data.length,
      dataTypes: [...new Set(results.map((r) => typeof r.value))],
      totalSize: JSON.stringify(results).length,
    },
  };
}

export function transformData(
  data: DataRecord[],
  options: TransformOptions = {}
): DataRecord[] {
  let result = [...data];

  // Apply filter
  if (options.filterBy) {
    result = result.filter(options.filterBy);
  }

  // Apply value transformation
  if (options.transformValue) {
    result = result.map((record) => ({
      ...record,
      value: options.transformValue!(record.value),
      metadata: {
        ...record.metadata,
        transformed: true,
      },
    }));
  }

  // Apply sorting
  if (options.sortBy) {
    result.sort((a, b) => {
      const aVal = a[options.sortBy!];
      const bVal = b[options.sortBy!];
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    });
  }

  // Apply limit
  if (options.limit && options.limit > 0) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export function aggregateData(data: DataRecord[]): Record<string, any> {
  const typeGroups = data.reduce(
    (groups, record) => {
      const type = record.type;
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(record);
      return groups;
    },
    {} as Record<string, DataRecord[]>
  );

  const aggregations: Record<string, any> = {};

  for (const [type, records] of Object.entries(typeGroups)) {
    aggregations[type] = {
      count: records.length,
      latestTimestamp: records.reduce(
        (latest, record) =>
          record.timestamp > latest ? record.timestamp : latest,
        records[0]?.timestamp || ""
      ),
      valueTypes: [...new Set(records.map((r) => typeof r.value))],
      sampleValues: records.slice(0, 3).map((r) => r.value),
    };
  }

  return {
    totalRecords: data.length,
    uniqueTypes: Object.keys(typeGroups).length,
    typeBreakdown: aggregations,
    processedAt: new Date().toISOString(),
  };
}

// Default export for UMD compatibility
const DataProcessor = {
  processData,
  transformData,
  aggregateData,
};

export default DataProcessor;

// Log when module is loaded
if (typeof console !== "undefined") {
  console.log("📊 DataProcessor module loaded successfully!");
}
