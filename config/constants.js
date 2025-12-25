// constants.js
export const USER_ID = "user1";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export const SLOTS = ["Morning", "Afternoon", "Night"];

export const CELL_MAPPING = {
  "Monday_Morning": "cell1",
  "Monday_Afternoon": "cell2",
  "Monday_Night": "cell3",
  "Tuesday_Morning": "cell4",
  "Tuesday_Afternoon": "cell5",
  "Tuesday_Night": "cell6",
  "Wednesday_Morning": "cell7",
  "Wednesday_Afternoon": "cell8",
  "Wednesday_Night": "cell9",
  "Thursday_Morning": "cell10",
  "Thursday_Afternoon": "cell11",
  "Thursday_Night": "cell12",
  "Friday_Morning": "cell13",
  "Friday_Afternoon": "cell14",
  "Friday_Night": "cell15",
  "Saturday_Morning": "cell16",
  "Saturday_Afternoon": "cell17",
  "Saturday_Night": "cell18",
  "Sunday_Morning": "cell19",
  "Sunday_Afternoon": "cell20",
  "Sunday_Night": "cell21",
};

export const REVERSE_CELL_MAPPING = Object.fromEntries(
  Object.entries(CELL_MAPPING).map(([key, value]) => [value, key])
);