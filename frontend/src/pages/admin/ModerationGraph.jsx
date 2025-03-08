// import React, { useState, useEffect } from 'react';
// import { itemAPI } from '@/api/item'; // Updated import to use itemAPI
// import {
//   FiBarChart2,
//   FiTrendingUp,
//   FiActivity,
//   FiDollarSign,
//   FiRefreshCw,
//   FiDownload,
// } from 'react-icons/fi';
// import Button from '@/components/adminSharedComp/Button';
// import { H2, H3, H4 } from '@/components/adminSharedComp/Heading';
// import { useTheme } from '@/context/ThemeContext';
// import { Line, Bar, Doughnut } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler,
// } from 'chart.js';

// // Register ChartJS components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   BarElement,
//   ArcElement,
//   Title,
//   Tooltip,
//   Legend,
//   Filler
// );

// const ModerationGraph = () => {
//   const { theme } = useTheme();
//   const [loading, setLoading] = useState(true);
//   const [statsData, setStatsData] = useState({
//     trend: [],
//     byCategory: [],
//     topItems: [],
//     moderationStats: [],
//     activeItems: { count: 0, details: [] },
//     soldItems: { count: 0, details: [] },
//     pendingItems: 0,
//     totals: { totalItems: 0, totalViews: 0, totalInteractions: 0 },
//   });
//   const [period, setPeriod] = useState('30d');
//   const [error, setError] = useState(null);
//   const [chartType, setChartType] = useState('line');

//   // Custom colors for charts
//   const CHART_COLORS = {
//     primary: ['rgba(66, 133, 244, 1)', 'rgba(66, 133, 244, 0.2)'],
//     secondary: ['rgba(219, 68, 55, 1)', 'rgba(219, 68, 55, 0.2)'],
//     tertiary: ['rgba(15, 157, 88, 1)', 'rgba(15, 157, 88, 0.2)'],
//     quaternary: ['rgba(244, 180, 0, 1)', 'rgba(244, 180, 0, 0.2)'],
//     gradient: [
//       'rgba(66, 133, 244, 0.8)',
//       'rgba(219, 68, 55, 0.8)',
//       'rgba(15, 157, 88, 0.8)',
//       'rgba(244, 180, 0, 0.8)',
//       'rgba(103, 58, 183, 0.8)',
//       'rgba(0, 188, 212, 0.8)',
//       'rgba(233, 30, 99, 0.8)',
//       'rgba(139, 195, 74, 0.8)',
//     ],
//   };

//   // Fetch admin stats dashboard data
//   const fetchStats = async () => {
//     setLoading(true);
//     try {
//       const response = await itemAPI.getAdminDashboardStats(period);
//       console.log('Admin Dashboard Stats:', response.data); // Log for debugging
//       setStatsData(response.data); // Set the data field from response
//     } catch (err) {
//       setError(err.message || 'Failed to load statistics');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchStats();
//   }, [period]);

//   // Export chart as image
//   const exportChart = (chartId, filename) => {
//     const canvas = document.getElementById(chartId);
//     if (canvas) {
//       const image = canvas.toDataURL('image/png');
//       const link = document.createElement('a');
//       link.download = `${filename}.png`;
//       link.href = image;
//       link.click();
//     }
//   };

//   // Enhanced chart configurations with animations
//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     animation: {
//       duration: 2000,
//       easing: 'easeOutQuart',
//     },
//     plugins: {
//       legend: {
//         position: 'top',
//         labels: {
//           font: {
//             family: "'Inter', sans-serif",
//             size: 12,
//             weight: 500,
//           },
//           color: theme === 'dark' ? '#e0e0e0' : '#333',
//           padding: 20,
//         },
//       },
//       tooltip: {
//         backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
//         titleColor: theme === 'dark' ? '#fff' : '#333',
//         bodyColor: theme === 'dark' ? '#fff' : '#333',
//         padding: 12,
//         cornerRadius: 8,
//         boxPadding: 6,
//         usePointStyle: true,
//         borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
//         borderWidth: 1,
//         boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
//         caretSize: 6,
//       },
//     },
//     scales: {
//       x: {
//         ticks: {
//           color: theme === 'dark' ? '#e0e0e0' : '#333',
//           font: {
//             family: "'Inter', sans-serif",
//             size: 11,
//           },
//         },
//         grid: {
//           display: false,
//           color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
//         },
//       },
//       y: {
//         ticks: {
//           color: theme === 'dark' ? '#e0e0e0' : '#333',
//           font: {
//             family: "'Inter', sans-serif",
//             size: 11,
//           },
//           padding: 10,
//         },
//         grid: {
//           color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
//           drawBorder: false,
//         },
//         beginAtZero: true,
//       },
//     },
//     elements: {
//       point: {
//         radius: 4,
//         hoverRadius: 6,
//         borderWidth: 2,
//         hoverBorderWidth: 3,
//       },
//       line: {
//         tension: 0.4, // Smoother curves
//       },
//       bar: {
//         borderRadius: 6,
//       },
//     },
//   };

