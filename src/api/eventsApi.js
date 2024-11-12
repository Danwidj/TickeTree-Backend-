import axios from "axios";

export const fetchEvents = async (params = {}) => {
  try {
    const response = await axios.get("http://localhost:5001/api/events", {
      params: {
        ...params,
      },
    });
    const events = response.data.events; 
    let result = [];
    for (let key in events) {
      result.push(events[key]);
    }
    return result;
    
  } catch (error) {
    console.error("Error fetching events:", error.message);
    throw error;
  }
};
