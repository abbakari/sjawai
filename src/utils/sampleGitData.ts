// Sample GIT data structure - cleaned of mock data
export const sampleGitData: any[] = [];

// Function to initialize sample data if no GIT data exists
export const initializeSampleGitData = () => {
  const existingData = localStorage.getItem('git_eta_data');
  if (!existingData || JSON.parse(existingData).length === 0) {
    console.log('No existing GIT data found');
    localStorage.setItem('git_eta_data', JSON.stringify([]));
    return true;
  }
  return false;
};