//   // Trend Chart Data
//   const trendChartData = {
//     labels:
//       statsData?.trend?.map((day) => {
//         if (!day || !day._id) return '';
//         const date = new Date(day._id);
//         return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//       }) || [],
//     datasets: [
//       {
//         label: 'Views',
//         data: statsData?.trend?.map((day) => day?.views || 0) || [],
//         borderColor: CHART_COLORS.primary[0],
//         backgroundColor: CHART_COLORS.primary[1],
//         fill: true,
//         pointBackgroundColor: '#fff',
//         pointBorderColor: CHART_COLORS.primary[0],
//       },
//       {
//         label: 'Phones',
//         data: statsData?.trend?.map((day) => day?.phones || 0) || [],
//         borderColor: CHART_COLORS.tertiary[0],
//         backgroundColor: CHART_COLORS.tertiary[1],
//         fill: true,
//         pointBackgroundColor: '#fff',
//         pointBorderColor: CHART_COLORS.tertiary[0],
//       },
//       {
//         label: 'Chats',
//         data: statsData?.trend?.map((day) => day?.chats || 0) || [],
//         borderColor: CHART_COLORS.quaternary[0],
//         backgroundColor: CHART_COLORS.quaternary[1],
//         fill: true,
//         pointBackgroundColor: '#fff',
//         pointBorderColor: CHART_COLORS.quaternary[0],
//       },
//     ],
//   };

//   // Category Distribution Chart (Doughnut)
//   const categoryChartData = {
//     labels: statsData?.byCategory?.map((cat) => cat?.name || 'Unknown') || [],
//     datasets: [
//       {
//         data: statsData?.byCategory?.map((cat) => cat?.interactions || 0) || [],
//         backgroundColor: CHART_COLORS.gradient,
//         borderColor: theme === 'dark' ? 'rgba(30,30,30,0.8)' : '#fff',
//         borderWidth: 2,
//         hoverOffset: 10,
//         borderRadius: 4,
//       },
//     ],
//   };

//   // Top Items Chart (Bar)
//   const topItemsChartData = {
//     labels:
//       statsData?.topItems?.map((item) => {
//         if (!item || !item.title) return 'Unknown';
//         return item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title;
//       }) || [],
//     datasets: [
//       {
//         label: 'Views',
//         data: statsData?.topItems?.map((item) => item?.views || 0) || [],
//         backgroundColor: CHART_COLORS.primary[0],
//         borderRadius: 6,
//       },
//       {
//         label: 'Interactions',
//         data: statsData?.topItems?.map((item) => item?.interactions || 0) || [],
//         backgroundColor: CHART_COLORS.quaternary[0],
//         borderRadius: 6,
//       },
//     ],
//   };

//   // Moderator Performance Chart (Bar)
//   const moderatorChartData = {
//     labels: statsData?.moderationStats?.map((mod) => mod?.moderator || 'Unknown') || [],
//     datasets: [
//       {
//         label: 'Approved',
//         data: statsData?.moderationStats?.map((mod) => mod?.approved || 0) || [],
//         backgroundColor: CHART_COLORS.tertiary[0],
//         borderRadius: 6,
//       },
//       {
//         label: 'Rejected',
//         data: statsData?.moderationStats?.map((mod) => mod?.rejected || 0) || [],
//         backgroundColor: CHART_COLORS.secondary[0],
//         borderRadius: 6,
//       },
//     ],
//   };

