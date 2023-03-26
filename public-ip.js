async function getPublicIPAddress() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Error fetching public IP:", error);
      return null;
    }
  }
  
  (async () => {
    const ipAddress = await getPublicIPAddress();
    if (ipAddress) {
      const publicIpElement = document.getElementById("public-ip");
      if (publicIpElement) {
        publicIpElement.textContent = ipAddress;
      }
    }
  })();
  