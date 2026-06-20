// Sidebar with larger image + text beside (like a logo + label)
export const SkeletonSidebarImageWithText = () => (
  <div className="flex items-center gap-4 p-2 animate-pulse">
    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
    <div className="h-2 w-20 bg-gray-200 rounded"></div>
  </div>
);

// Breadcrumbs
export const SkeletonBreadcrumbs = () => (
  <div className="flex items-center gap-2 animate-pulse">
    <div className="h-4 w-16 bg-gray-200 rounded"></div>
  </div>
);

// Tabs
export const SkeletonTabs = () => (
  <div className="flex gap-4 animate-pulse">
    <div className="h-8 w-24 bg-gray-200 rounded-md"></div>
  </div>
);

// Filters
export const SkeletonFilters = () => (
  <div className="flex gap-4 animate-pulse">
    <div className="h-10 w-48 bg-gray-200 rounded-md"></div>
  </div>
);

// User Profile
export const SkeletonUserProfile = () => (
  <div className="flex items-center justify-between animate-pulse w-full max-w-md">
    {/* Avatar + Name */}
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200"></div>
      <div className="space-y-2">
        <div className="h-2 w-24 bg-gray-200 rounded"></div>
        <div className="h-3 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Logout / Icon */}
    <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
  </div>
);


// Input field
export const SkeletonInputField = () => (
  <div className="space-y-2 animate-pulse">
    <div className="h-4 w-24 bg-gray-200 rounded"></div>
    <div className="h-10 w-full bg-gray-200 rounded-md"></div>
  </div>
);

// Dropdown
export const SkeletonDropdown = () => (
  <div className="space-y-1 animate-pulse">
    <div className="h-4 w-20 bg-gray-200 rounded"></div>
    <div className="h-10 w-60 bg-gray-200 rounded-md"></div>
  </div>
);

// Image
export const SkeletonImage = () => (
  <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse"></div>
);

// Table 
export const SkeletonTableWithHeader = () => (
  <div className="w-full rounded-lg overflow-hidden animate-pulse space-y-4">
    {/* Rows */}
    {[...Array(4)].map((_, rowIndex) => (
      <div key={rowIndex} className="grid grid-cols-5 gap-4 px-4">
        {[...Array(5)].map((_, cellIndex) => (
          <div key={cellIndex} className="h-2 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    ))}
  </div>
);

// Card
export const SkeletonCard = () => (
  <div className="w-full max-w-sm p-4 bg-white border rounded-lg shadow animate-pulse">
    <div className="h-40 bg-gray-200 rounded mb-4"></div>
    <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
  </div>
);

// Plain Text 
export const SkeletonPlainText = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
    <div className="h-4 w-full bg-gray-200 rounded"></div>
    <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
  </div>
);

// Bar Chart
export const SkeletonBarChart = () => (
  <div className="h-48 w-full flex items-end gap-2 animate-pulse">
    {[30, 50, 70, 100, 60, 80, 40].map((height, i) => (
      <div
        key={i}
        className="bg-gray-200 rounded w-6"
        style={{ height: `${height}%` }}
      ></div>
    ))}
  </div>
);

// Line Chart
export const SkeletonLineChart = () => {
  const points = [40, 50, 30, 80, 130, 45, 65];

  return (
    <div className="relative w-full h-48 bg-gray-100 rounded-lg animate-pulse px-6 flex items-end justify-between">
      {points.map((height, i) => {
        const prevHeight = points[i - 1] ?? height; // fallback to current height
        const connectorHeight = Math.abs(height - prevHeight);
        const connectorBottom = Math.min(height, prevHeight);

        return (
          <div key={i} className="relative flex flex-col items-center">
            {/* Connector line */}
            {i !== 0 && (
              <div
                className="absolute w-px bg-gray-300"
                style={{
                  height: `${connectorHeight}px`,
                  bottom: `${connectorBottom + 4}px`, // offset for dot radius
                  left: "-8px",
                }}
              />
            )}
            {/* Dot */}
            <div
              className="w-3 h-3 bg-gray-400 rounded-full"
              style={{ marginBottom: `${height}px` }}
            />
          </div>
        );
      })}
    </div>
  );
};




// Pie Chart
export const SkeletonPieChart = () => (
  <div className="animate-pulse w-40 h-40 rounded-full bg-gray-200 mx-auto relative">
    <div className="absolute inset-10 rounded-full bg-white"></div>
  </div>
);
