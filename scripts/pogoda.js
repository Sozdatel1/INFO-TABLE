async function updateWeather() {
  const url = 'https://api.open-meteo.com/v1/forecast?latitude=56.73&longitude=37.16&current_weather=true';

  try {
    const res = await fetch(url);
    const data = await res.json();
    
    const tVal = document.getElementById('t-val');
    const tStatus = document.getElementById('t-status');

    if (tVal && tStatus) {
       // Пробуем достать температуру разными путями
       const temp = data.current_weather ? data.current_weather.temperature : 
                    data.current ? data.current.temperature_2m : null;

       if (temp !== null) {
          const roundedTemp = Math.round(temp);
          tVal.innerText = (roundedTemp > 0 ? '+' : '') + roundedTemp + '°';
          tStatus.innerText = 'ДУБНА: ONLINE';
       } else {
          tStatus.innerText = 'ДАННЫЕ НЕ НАЙДЕНЫ';
       }
    }
  } catch (err) {
    document.getElementById('t-status').innerText = 'СЕТЬ: ERROR';
    console.error(err);
  }
}
window.addEventListener('load', updateWeather);