//   // Format numbers with commas
//   const formatNumber = (num) => {
//     return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';
//   };

//   if (loading)
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="p-6 text-center rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
//         <div className="text-red-500 dark:text-red-400 text-lg font-medium">Error: {error}</div>
//         <Button className="mt-4" onClick={fetchStats}>
//           <FiRefreshCw className="mr-2" />
//           Try Again
//         </Button>
//       </div>
//     );

//   return (
//     <div className="container px-4 py-8">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
//         <div>
//           <H2 className="">Moderation Analytics Dashboard</H2>
//           <p className="text-gray-500 dark:text-gray-400 mt-2">
//             Comprehensive view of your marketplace statistics and moderation activities
//           </p>
//         </div>
//         <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
//           <Button
//             variant={period === '7d' ? 'primary' : 'outline'}
//             onClick={() => setPeriod('7d')}
//             className="transition-all duration-200 ease-out"
//           >
//             7 Days
//           </Button>
//           <Button
//             variant={period === '30d' ? 'primary' : 'outline'}
//             onClick={() => setPeriod('30d')}
//             className="transition-all duration-200 ease-out"
//           >
//             30 Days
//           </Button>
//           <Button
//             variant={period === '90d' ? 'primary' : 'outline'}
//             onClick={() => setPeriod('90d')}
//             className="transition-all duration-200 ease-out"
//           >
//             90 Days
//           </Button>
//           <Button
//             variant="outline"
//             onClick={fetchStats}
//             className="ml-2"
//             aria-label="Refresh data"
//           >
//             <FiRefreshCw className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div
//         className={`bg-${
//           theme === 'dark' ? 'admin.cardDark' : 'admin.card'
//         } rounded-xl shadow-xl border border-${
//           theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//         } p-6 transition-all duration-300`}
//       >
//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           <div
//             className={`p-6 rounded-xl border border-${
//               theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//             } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1`}
//           >
//             <div className="flex items-center gap-3">
//               <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
//                 <FiBarChart2 className="text-blue-600 dark:text-blue-400 h-6 w-6" />
//               </div>
//               <H4 className="text-gray-500 dark:text-gray-400">Pending Items</H4>
//             </div>
//             <p className="text-3xl font-bold mt-3 text-gray-800 dark:text-gray-100">
//               {formatNumber(statsData?.pendingItems)}
//             </p>
//             <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">Awaiting moderation</div>
//           </div>

//           <div
//             className={`p-6 rounded-xl border border-${
//               theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//             } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1`}
//           >
//             <div className="flex items-center gap-3">
//               <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
//                 <FiActivity className="text-green-600 dark:text-green-400 h-6 w-6" />
//               </div>
//               <H4 className="text-gray-500 dark:text-gray-400">Active Items</H4>
//             </div>
//             <p className="text-3xl font-bold mt-3 text-gray-800 dark:text-gray-100">
//               {formatNumber(statsData?.activeItems?.count)}
//             </p>
//             <div className="mt-2 text-sm text-green-600 dark:text-green-400">Live on marketplace</div>
//           </div>

//           <div
//             className={`p-6 rounded-xl border border-${
//               theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//             } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1`}
//           >
//             <div className="flex items-center gap-3">
//               <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
//                 <FiDollarSign className="text-yellow-600 dark:text-yellow-400 h-6 w-6" />
//               </div>
//               <H4 className="text-gray-500 dark:text-gray-400">Sold Items</H4>
//             </div>
//             <p className="text-3xl font-bold mt-3 text-gray-800 dark:text-gray-100">
//               {formatNumber(statsData?.soldItems?.count)}
//             </p>
//             <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
//               Completed transactions
//             </div>
//           </div>

