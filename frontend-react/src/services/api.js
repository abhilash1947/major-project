import axios from 'axios';

const JAVA_API_BASE = 'http://localhost:8080/api/v1';
const PYTHON_API_BASE = 'http://localhost:8000/api/v1';

// Train endpoints
export const fetchTrains = async () => {
  try {
    const response = await axios.get(`${JAVA_API_BASE}/trains`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch trains: ' + error.message);
  }
};

export const fetchTrainById = async (trainId) => {
  try {
    const response = await axios.get(`${JAVA_API_BASE}/trains/${trainId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch train ${trainId}: ` + error.message);
  }
};

// Segment endpoints
export const fetchSegments = async () => {
  try {
    const response = await axios.get(`${JAVA_API_BASE}/segments`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch segments: ' + error.message);
  }
};

// Simulation endpoints (Python)
export const initializeSimulation = async (config) => {
  try {
    const response = await axios.post(`${PYTHON_API_BASE}/simulation/init`, config);
    return response.data;
  } catch (error) {
    throw new Error('Failed to initialize simulation: ' + error.message);
  }
};

export const runSimulation = async (steps) => {
  try {
    const response = await axios.post(`${PYTHON_API_BASE}/simulation/run`, null, {
      params: { steps }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to run simulation: ' + error.message);
  }
};

export const stopSimulation = async () => {
  try {
    const response = await axios.post(`${PYTHON_API_BASE}/simulation/stop`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to stop simulation: ' + error.message);
  }
};

export const resolveDisruption = async (segmentId) => {
  try {
    const response = await axios.post(`${PYTHON_API_BASE}/simulation/resolve`, null, {
      params: { segment_id: segmentId }
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to resolve disruption: ' + error.message);
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${JAVA_API_BASE}/health`);
    return response.data;
  } catch (error) {
    throw new Error('Health check failed: ' + error.message);
  }
};
