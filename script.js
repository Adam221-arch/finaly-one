// إعدادات Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "water-monitoring-d5d6d.firebaseapp.com",
    databaseURL: "https://water-monitoring-d5d6d-default-rtdb.firebaseio.com/",
    projectId: "water-monitoring-d5d6d",
    storageBucket: "water-monitoring-d5d6d.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// تهيئة Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// بيانات افتراضية
let phData = [];
let tdsData = [];
let labels = [];

// إنشاء الرسم البياني
const ctx = document.getElementById('sensor-chart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
                label: 'مستوى الـ pH',
                data: phData,
                borderColor: 'rgba(75, 192, 192, 1)',
                fill: false
            },
            {
                label: 'عكورة المياه (TDS)',
                data: tdsData,
                borderColor: 'rgba(255, 99, 132, 1)',
                fill: false
            }
        ]
    },
    options: {
        scales: {
            y: { beginAtZero: true }
        },
        animation: {
            duration: 1000,
            easing: 'easeInOutQuad'
        }
    }
});

// دالة لتحديث البيانات من Firebase
const turbidityRef = db.ref('turbidity');
turbidityRef.limitToLast(1).on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        const key = Object.keys(data)[0];
        const latestData = data[key];

        const newPhValue = latestData.ph || "غير متوفر";
        const newTdsValue = latestData.turbidity;

        // تحديث الجدول
        document.getElementById('ph-value').textContent = newPhValue;
        document.getElementById('tds-value').textContent = newTdsValue + '%';

        // تنبيه إذا كانت القيم خارج النطاق الآمن
        if (newPhValue < 6 || newPhValue > 8) {
            alert('تحذير: مستوى الـ pH خارج النطاق الآمن!');
        }
        if (newTdsValue > 300) {
            alert('تحذير: مستوى العكارة مرتفع!');
        }

        // تحديث الرسم البياني
        labels.push(new Date().toLocaleTimeString());
        phData.push(newPhValue);
        tdsData.push(newTdsValue);

        if (labels.length > 10) {
            labels.shift();
            phData.shift();
            tdsData.shift();
        }

        chart.update();
    }
});

// تبديل الوضع الليلي
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

// تصدير البيانات
document.getElementById('export-data').addEventListener('click', () => {
    const data = {
        labels: labels,
        phData: phData,
        tdsData: tdsData
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sensor-data.json';
    a.click();
});