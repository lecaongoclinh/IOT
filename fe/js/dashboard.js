// Kết nối tới backend NestJS
const socket = io("http://localhost:3000"); 

const MAX_POINTS = 20; // giữ tối đa 100 điểm dữ liệu
// Biến kiểm tra trạng thái dữ liệu
let isDataLoaded = false;

// Hiển thị loading ban đầu
function showLoading() {
  ["temperature", "humidity", "light"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = "Loading...";
  });

  ["temperature-icon", "humidity-icon", "light-icon"].forEach(id => {
    const iconEl = document.getElementById(id);
    if (iconEl) iconEl.className = "bi bi-question-circle text-secondary"; // icon loading
  });
}
// Tạo chart với 3 dataset
const ctx = document.getElementById("sensorChart").getContext("2d");
const sensorChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Temperature (°C)",
        borderColor: "red",
        backgroundColor: "rgba(255,99,132,0.2)",
        data: [],
        fill: false,
        tension: 0.3,
      },
      {
        label: "Humidity (%)",
        borderColor: "blue",
        backgroundColor: "rgba(54,162,235,0.2)",
        data: [],
        fill: false,
        tension: 0.3,
      },
      {
        label: "Light (lux)",
        borderColor: "orange",
        backgroundColor: "rgba(255,206,86,0.2)",
        data: [],
        fill: false,
        tension: 0.3,
      },
    ],
  },
  options: {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      title: {
        display: true,
        text: "Biểu đồ theo dõi nhiệt độ - độ ẩm - ánh sáng",
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: "Time",
        },
      },
      y: {
        beginAtZero: true,
      },
    },
  },
});

// Cập nhật chart
function updateChart(temp, hum, light) {
  const now = new Date().toLocaleTimeString();

  sensorChart.data.labels.push(now);
  sensorChart.data.datasets[0].data.push(temp);
  sensorChart.data.datasets[1].data.push(hum);
  sensorChart.data.datasets[2].data.push(light);

  // Giữ max điểm
  if (sensorChart.data.labels.length > MAX_POINTS) {
    sensorChart.data.labels.shift();
    sensorChart.data.datasets.forEach((ds) => ds.data.shift());
  }

  sensorChart.update();
}
function animateBox(id) {
  const el = document.getElementById(id);
  el.classList.remove("pulse"); 
  void el.offsetWidth; // trick để restart animation
  el.classList.add("pulse");
}

function flashText(id) {
  const el = document.getElementById(id);
  el.classList.remove("flash"); 
  void el.offsetWidth; // trick restart animation
  el.classList.add("flash");
}
showLoading();
socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server");
});

socket.on("sensor_update", (data) => {
  console.log("📡 Sensor data:", data);
  isDataLoaded = true;
  // Update text
  document.getElementById("temperature").innerText = data.temperature;
  document.getElementById("humidity").innerText = data.humidity;
  document.getElementById("light").innerText = data.light;

  flashText("temperature");
  flashText("humidity");
  flashText("light");

  // === Update icons ===
  const tempIcon = document.getElementById("temperature-icon");
  const humIcon = document.getElementById("humidity-icon");
  const lightIcon = document.getElementById("light-icon");

  // 🌡 Nhiệt độ
  tempIcon.className = "bi"; // reset
  if (data.temperature > 30) {
    tempIcon.classList.add("bi-thermometer-sun", "text-danger"); // đỏ
  } else if (data.temperature < 20) {
    tempIcon.classList.add("bi-thermometer-snow", "text-primary"); // xanh
  } else {
    tempIcon.classList.add("bi-thermometer-half", "text-warning");
  }

  // 💧 Độ ẩm
  humIcon.className = "bi";
  if (data.humidity > 70) {
    humIcon.classList.add("bi-droplet-fill", "text-primary");
  } else if (data.humidity < 30) {
    humIcon.classList.add("bi-droplet-half", "text-secondary");
  } else {
    humIcon.classList.add("bi-droplet", "text-info");
  }

  // 💡 Ánh sáng
  lightIcon.className = "bi";

if (data.light < 200) {
  // Tối
  lightIcon.classList.add("bi-moon", "text-secondary");
} else if (data.light < 500) {
  // Ánh sáng yếu
  lightIcon.classList.add("bi-brightness-low", "text-primary");
} else if (data.light < 1000) {
  // Ánh sáng trung bình
  lightIcon.classList.add("bi-brightness-alt-high", "text-warning");
} else {
  // Ánh sáng mạnh
  lightIcon.classList.add("bi-brightness-high", "text-danger", "glow-effect");
}

  // Update chart
  updateChart(data.temperature, data.humidity, data.light);
});



