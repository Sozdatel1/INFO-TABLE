export default async function handler(request, response) {
  try {
    // Пингуем твой сервер на Render
    const res = await fetch('https://pro-info-api.onrender.com');
    const status = res.status;
    
    return response.status(200).json({ 
      success: true, 
      message: `Render pinged with status: ${status}` 
    });
  } catch (error) {
    return response.status(500).json({ success: false, error: error.message });
  }
}
