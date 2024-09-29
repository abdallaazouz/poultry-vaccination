// عناصر الـ DOM الأساسية
const vaccineTable = document.getElementById('vaccinationTable');
const tableBody = document.getElementById('tableBody');
const vaccineForm = document.getElementById('vaccinationForm');
const vaccineSelect = document.getElementById('vaccineSelect');

// تخزين التحصينات والتواريخ
let vaccines = {};
let allDates = []; // قائمة لتخزين التواريخ

// إضافة حدث للنموذج عند الإرسال
vaccineForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const vaccineName = document.getElementById('vaccineName').value;
    const vaccineType = document.getElementById('vaccineType').value;
    const vaccineDate = document.getElementById('vaccineDate').value;

    // التحقق من إدخال البيانات
    if (vaccineName && vaccineType && vaccineDate) {
        addVaccine(vaccineName, vaccineType, vaccineDate);
        addVaccineToDropdown(vaccineName);
        vaccineForm.reset(); // إعادة ضبط النموذج
    }
});

// إضافة تحصين جديد أو تحديث الموجود
function addVaccine(name, type, date) {
    const startDate = new Date(date);

    if (!vaccines[name]) {
        vaccines[name] = [];
    }

    // حساب التواريخ بناءً على نوع التحصين
    let protectionPeriod = [];

    if (type === 'live') {
        protectionPeriod = getProtectionPeriod(startDate, 3, 21); // التحصين الحي يبدأ بعد 3 أيام ويستمر 21 يوما
    } else if (type === 'dead') {
        protectionPeriod = getProtectionPeriod(startDate, 21, 60); // التحصين الميت يبدأ بعد 21 يوم ويستمر 60 يوما
    }

    // دمج التواريخ في كائن التحصينات
    vaccines[name].push({ type: type, dates: protectionPeriod });
    allDates.push(...protectionPeriod); // إضافة التواريخ إلى قائمة جميع التواريخ

    renderVaccinationSchedule();
}

// دالة لحساب فترة الحماية بناءً على عدد الأيام
function getProtectionPeriod(startDate, offset, duration) {
    let period = [];
    for (let i = offset; i <= offset + duration; i++) {
        let newDate = new Date(startDate);
        newDate.setDate(newDate.getDate() + i);
        period.push(formatDate(newDate));
    }
    return period;
}

// تنسيق التاريخ كـ YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// عرض الجدول بعد التحديث
function renderVaccinationSchedule() {
    tableBody.innerHTML = ''; // مسح محتويات الجدول

    // ترتيب جميع التواريخ بالتتابع
    const uniqueDates = [...new Set(allDates)].sort((a, b) => new Date(a) - new Date(b));

    // عرض جميع التواريخ بشكل تسلسلي
    uniqueDates.forEach(date => {
        const row = document.createElement('tr');
        const dateCell = document.createElement('td');
        dateCell.textContent = date;
        row.appendChild(dateCell);

        // إضافة خلية لكل تحصين
        Object.keys(vaccines).forEach(vaccineName => {
            const cell = document.createElement('td');
            const vaccineData = vaccines[vaccineName].find(entry => entry.dates.includes(date));

            if (vaccineData) {
                // حساب درجة اللون بناءً على الأيام
                let daysSinceStart = (new Date(date) - new Date(vaccineData.dates[0])) / (1000 * 60 * 60 * 24);
                let intensity;

                if (vaccineData.type === 'live') {
                    // يبدأ اللون الأخضر غامقًا ويخف تدريجياً من البداية
                    intensity = 55 + Math.floor((daysSinceStart / 21) * 200); // يبدأ غامقًا ثم يخف
                    cell.style.backgroundColor = `rgb(0, ${intensity}, 0)`; // اللون الأخضر المتدرج
                } else if (vaccineData.type === 'dead') {
                    // يبدأ اللون الأزرق غامقًا ويخف تدريجياً بعد 21 يوم
                    intensity = 55 + Math.floor((daysSinceStart / 60) * 200); // يبدأ غامقًا ثم يخف
                    cell.style.backgroundColor = `rgb(0, 0, ${intensity})`; // اللون الأزرق المتدرج
                }

                cell.textContent = vaccineName; // كتابة اسم التحصين داخل الخلية
            }

            row.appendChild(cell);
        });

        tableBody.appendChild(row); // إضافة الصف إلى الجدول
    });
}

// إضافة التحصين إلى القائمة المنسدلة
function addVaccineToDropdown(name) {
    if (![...vaccineSelect.options].some(option => option.value === name)) {
        const option = document.createElement('option');
        option.textContent = name;
        vaccineSelect.appendChild(option);
    }
}
