export default async function handler(req, res) {
  try {
    // Стучимся на твой Render, чтобы он не спал
    const response = await fetch('https://onrender.com');
    
    res.status(200).json({
      success: true,
      message: `Render pinged! Status: ${response.status}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
