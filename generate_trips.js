const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "mock-server", "db.json");
const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

const exampleTrip1 = db.schedules.find((s) => s.id === "TRIP-1001");
const exampleTrip2 = db.schedules.find((s) => s.id === "TRIP-1002");
const exampleSchema1 = db.seatSchemas.find((s) => s.tripId === "TRIP-1001");
const exampleSchema2 = db.seatSchemas.find((s) => s.tripId === "TRIP-1002");

// Helper to format date to string in correct format
// 2025-11-29T08:30:00+03:00
function formatDate(dateObj, timeStr) {
  // timeStr is like "08:30:00"
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${timeStr}+03:00`;
}

// Generate dates for Dec 1 to Dec 7
const startDate = new Date("2025-12-01");
const endDate = new Date("2025-12-07");

let newSchedules = [];
let newSchemas = [];

for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
  const dateStr = d.toISOString().split("T")[0].replace(/-/g, "");

  // Trip 1
  const trip1Id = `TRIP-${dateStr}-1`;
  const newTrip1 = { ...exampleTrip1 };
  newTrip1.id = trip1Id;
  // Extract time from example
  // "2025-11-29T08:30:00+03:00" -> "08:30:00"
  const time1Dep = exampleTrip1.departure.split("T")[1].split("+")[0];
  const time1Arr = exampleTrip1.arrival.split("T")[1].split("+")[0];

  newTrip1.departure = formatDate(d, time1Dep);
  newTrip1.arrival = formatDate(d, time1Arr);
  newSchedules.push(newTrip1);

  if (exampleSchema1) {
    const newSchema1 = JSON.parse(JSON.stringify(exampleSchema1));
    newSchema1.id = trip1Id;
    newSchema1.tripId = trip1Id;
    newSchemas.push(newSchema1);
  }

  // Trip 2
  const trip2Id = `TRIP-${dateStr}-2`;
  const newTrip2 = { ...exampleTrip2 };
  newTrip2.id = trip2Id;
  const time2Dep = exampleTrip2.departure.split("T")[1].split("+")[0];
  const time2Arr = exampleTrip2.arrival.split("T")[1].split("+")[0];

  newTrip2.departure = formatDate(d, time2Dep);
  newTrip2.arrival = formatDate(d, time2Arr);
  newSchedules.push(newTrip2);

  if (exampleSchema2) {
    const newSchema2 = JSON.parse(JSON.stringify(exampleSchema2));
    newSchema2.id = trip2Id;
    newSchema2.tripId = trip2Id;
    newSchemas.push(newSchema2);
  }
}

db.schedules = [...db.schedules, ...newSchedules];
db.seatSchemas = [...db.seatSchemas, ...newSchemas];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(
  `Added ${newSchedules.length} trips and ${newSchemas.length} schemas.`
);
