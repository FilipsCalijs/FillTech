
import fetch from 'node-fetch';


const WAVESPEED_API_KEY = "42bc1d7b21721fdbec8ec041afe267575edebe8b79d2a833dac43be8ed211624"; // Your API Key created in Access Keys

const runModel = async () => {
  if (!WAVESPEED_API_KEY) {
    console.error("Your API_KEY is not set, you can check it in Access Keys");
    return;
  }
  const url = "https://api.wavespeed.ai/api/v3/google/nano-banana-pro/edit";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${WAVESPEED_API_KEY}`
  };
const payload = {
  prompt: "Transform the woman into a stylized GTA-style game character, with a bold cartoon look, sharp shadows, vibrant colors, and a dramatic urban background inspired by Grand Theft Auto loading screen art.",
  images: [
    "https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg?semt=ais_hybrid&w=740&q=80"
  ],
  resolution: "1k",
  output_format: "png",
  enable_sync_mode: false,
  enable_base64_output: false
};
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(payload)
    });
    
    if (response.ok) {
      const result = await response.json();
      const requestId = result.data.id;
      console.log(`Task submitted successfully. Request ID: ${requestId}`);
        
      while (true) {  
        const response = await fetch(
          `https://api.wavespeed.ai/api/v3/predictions/${requestId}/result`, 
          { 
            headers: {
            "Authorization": `Bearer ${WAVESPEED_API_KEY}`
          } 
        });
        const result = await response.json();

        if (response.ok) {
          const data = result.data;
          const status = data.status;

          if (status === "completed") {
            const resultUrl = data.outputs[0];
            console.log("Task completed. URL:", resultUrl);
            break;
          } else if (status === "failed") {
            console.error("Task failed:", data.error);
            break;
          } else {
            console.log("Task still processing. Status:", status);
          }
        } else {
          console.error("Error:", response.status, JSON.stringify(result));
          break;
        }

        await new Promise(resolve => setTimeout(resolve, 0.1 * 1000));
      }
    } else {
      console.error(`Error: ${response.status}, ${await response.text()}`);
    }
  } catch (error) {
    console.error(`Request failed: ${error}`);
  }
};

runModel();