//           <div
//             className={`p-6 rounded-xl border border-${
//               theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//             } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1`}
//           >
//             <div className="flex items-center gap-3">
//               <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
//                 <FiTrendingUp className="text-purple-600 dark:text-purple-400 h-6 w-6" />
//               </div>
//               <H4 className="text-gray-500 dark:text-gray-400">Total Views</H4>
//             </div>
//             <p className="text-3xl font-bold mt-3 text-gray-800 dark:text-gray-100">
//               {formatNumber(statsData?.totals?.totalViews)}
//             </p>
//             <div className="mt-2 text-sm text-purple-600 dark:text-purple-400">
//               Across all marketplace
//             </div>
//           </div>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
//           {/* Trend Chart with Chart Type Selector */}
//           <div
//             className={`p-6 rounded-xl border border-${
//               theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//             } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}
//           >
//             <div className="flex justify-between items-center mb-6">
//               <H3 className="font-semibold">Interaction Trends</H3>
//               <div className="flex gap-2">
//                 <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
//                   <button
//                     className={`px-3 py-1 text-xs ${
//                       chartType === 'line'
//                         ? 'bg-primary text-white'
//                         : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
//                     }`}
//                     onClick={() => setChartType('line')}
//                   >
//                     Line
//                   </button>
//                   <button
//                     className={`px-3 py-1 text-xs ${
//                       chartType === 'bar'
//                         ? 'bg-primary text-white'
//                         : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
//                     }`}
//                     onClick={() => setChartType('bar')}
//                   >
//                     Bar
//                   </button>
//                 </div>
//                 <button
//                   onClick={() => exportChart('trends-chart', 'trends-export')}
//                   className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
//                   aria-label="Download chart"
//                 >
//                   <FiDownload className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//             <div className="h-80">
//               {chartType === 'line' ? (
//                 <Line id="trends-chart" data={trendChartData} options={chartOptions} />
//               ) : (
//                 <Bar id="trends-chart" data={trendChartData} options={chartOptions} />
//               )}
//             </div>
//           </div>

//           {/* Category Distribution */}
//           <div
//             className={`p-6 rounded-xl border border-${
//               theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//             } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}
//           >
//             <div className="flex justify-between items-center mb-6">
//               <H3 className="font-semibold">Category Distribution</H3>
//               <button
//                 onClick={() => exportChart('category-chart', 'categories-export')}
//                 className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
//                 aria-label="Download chart"
//               >
//                 <FiDownload className="h-4 w-4" />
//               </button>
//             </div>
//             <div className="h-80">
//               <Doughnut
//                 id="category-chart"
//                 data={categoryChartData}
//                 options={{
//                   ...chartOptions,
//                   cutout: '65%',
//                   plugins: {
//                     ...chartOptions.plugins,
//                     legend: {
//                       ...chartOptions.plugins.legend,
//                       position: 'bottom',
//                     },
//                   },
//                 }}
//               />
//             </div>
//           </div>

//           {/* Top Items */}
//           <div
//             className={`p-6 rounded-xl border border-${
//               theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//             } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}
//           >
//             <div className="flex justify-between items-center mb-6">
//               <H3 className="font-semibold">Top Performing Items</H3>
//               <button
//                 onClick={() => exportChart('items-chart', 'top-items-export')}
//                 className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
//                 aria-label="Download chart"
//               >
//                 <FiDownload className="h-4 w-4" />
//               </button>
//             </div>
//             <div className="h-80">
//               <Bar
//                 id="items-chart"
//                 data={topItemsChartData}
//                 options={{
//                   ...chartOptions,
//                   indexAxis: 'y',
//                   barPercentage: 0.7,
//                   categoryPercentage: 0.8,
//                 }}
//               />
//             </div>
//           </div>

