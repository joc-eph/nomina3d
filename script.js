// JavaScript logic for the calculation
const days = ['Sábado', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
const tableBody = document.getElementById('horario-table').querySelector('tbody');
const salarioInput = document.getElementById('salario-diario');
const totalHorasNormalesEl = document.getElementById('total-horas-normales');
const totalHorasExtrasEl = document.getElementById('total-horas-extras');
const pagoSemanalEl = document.getElementById('pago-semanal-resultado');

// Function to convert 12-hour AM/PM to 24-hour format
function convertTo24Hour(hour, period) {
    if (period === 'PM' && hour !== 12) {
        return hour + 12;
    } else if (period === 'AM' && hour === 12) {
        return 0;
    }
    return hour;
}

// Function to calculate hour difference based on hours, minutes, and AM/PM
function calculateHours(startHour, startMinute, startPeriod, endHour, endMinute, endPeriod) {
    const start24Hour = convertTo24Hour(startHour, startPeriod);
    const end24Hour = convertTo24Hour(endHour, endPeriod);

    let startTotalMinutes = (start24Hour * 60) + startMinute;
    let endTotalMinutes = (end24Hour * 60) + endMinute;

    if (endTotalMinutes < startTotalMinutes) {
        // If end time is on the next day
        endTotalMinutes += 24 * 60;
    }

    const diffMinutes = endTotalMinutes - startTotalMinutes;
    return diffMinutes / 60;
}

// Function to update the calculations
function updateCalculations() {
    let totalNormalHours = 0;
    let totalExtraHours = 0;
    let totalWeeklyPay = 0;
    const salarioDiario = parseFloat(salarioInput.value);
    
    // Check if a salary value has been entered
    const isSalarioEntered = !isNaN(salarioDiario) && salarioDiario > 0;
    const hourValue = isSalarioEntered ? salarioDiario / 8 : 0;

    days.forEach((day, index) => {
        const entradaHoraSelect = document.getElementById(`entrada-hora-${index}`);
        const salidaHoraSelect = document.getElementById(`salida-hora-${index}`);
        
        const horasNormalesCell = document.getElementById(`horas-normales-${index}`);
        const horasExtrasCell = document.getElementById(`horas-extras-${index}`);
        const pagoDiarioCell = document.getElementById(`pago-diario-${index}`);
        
        // If either entrada or salida hour is not selected, skip this day's calculation
        if (!entradaHoraSelect.value || !salidaHoraSelect.value) {
            horasNormalesCell.textContent = "0";
            horasExtrasCell.textContent = "0";
            pagoDiarioCell.textContent = "---";
            return; // Skip to the next iteration of the loop
        }

        const entradaHora = parseInt(entradaHoraSelect.value);
        const entradaMinuto = parseInt(document.getElementById(`entrada-minuto-${index}`).value);
        const entradaPeriodo = document.getElementById(`entrada-periodo-${index}`).value;
        const salidaHora = parseInt(salidaHoraSelect.value);
        const salidaMinuto = parseInt(document.getElementById(`salida-minuto-${index}`).value);
        const salidaPeriodo = document.getElementById(`salida-periodo-${index}`).value;

        let dailyNormalHours = 0;
        let dailyExtraHours = 0;
        let dailyPay = 0;
        let dailyTotalHours = 0;

        let workedHours = calculateHours(entradaHora, entradaMinuto, entradaPeriodo, salidaHora, salidaMinuto, salidaPeriodo);
        
        // Subtract 30 minutes for break, only if worked more than 30 minutes
        if (workedHours > 0.5) {
            workedHours -= 0.5;
        }
        dailyTotalHours = Math.max(0, workedHours);

        // Calculate daily pay based on the day
        if (day === 'Sábado') {
            // All Saturday hours are extra hours, regardless of the amount.
            dailyNormalHours = 0;
            dailyExtraHours = dailyTotalHours;
            const saturdayExtraHourValue = hourValue * 1.5;
            dailyPay = dailyExtraHours * saturdayExtraHourValue;
        } else {
            // Original logic for other days
            if (dailyTotalHours > 8) {
                dailyNormalHours = 8;
                dailyExtraHours = dailyTotalHours - 8;
            } else {
                dailyNormalHours = dailyTotalHours;
                dailyExtraHours = 0;
            }
            const extraHourValue = hourValue * 1.5;
            dailyPay = (dailyNormalHours * hourValue) + (dailyExtraHours * extraHourValue);
        }

        horasNormalesCell.textContent = dailyNormalHours.toFixed(2);
        horasExtrasCell.textContent = dailyExtraHours.toFixed(2);
        
        // Display daily pay, or a placeholder if no salary is entered
        if (isSalarioEntered) {
          pagoDiarioCell.textContent = `$${dailyPay.toFixed(2)}`;
          totalWeeklyPay += dailyPay;
        } else {
          pagoDiarioCell.textContent = "---";
        }

        totalNormalHours += dailyNormalHours;
        totalExtraHours += dailyExtraHours;
    });
    
    // Show total results
    totalHorasNormalesEl.textContent = totalNormalHours.toFixed(2) + " h";
    totalHorasExtrasEl.textContent = totalExtraHours.toFixed(2) + " h";
    
    // Display total weekly pay, or a placeholder if no salary is entered
    if (isSalarioEntered) {
      pagoSemanalEl.textContent = `$${totalWeeklyPay.toFixed(2)}`;
    } else {
      pagoSemanalEl.textContent = "---";
    }
}

// Generate the table dynamically
days.forEach((day, index) => {
    const rowClass = index % 2 === 0 ? '' : 'alternate-row';
    let hourOptions = '<option value="" disabled selected>--</option>';
    for (let i = 1; i <= 12; i++) {
        hourOptions += `<option value="${i}">${i}</option>`;
    }
    
    let minuteOptions = '<option value="" disabled selected>--</option>';
    for (let i = 0; i < 60; i++) {
        const minute = String(i).padStart(2, '0');
        minuteOptions += `<option value="${i}">${minute}</option>`;
    }

    const row = document.createElement('tr');
    row.className = rowClass;
    row.innerHTML = `
        <td class="font-semibold text-gray-700">${day}</td>
        <td>
            <div class="time-selects">
                <select id="entrada-hora-${index}">${hourOptions}</select>:<select id="entrada-minuto-${index}">${minuteOptions}</select>
                <select id="entrada-periodo-${index}"><option value="AM">AM</option><option value="PM">PM</option></select>
            </div>
        </td>
        <td>
            <div class="time-selects">
                <select id="salida-hora-${index}">${hourOptions}</select>:<select id="salida-minuto-${index}">${minuteOptions}</select>
                <select id="salida-periodo-${index}"><option value="AM">AM</option><option value="PM" selected>PM</option></select>
            </div>
        </td>
        <td id="horas-normales-${index}">0</td>
        <td id="horas-extras-${index}">0</td>
        <td id="pago-diario-${index}">---</td>
    `;
    tableBody.appendChild(row);
});

// Add listeners to detect changes in inputs
document.querySelectorAll('select').forEach(select => {
    select.addEventListener('change', updateCalculations);
});
salarioInput.addEventListener('input', updateCalculations);

// Initial call to set up the view
updateCalculations();
