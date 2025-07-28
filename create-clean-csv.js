const fs = require('fs');

// Vehicle data with proper structure
const vehicles = [
  {
    id: "2000,2000,0,0|7000|2|Fuel Tanker,7000|2 Taylor",
    description: "42.2550407,-83.274622",
    start_location: "42.2550407,-83.274622",
    start_latitude: 42.2550407,
    start_longitude: -83.274622,
    end_location: "42.2550407,-83.274622",
    end_latitude: 42.2550407,
    end_longitude: -83.274622,
    time_window_start: "2025-07-16 08:00:00 EDT",
    time_window_end: "2025-07-16 18:00:00 EDT",
    capacity: "[1, 1, 1, 1, 1]",
    alternative_capacities: "[[4000, 0, 0, 0, 0], [2000, 2000, 0, 0, 0], [2000, 0, 2000, 0, 0], [2000, 0, 0, 2000, 0], [2000, 0, 0, 0, 2000], [0, 4000, 0, 0, 0], [0, 2000, 2000, 0, 0], [0, 2000, 0, 2000, 0], [0, 2000, 0, 0, 2000], [0, 0, 4000, 0, 0], [0, 0, 2000, 2000, 0], [0, 0, 2000, 0, 2000], [0, 0, 0, 4000, 0], [0, 0, 0, 2000, 2000], [0, 0, 0, 0, 4000]]",
    skills: "",
    fixed_cost: 0,
    max_tasks: 0
  },
  {
    id: "2000,2000,0,0|7001|3|Fuel Tanker,7001|3 Taylor",
    description: "42.2550407,-83.274622",
    start_location: "42.2550407,-83.274622",
    start_latitude: 42.2550407,
    start_longitude: -83.274622,
    end_location: "42.2550407,-83.274622",
    end_latitude: 42.2550407,
    end_longitude: -83.274622,
    time_window_start: "2025-07-16 08:00:00 EDT",
    time_window_end: "2025-07-16 18:00:00 EDT",
    capacity: "[1, 1, 1, 1, 1]",
    alternative_capacities: "[[4000, 0, 0, 0, 0], [2000, 2000, 0, 0, 0], [2000, 0, 2000, 0, 0], [2000, 0, 0, 2000, 0], [2000, 0, 0, 0, 2000], [0, 4000, 0, 0, 0], [0, 2000, 2000, 0, 0], [0, 2000, 0, 2000, 0], [0, 2000, 0, 0, 2000], [0, 0, 4000, 0, 0], [0, 0, 2000, 2000, 0], [0, 0, 2000, 0, 2000], [0, 0, 0, 4000, 0], [0, 0, 0, 2000, 2000], [0, 0, 0, 0, 4000]]",
    skills: "",
    fixed_cost: 0,
    max_tasks: 0
  },
  {
    id: "3000,800,0,0|7004|4|Fuel Tanker,7004|4 Taylor",
    description: "42.2550407,-83.274622",
    start_location: "42.2550407,-83.274622",
    start_latitude: 42.2550407,
    start_longitude: -83.274622,
    end_location: "42.2550407,-83.274622",
    end_latitude: 42.2550407,
    end_longitude: -83.274622,
    time_window_start: "2025-07-16 08:00:00 EDT",
    time_window_end: "2025-07-16 18:00:00 EDT",
    capacity: "[1, 1, 1, 1, 1]",
    alternative_capacities: "[[3800, 0, 0, 0, 0], [800, 3000, 0, 0, 0], [800, 0, 3000, 0, 0], [800, 0, 0, 3000, 0], [800, 0, 0, 0, 3000], [3000, 800, 0, 0, 0], [0, 3800, 0, 0, 0], [0, 800, 3000, 0, 0], [0, 800, 0, 3000, 0], [0, 800, 0, 0, 3000], [3000, 0, 800, 0, 0], [0, 3000, 800, 0, 0], [0, 0, 3800, 0, 0], [0, 0, 800, 3000, 0], [0, 0, 800, 0, 3000], [3000, 0, 0, 800, 0], [0, 3000, 0, 800, 0], [0, 0, 3000, 800, 0], [0, 0, 0, 3800, 0], [0, 0, 0, 800, 3000], [3000, 0, 0, 0, 800], [0, 3000, 0, 0, 800], [0, 0, 3000, 0, 800], [0, 0, 0, 3000, 800], [0, 0, 0, 0, 3800]]",
    skills: "",
    fixed_cost: 0,
    max_tasks: 0
  },
  {
    id: "3000,800,0,0|7006|5|Fuel Tanker,7006|5 Taylor",
    description: "42.2550407,-83.274622",
    start_location: "42.2550407,-83.274622",
    start_latitude: 42.2550407,
    start_longitude: -83.274622,
    end_location: "42.2550407,-83.274622",
    end_latitude: 42.2550407,
    end_longitude: -83.274622,
    time_window_start: "2025-07-16 08:00:00 EDT",
    time_window_end: "2025-07-16 18:00:00 EDT",
    capacity: "[1, 1, 1, 1, 1]",
    alternative_capacities: "[[3800, 0, 0, 0, 0], [800, 3000, 0, 0, 0], [800, 0, 3000, 0, 0], [800, 0, 0, 3000, 0], [800, 0, 0, 0, 3000], [3000, 800, 0, 0, 0], [0, 3800, 0, 0, 0], [0, 800, 3000, 0, 0], [0, 800, 0, 3000, 0], [0, 800, 0, 0, 3000], [3000, 0, 800, 0, 0], [0, 3000, 800, 0, 0], [0, 0, 3800, 0, 0], [0, 0, 800, 3000, 0], [0, 0, 800, 0, 3000], [3000, 0, 0, 800, 0], [0, 3000, 0, 800, 0], [0, 0, 3000, 800, 0], [0, 0, 0, 3800, 0], [0, 0, 0, 800, 3000], [3000, 0, 0, 0, 800], [0, 3000, 0, 0, 800], [0, 0, 3000, 0, 800], [0, 0, 0, 3000, 800], [0, 0, 0, 0, 3800]]",
    skills: "",
    fixed_cost: 0,
    max_tasks: 0
  },
  {
    id: "1000,1000,0,0|7011|6|Fuel Tanker,7011|6 Taylor",
    description: "42.2550407,-83.274622",
    start_location: "42.2550407,-83.274622",
    start_latitude: 42.2550407,
    start_longitude: -83.274622,
    end_location: "42.2550407,-83.274622",
    end_latitude: 42.2550407,
    end_longitude: -83.274622,
    time_window_start: "2025-07-16 08:00:00 EDT",
    time_window_end: "2025-07-16 18:00:00 EDT",
    capacity: "[1, 1, 1, 1, 1]",
    alternative_capacities: "[[2000, 0, 0, 0, 0], [1000, 1000, 0, 0, 0], [1000, 0, 1000, 0, 0], [1000, 0, 0, 1000, 0], [1000, 0, 0, 0, 1000], [0, 2000, 0, 0, 0], [0, 1000, 1000, 0, 0], [0, 1000, 0, 1000, 0], [0, 1000, 0, 0, 1000], [0, 0, 2000, 0, 0], [0, 0, 1000, 1000, 0], [0, 0, 1000, 0, 1000], [0, 0, 0, 2000, 0], [0, 0, 0, 1000, 1000], [0, 0, 0, 0, 2000]]",
    skills: "",
    fixed_cost: 0,
    max_tasks: 0
  }
];

// Create CSV header
const header = "id,description,start_location,start_latitude,start_longitude,end_location,end_latitude,end_longitude,time_window_start,time_window_end,capacity,alternative_capacities,skills,fixed_cost,max_tasks\n";

// Create CSV content
let csvContent = header;

vehicles.forEach(vehicle => {
  const row = [
    `"${vehicle.id}"`,
    `"${vehicle.description}"`,
    `"${vehicle.start_location}"`,
    vehicle.start_latitude,
    vehicle.start_longitude,
    `"${vehicle.end_location}"`,
    vehicle.end_latitude,
    vehicle.end_longitude,
    `"${vehicle.time_window_start}"`,
    `"${vehicle.time_window_end}"`,
    `"${vehicle.capacity}"`,
    `"${vehicle.alternative_capacities}"`,
    `"${vehicle.skills}"`,
    vehicle.fixed_cost,
    vehicle.max_tasks
  ].join(',');
  
  csvContent += row + '\n';
});

// Write to file
fs.writeFileSync('vehicles-clean.csv', csvContent);
console.log('✅ Clean CSV file created: vehicles-clean.csv');
console.log(`📊 Created ${vehicles.length} vehicle records`); 