//           {/* Moderator Performance */}
//           <div
//             className={`p-6 rounded-xl border border-${
//               theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//             } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}
//           >
//             <div className="flex justify-between items-center mb-6">
//               <H3 className="font-semibold">Moderator Performance</H3>
//               <button
//                 onClick={() => exportChart('moderator-chart', 'moderator-export')}
//                 className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
//                 aria-label="Download chart"
//               >
//                 <FiDownload className="h-4 w-4" />
//               </button>
//             </div>
//             <div className="h-80">
//               <Bar
//                 id="moderator-chart"
//                 data={moderatorChartData}
//                 options={{
//                   ...chartOptions,
//                   barPercentage: 0.6,
//                   categoryPercentage: 0.8,
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* Active Items Table */}
//         <div
//           className={`p-6 rounded-xl border border-${
//             theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//           } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 mb-8`}
//         >
//           <H3 className="mb-6 font-semibold">Top Active Items</H3>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead
//                 className={`border-b-2 border-${
//                   theme === 'dark' ? 'gray-700' : 'gray-200'
//                 } text-${theme === 'dark' ? 'gray-300' : 'gray-600'}`}
//               >
//                 <tr>
//                   <th className="p-4 text-left font-medium">Title</th>
//                   <th className="p-4 text-right font-medium">Views</th>
//                   <th className="p-4 text-right font-medium">Phones</th>
//                   <th className="p-4 text-right font-medium">Chats</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {statsData?.activeItems?.details?.map((item, index) => (
//                   <tr
//                     key={item?._id || index}
//                     className={`border-b border-${
//                       theme === 'dark' ? 'gray-700' : 'gray-200'
//                     } hover:bg-${theme === 'dark' ? 'gray-800/50' : 'gray-50'} transition-colors duration-150`}
//                   >
//                     <td className="p-4 font-medium">{item?.title || 'Untitled'}</td>
//                     <td className="p-4 text-right">{formatNumber(item?.views)}</td>
//                     <td className="p-4 text-right">{formatNumber(item?.phones)}</td>
//                     <td className="p-4 text-right">{formatNumber(item?.chats)}</td>
//                   </tr>
//                 ))}
//                 {(!statsData?.activeItems?.details || statsData.activeItems.details.length === 0) && (
//                   <tr>
//                     <td colSpan="4" className="p-4 text-center text-gray-500">
//                       No active items data available
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Sold Items Table */}
//         <div
//           className={`p-6 rounded-xl border border-${
//             theme === 'dark' ? 'admin.borderDark' : 'admin.border'
//           } bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}
//         >
//           <H3 className="mb-6 font-semibold">Recently Sold Items</H3>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead
//                 className={`border-b-2 border-${
//                   theme === 'dark' ? 'gray-700' : 'gray-200'
//                 } text-${theme === 'dark' ? 'gray-300' : 'gray-600'}`}
//               >
//                 <tr>
//                   <th className="p-4 text-left font-medium">Title</th>
//                   <th className="p-4 text-right font-medium">Views</th>
//                   <th className="p-4 text-right font-medium">Phones</th>
//                   <th className="p-4 text-right font-medium">Chats</th>
//                   <th className="p-4 text-right font-medium">Sold Date</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {statsData?.soldItems?.details?.map((item, index) => (
//                   <tr
//                     key={item?._id || index}
//                     className={`border-b border-${
//                       theme === 'dark' ? 'gray-700' : 'gray-200'
//                     } hover:bg-${theme === 'dark' ? 'gray-800/50' : 'gray-50'} transition-colors duration-150`}
//                   >
//                     <td className="p-4 font-medium">{item?.title || 'Untitled'}</td>
//                     <td className="p-4 text-right">{formatNumber(item?.views)}</td>
//                     <td className="p-4 text-right">{formatNumber(item?.phones)}</td>
//                     <td className="p-4 text-right">{formatNumber(item?.chats)}</td>
//                     <td className="p-4 text-right">
//                       <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
//                         {new Date(item?.soldAt).toLocaleDateString()}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//                 {(!statsData?.soldItems?.details || statsData.soldItems.details.length === 0) && (
//                   <tr>
//                     <td colSpan="5" className="p-4 text-center text-gray-500">
//                       No sold items data available
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ModerationGraph;

// export default ModerationGraph;

import React, { useState, useEffect } from 'react';
import { itemAPI } from '@/api/item';
import {
  FiBarChart2,
  FiTrendingUp,
  FiActivity,
  FiDollarSign,
  FiRefreshCw,
  FiDownload,
} from 'react-icons/fi';
import Button from '@/components/adminSharedComp/Button';
import { H2, H3, H4 } from '@/components/adminSharedComp/Heading';
import { useTheme } from '@/context/ThemeContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Skeleton Component
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