document.querySelectorAll('.device-switch').forEach(switchEl => {
  switchEl.addEventListener('change', async function (e) {
    e.preventDefault();

    const card = this.closest('.control-card');
    const deviceId = card.getAttribute('data-id');
    // const deviceType = card.getAttribute('data-type'); // 👈 lấy loại thiết bị
    const targetState = this.checked ? 'on' : 'off';
    const icon = card.querySelector('.control-card-icon i');
    // const fanWrapper = document.getElementById('fanWrapper');
    const spinner = card.querySelector('.spinner-overlay');

    spinner.style.display = "flex"; // hiện spinner
    card.classList.add("loading");
    // Chặn đổi ngay
    this.checked = !this.checked;

    try {
      const res = await fetch(`http://localhost:3000/device/control`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: deviceId, action: targetState })
      }); 

      const data = await res.json();

      if (data.success) {
        this.checked = (targetState === 'on');
        
        if (deviceId === '1') {
          if (targetState === 'on') {
            icon.classList.remove('bi-lightbulb-off');
            icon.classList.add('bi-lightbulb');
            icon.style.color = "yellow";
            card.classList.remove("loading");
            spinner.style.display = "none"; // ẩn spinner
          } else {
            icon.classList.remove('bi-lightbulb');
            icon.classList.add('bi-lightbulb-off');
            icon.style.color = "";
            card.classList.remove("loading");
            spinner.style.display = "none"; // ẩn spinner
          }
        } 
        
        else if (deviceId === '3') {
          if (targetState === 'on') {
            icon.classList.add('spin'); // quay
            icon.style.color = "green";
            card.classList.remove("loading");
            spinner.style.display = "none"; // ẩn spinner
          } else {
            icon.classList.remove('spin'); // dừng
            icon.style.color = "";
            card.classList.remove("loading");
            spinner.style.display = "none"; // ẩn spinner
          }
        }
      else if (deviceId === '2') {
        const acIcon = document.getElementById('ac-icon'); // lấy phần tử icon điều hòa
        if (targetState === 'on') {
          let frame = 1;
          // clear vòng lặp cũ nếu có
          if (window.acInterval) clearInterval(window.acInterval);
          // đặt ảnh đầu tiên
          acIcon.innerHTML = `<img id="acImg" src="image/air_on_1.png" alt="AC Icon" width="64" height="64">`;
          // bắt đầu vòng lặp đổi ảnh (không nháy)
          window.acInterval = setInterval(() => {
            frame = frame === 1 ? 2 : 1;
            const img = document.getElementById('acImg');
            if (img) {
              img.src = `image/air_on_${frame}.png`;
            }
          }, 500); // tốc độ chuyển frame (ms)
          card.classList.remove("loading");
        } else {
          // khi tắt thì dừng animation và đổi sang ảnh off
          if (window.acInterval) clearInterval(window.acInterval);
          acIcon.innerHTML = `<img src="image/air_off.png" alt="AC Icon" width="64" height="64">`;
          card.classList.remove("loading");
        }
      }

      console.log(`✅ Thiết bị ${deviceId} đã ${targetState}`);
      } else {
        alert(`❌ ESP32 không phản hồi hoặc lỗi khi điều khiển thiết bị ${deviceId}`);
        card.classList.remove("loading");
      }
    } catch (err) {
      console.error(err);
      alert("🚨 Lỗi kết nối server!");
    }
  });
});

async function fetchDevicesStatus(){
  try{
    const res = await fetch('http://localhost:3000/device/status',{
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const devices = await res.json();
    console.log("📡 Device statuses:", devices);

    devices.forEach(device => {
      const card = document.querySelector(`.control-card[data-id='${device.id}']`);
      if (!card) return; // nếu không tìm thấy card thì bỏ qua
      card.classList.add("loading");
      const switchEl = card.querySelector('.device-switch');
      const icon = card.querySelector('.control-card-icon i');
      const deviceId = device.id;
      const status = device.status;
      const spinner = card.querySelector('.spinner-overlay');
      // Cập nhật trạng thái switch
      switchEl.checked = (status === 'on'); 
      if (deviceId === '1') {
          if (status === 'on') {
            icon.classList.remove('bi-lightbulb-off');
            icon.classList.add('bi-lightbulb');
            icon.style.color = "yellow";
            card.classList.remove("loading");
            
            spinner.style.display = "none"; // ẩn spinner
          } else {
            icon.classList.remove('bi-lightbulb');
            icon.classList.add('bi-lightbulb-off');
            icon.style.color = "";
            card.classList.remove("loading");
            spinner.style.display = "none"; // ẩn spinner
          }
        } 
        
        else if (deviceId === '3') {
          if (status === 'on') {
            icon.classList.add('spin'); // quay
            icon.style.color = "green";
            card.classList.remove("loading");
            spinner.style.display = "none"; // ẩn spinner
          } else {
            icon.classList.remove('spin'); // dừng
            icon.style.color = "";
            card.classList.remove("loading");
            spinner.style.display = "none"; // ẩn spinner
          }
        }
      else if (deviceId === '2') {
        const acIcon = document.getElementById('ac-icon'); // lấy phần tử icon điều hòa
        if (status === 'on') {
          let frame = 1;
          // clear vòng lặp cũ nếu có
          if (window.acInterval) clearInterval(window.acInterval);
          // đặt ảnh đầu tiên
          acIcon.innerHTML = `<img id="acImg" src="image/air_on_1.png" alt="AC Icon" width="64" height="64">`;
          // bắt đầu vòng lặp đổi ảnh (không nháy)
          window.acInterval = setInterval(() => {
            frame = frame === 1 ? 2 : 1;
            const img = document.getElementById('acImg');
            if (img) {
              img.src = `image/air_on_${frame}.png`;
            }
          }, 500); // tốc độ chuyển frame (ms)
          card.classList.remove("loading");
        } else {
          // khi tắt thì dừng animation và đổi sang ảnh off
          if (window.acInterval) clearInterval(window.acInterval);
          acIcon.innerHTML = `<img src="image/air_off.png" alt="AC Icon" width="64" height="64">`;
          card.classList.remove("loading");
          spinner.style.display = "none"; // ẩn spinner
        }
      }
    });
  } catch(err){
    console.error(err);
    alert("🚨 Lỗi kết nối server!");
  }
}

window.addEventListener('DOMContentLoaded', () =>{
  fetchDevicesStatus();
});

async function showLoading(){
  document.querySelectorAll('.control-card').forEach(card => {
    const spinner = card.querySelector('.spinner-overlay');
    spinner.style.display = "flex"; // hiện spinner
    card.classList.add("loading");
  })
}