const ModerationGraph = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    trend: [],
    byCategory: [],
    topItems: [],
    moderationStats: [],
    activeItems: { count: 0, details: [] },
    soldItems: { count: 0, details: [] },
    pendingItems: 0,
    totals: { totalItems: 0, totalViews: 0, totalInteractions: 0 },
  });
  const [period, setPeriod] = useState('30d');
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('line');

  // Fetch admin stats dashboard data
  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await itemAPI.getAdminDashboardStats(period);
      console.log(response.data);
      setStatsData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [period]);

  // Export chart as image
  const exportChart = (chartId, filename) => {
    const canvas = document.getElementById(chartId);
    if (canvas) {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = image;
      link.click();
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 500,
          },
          color: theme === 'dark' ? '#e0e0e0' : '#333',
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: theme === 'dark' ? '#fff' : '#333',
        bodyColor: theme === 'dark' ? '#fff' : '#333',
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: theme === 'dark' ? '#e0e0e0' : '#333' },
        grid: { display: false, color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: { color: theme === 'dark' ? '#e0e0e0' : '#333', padding: 10 },
        grid: { color: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', drawBorder: false },
        beginAtZero: true,
      },
    },
    elements: {
      point: { radius: 4, hoverRadius: 6, borderWidth: 2, hoverBorderWidth: 3 },
      line: { tension: 0.4 },
      bar: { borderRadius: 6 },
    },
  };

  // Trend Chart Data using Tailwind chart colors
  const trendChartData = {
    labels: statsData?.trend?.map((day) => 
      day?._id ? new Date(day._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
    ) || [],
    datasets: [
      {
        label: 'Views',
        data: statsData?.trend?.map((day) => day?.views || 0) || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#3B82F6',
      },
      {
        label: 'Phones',
        data: statsData?.trend?.map((day) => day?.phones || 0) || [],
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#22C55E',
      },
      {
        label: 'Chats',
        data: statsData?.trend?.map((day) => day?.chats || 0) || [],
        borderColor: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.2)',
        fill: true,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#F97316',
      },
    ],
  };

  // Category Distribution Chart (Doughnut)
  const categoryChartData = {
    labels: statsData?.byCategory?.map((cat) => cat?.name || 'Unknown') || [],
    datasets: [
      {
        data: statsData?.byCategory?.map((cat) => cat?.interactions || 0) || [],
        backgroundColor: [
          '#3B82F6',
          '#22C55E',
          '#8B5CF6',
          '#F97316',
          '#EC4899',
          '#14B8A6',
          '#FACC15',
          '#EF4444',
        ],
        borderColor: theme === 'dark' ? 'rgba(30,30,30,0.8)' : '#fff',
        borderWidth: 2,
        hoverOffset: 10,
        borderRadius: 4,
      },
    ],
  };

  // Top Items Chart (Bar)
  const topItemsChartData = {
    labels: statsData?.topItems?.map((item) => 
      item?.title ? (item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title) : 'Unknown'
    ) || [],
    datasets: [
      {
        label: 'Views',
        data: statsData?.topItems?.map((item) => item?.views || 0) || [],
        backgroundColor: '#3B82F6',
        borderRadius: 6,
      },
      {
        label: 'Interactions',
        data: statsData?.topItems?.map((item) => item?.interactions || 0) || [],
        backgroundColor: '#FACC15',
        borderRadius: 6,
      },
    ],
  };

  // Moderator Performance Chart (Bar)
  const moderatorChartData = {
    labels: statsData?.moderationStats?.map((mod) => mod?.moderator || 'Unknown') || [],
    datasets: [
      {
        label: 'Approved',
        data: statsData?.moderationStats?.map((mod) => mod?.approved || 0) || [],
        backgroundColor: '#22C55E',
        borderRadius: 6,
      },
      {
        label: 'Rejected',
        data: statsData?.moderationStats?.map((mod) => mod?.rejected || 0) || [],
        backgroundColor: '#EF4444',
        borderRadius: 6,
      },
    ],
  };

  // Format numbers with commas
  const formatNumber = (num) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') || '0';

  if (loading) return (
    <div className="container px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-6 rounded-xl border bg-white dark:bg-gray-800 shadow-md">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-24 mt-3" />
            <Skeleton className="h-4 w-40 mt-2" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-6 rounded-xl border bg-white dark:bg-gray-800 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        ))}
      </div>

      {/* Tables Skeleton */}
      {[...Array(2)].map((_, index) => (
        <div key={index} className="p-6 rounded-xl border bg-white dark:bg-gray-800 shadow-md mb-8">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  {[...Array(5)].map((_, i) => (
                    <th key={i} className="p-4">
                      <Skeleton className="h-4 w-20" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="p-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  if (error) return (
    <div className="p-6 text-center rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <div className="text-red-500 dark:text-red-400 text-lg font-medium">Error: {error}</div>
      <Button className="mt-4" onClick={fetchStats}>
        <FiRefreshCw className="mr-2" />
        Try Again
      </Button>
    </div>
  );

  return (
    <div className="container px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <H2 className="">Moderation Analytics Dashboard</H2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Comprehensive view of your marketplace statistics and moderation activities
          </p>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <Button variant={period === '7d' ? 'primary' : 'outline'} onClick={() => setPeriod('7d')}>
            7 Days
          </Button>
          <Button variant={period === '30d' ? 'primary' : 'outline'} onClick={() => setPeriod('30d')}>
            30 Days
          </Button>
          <Button variant={period === '90d' ? 'primary' : 'outline'} onClick={() => setPeriod('90d')}>
            90 Days
          </Button>
          <Button variant="outline" onClick={fetchStats} className="ml-2" aria-label="Refresh data">
            <FiRefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <FiBarChart2 className="text-blue-600 dark:text-blue-400 h-6 w-6" />
            </div>
            <H4 className="text-gray-500 dark:text-gray-400">Pending Items</H4>
          </div>
          <p className="text-3xl font-bold mt-3 text-gray-800 dark:text-gray-100">{formatNumber(statsData?.pendingItems)}</p>
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">Awaiting moderation</div>
        </div>

        <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <FiActivity className="text-green-600 dark:text-green-400 h-6 w-6" />
            </div>
            <H4 className="text-gray-500 dark:text-gray-400">Active Items</H4>
          </div>
          <p className="text-3xl font-bold mt-3 text-gray-800 dark:text-gray-100">{formatNumber(statsData?.activeItems?.count)}</p>
          <div className="mt-2 text-sm text-green-600 dark:text-green-400">Live on marketplace</div>
        </div>

        <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
              <FiDollarSign className="text-yellow-600 dark:text-yellow-400 h-6 w-6" />
            </div>
            <H4 className="text-gray-500 dark:text-gray-400">Sold Items</H4>
          </div>
          <p className="text-3xl font-bold mt-3 text-gray-800 dark:text-gray-100">{formatNumber(statsData?.soldItems?.count)}</p>
          <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">Completed transactions</div>
        </div>

        <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1`}>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <FiTrendingUp className="text-purple-600 dark:text-purple-400 h-6 w-6" />
            </div>
            <H4 className="text-gray-500 dark:text-gray-400">Total Views</H4>
          </div>
          <p className="text-3xl font-bold mt-3 text-gray-800 dark:text-gray-100">{formatNumber(statsData?.totals?.totalViews)}</p>
          <div className="mt-2 text-sm text-purple-600 dark:text-purple-400">Across all marketplace</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <H3 className="font-semibold">Interaction Trends</H3>
            <div className="flex gap-2">
              <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
                <button
                  className={`px-3 py-1 text-xs ${chartType === 'line' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setChartType('line')}
                >
                  Line
                </button>
                <button
                  className={`px-3 py-1 text-xs ${chartType === 'bar' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </button>
              </div>
              <button onClick={() => exportChart('trends-chart', 'trends-export')} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" aria-label="Download chart">
                <FiDownload className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="h-80">
            {chartType === 'line' ? (
              <Line id="trends-chart" data={trendChartData} options={chartOptions} />
            ) : (
              <Bar id="trends-chart" data={trendChartData} options={chartOptions} />
            )}
          </div>
        </div>

        <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <H3 className="font-semibold">Category Distribution</H3>
            <button onClick={() => exportChart('category-chart', 'categories-export')} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" aria-label="Download chart">
              <FiDownload className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <Doughnut
              id="category-chart"
              data={categoryChartData}
              options={{
                ...chartOptions,
                cutout: '65%',
                plugins: { ...chartOptions.plugins, legend: { ...chartOptions.plugins.legend, position: 'bottom' } },
              }}
            />
          </div>
        </div>

        <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <H3 className="font-semibold">Top Performing Items</H3>
            <button onClick={() => exportChart('items-chart', 'top-items-export')} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" aria-label="Download chart">
              <FiDownload className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <Bar id="items-chart" data={topItemsChartData} options={{ ...chartOptions, indexAxis: 'y', barPercentage: 0.7, categoryPercentage: 0.8 }} />
          </div>
        </div>

        <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}>
          <div className="flex justify-between items-center mb-6">
            <H3 className="font-semibold">Moderator Performance</H3>
            <button onClick={() => exportChart('moderator-chart', 'moderator-export')} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500" aria-label="Download chart">
              <FiDownload className="h-4 w-4" />
            </button>
          </div>
          <div className="h-80">
            <Bar id="moderator-chart" data={moderatorChartData} options={{ ...chartOptions, barPercentage: 0.6, categoryPercentage: 0.8 }} />
          </div>
        </div>
      </div>

      {/* Active Items Table */}
      <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300 mb-8`}>
        <H3 className="mb-6 font-semibold">Top Active Items</H3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b-2 border-${theme === 'dark' ? 'gray-700' : 'gray-200'} text-${theme === 'dark' ? 'gray-300' : 'gray-600'}`}>
              <tr>
                <th className="p-4 text-left font-medium">Title</th>
                <th className="p-4 text-right font-medium">Views</th>
                <th className="p-4 text-right font-medium">Phones</th>
                <th className="p-4 text-right font-medium">Chats</th>
              </tr>
            </thead>
            <tbody>
              {statsData?.activeItems?.details?.map((item, index) => (
                <tr key={item?._id || index} className={`border-b border-${theme === 'dark' ? 'gray-700' : 'gray-200'} hover:bg-${theme === 'dark' ? 'gray-800/50' : 'gray-50'} transition-colors duration-150`}>
                  <td className="p-4 font-medium">{item?.title || 'Untitled'}</td>
                  <td className="p-4 text-right">{formatNumber(item?.views)}</td>
                  <td className="p-4 text-right">{formatNumber(item?.phones)}</td>
                  <td className="p-4 text-right">{formatNumber(item?.chats)}</td>
                </tr>
              ))}
              {(!statsData?.activeItems?.details || statsData.activeItems.details.length === 0) && (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">No active items data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sold Items Table */}
      <div className={`p-6 rounded-xl border border-${theme === 'dark' ? 'admin.borderDark' : 'admin.border'} bg-${theme === 'dark' ? 'admin.cardDark' : 'white'} shadow-md hover:shadow-lg transition-all duration-300`}>
        <H3 className="mb-6 font-semibold">Recently Sold Items</H3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`border-b-2 border-${theme === 'dark' ? 'gray-700' : 'gray-200'} text-${theme === 'dark' ? 'gray-300' : 'gray-600'}`}>
              <tr>
                <th className="p-4 text-left font-medium">Title</th>
                <th className="p-4 text-right font-medium">Views</th>
                <th className="p-4 text-right font-medium">Phones</th>
                <th className="p-4 text-right font-medium">Chats</th>
                <th className="p-4 text-right font-medium">Sold Date</th>
              </tr>
            </thead>
            <tbody>
              {statsData?.soldItems?.details?.map((item, index) => (
                <tr key={item?._id || index} className={`border-b border-${theme === 'dark' ? 'gray-700' : 'gray-200'} hover:bg-${theme === 'dark' ? 'gray-800/50' : 'gray-50'} transition-colors duration-150`}>
                  <td className="p-4 font-medium">{item?.title || 'Untitled'}</td>
                  <td className="p-4 text-right">{formatNumber(item?.views)}</td>
                  <td className="p-4 text-right">{formatNumber(item?.phones)}</td>
                  <td className="p-4 text-right">{formatNumber(item?.chats)}</td>
                  <td className="p-4 text-right">
                    <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {new Date(item?.soldAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
              {(!statsData?.soldItems?.details || statsData.soldItems.details.length === 0) && (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">No sold items data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModerationGraph;